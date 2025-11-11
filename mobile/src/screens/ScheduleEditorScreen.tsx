import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { colors } from '../theme/colors';

type Props = { route: any; navigation: any };

const ACTIVITIES = ['feed', 'walk', 'letout'] as const;
const PERIODS = ['morning', 'afternoon', 'evening'] as const;

export default function ScheduleEditorScreen({ route, navigation }: Props) {
  const { petId } = route.params;
  const [scheduleId, setScheduleId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSchedule();
  }, [petId]);

  const loadSchedule = async () => {
    const { data } = await supabase
      .from('schedules')
      .select('id, schedule_times(id, activity_type, time_period)')
      .eq('pet_id', petId)
      .single();
    if (data) {
      setScheduleId(data.id);
      const map: Record<string, boolean> = {};
      data.schedule_times?.forEach((t: any) => {
        map[`${t.activity_type}_${t.time_period}`] = true;
      });
      setSelected(map);
    } else {
      setScheduleId(null);
      setSelected({});
    }
  };

  const toggle = (activity: string, period: string) => {
    const key = `${activity}_${period}`;
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const save = async () => {
    setSaving(true);
    try {
      let id = scheduleId;
      if (!id) {
        const { data, error } = await supabase.from('schedules').insert({ pet_id: petId }).select('id').single();
        if (error) throw error;
        id = data.id;
        setScheduleId(id);
      }
      // Clear existing
      await supabase.from('schedule_times').delete().eq('schedule_id', id!);
      // Insert selected
      const rows = Object.entries(selected)
        .filter(([, v]) => v)
        .map(([k]) => {
          const [activity_type, time_period] = k.split('_');
          return { schedule_id: id!, activity_type, time_period };
        });
      if (rows.length > 0) {
        const { error } = await supabase.from('schedule_times').insert(rows);
        if (error) throw error;
      }
      Alert.alert('Saved', 'Daily schedule updated.');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Schedule</Text>
      {PERIODS.map((period) => (
        <View key={period} style={styles.periodBlock}>
          <Text style={styles.periodTitle}>{period.charAt(0).toUpperCase() + period.slice(1)}</Text>
          <View style={styles.row}>
            {ACTIVITIES.map((a) => {
              const key = `${a}_${period}`;
              const active = !!selected[key];
              return (
                <TouchableOpacity key={key} onPress={() => toggle(a, period)} style={[styles.chip, active && styles.chipActive]}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{a}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}

      <TouchableOpacity disabled={saving} style={styles.primaryButton} onPress={save}>
        <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'Save Schedule'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 16 },
  periodBlock: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  periodTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8 },
  chip: { borderWidth: 2, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  chipText: { color: colors.textMuted, fontWeight: '600' },
  chipTextActive: { color: colors.primary },
  primaryButton: { height: 52, backgroundColor: colors.primary, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
});


