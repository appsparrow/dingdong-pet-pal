import { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform, TextInput, Alert, FlatList } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../lib/supabase';
import { colors } from '../theme/colors';

type Props = {
  visible: boolean;
  onClose: () => void;
  petId: string;
  onCreated: () => void;
  session?: any; // if provided, modal is in edit mode
};

export function CreateSessionModal({ visible, onClose, petId, onCreated, session }: Props) {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date(Date.now() + 6 * 24 * 60 * 60 * 1000));
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<any[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<any[]>([]);

  useEffect(() => {
    if (visible) {
      if (session) {
        setStartDate(new Date(session.start_date));
        setEndDate(new Date(session.end_date));
        setNotes(session.notes ?? '');
      } else {
        const today = new Date();
        setStartDate(today);
        setEndDate(new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000));
        setNotes('');
      }
    }
  }, [visible]);

  useEffect(() => {
    const t = setTimeout(() => { void searchAgents(); }, 300);
    return () => clearTimeout(t);
  }, [search, visible]);

  const searchAgents = async () => {
    if (!visible) return;
    if (!search || search.length < 2) {
      setOptions([]);
      return;
    }
    const { data } = await supabase
      .from('profiles')
      .select('id,name,email,role')
      .eq('role', 'fur_agent')
      .ilike('email', `%${search}%`)
      .limit(5);
    setOptions(data || []);
  };

  const toggleAgent = (agent: any) => {
    setSelectedAgents((prev) => {
      const exists = prev.find((a) => a.id === agent.id);
      if (exists) return prev.filter((a) => a.id !== agent.id);
      return [...prev, agent];
    });
  };

  const createSession = async () => {
    setSaving(true);
    try {
      console.log('=== CREATE SESSION DEBUG ===');
      console.log('Selected agents:', selectedAgents);
      console.log('Selected agents count:', selectedAgents.length);
      console.log('============================');
      
      const status = computeStatus(startDate, endDate);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      if (session) {
        // edit
        const { error } = await supabase
          .from('sessions')
          .update({
            start_date: startDate.toISOString().slice(0, 10),
            end_date: endDate.toISOString().slice(0, 10),
            status,
            notes: notes || null,
          })
          .eq('id', session.id);
        if (error) throw error;
        // reset assignments
        await supabase.from('session_agents').delete().eq('session_id', session.id);
        if (selectedAgents.length > 0) {
          await supabase.from('session_agents').insert(
            selectedAgents.map((a) => ({ session_id: session.id, fur_agent_id: a.id }))
          );
        }
      } else {
        // create
        const { data: created, error } = await supabase.from('sessions').insert({
          pet_id: petId,
          fur_boss_id: user.id,
          start_date: startDate.toISOString().slice(0, 10),
          end_date: endDate.toISOString().slice(0, 10),
          status,
          notes: notes || null,
        }).select('id').single();
        if (error) throw error;
        console.log('Session created:', created);
        if (selectedAgents.length > 0 && created?.id) {
          const agentInserts = selectedAgents.map((a) => ({ session_id: created.id, fur_agent_id: a.id }));
          console.log('Inserting agents:', agentInserts);
          const { data: agentData, error: agentError } = await supabase.from('session_agents').insert(agentInserts);
          console.log('Agent insert result:', agentData, 'Error:', agentError);
        } else {
          console.log('No agents to assign or no session ID');
        }
      }
      onCreated();
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to save session');
    } finally {
      setSaving(false);
    }
  };

  const computeStatus = (start: Date, end: Date) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const s = start.toISOString().slice(0, 10);
    const e = end.toISOString().slice(0, 10);
    if (todayStr < s) return 'planned';
    if (todayStr > e) return 'completed';
    return 'active';
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{session ? 'Edit Session' : 'Create Session'}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Start</Text>
            <DateTimePicker value={startDate} onChange={(_, d) => d && setStartDate(d)} mode="date" />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>End</Text>
            <DateTimePicker value={endDate} onChange={(_, d) => d && setEndDate(d)} mode="date" />
          </View>
          <Text style={[styles.label, { marginTop: 8 }]}>Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Special instructions"
            style={styles.input}
            multiline
            numberOfLines={3}
          />
          <Text style={[styles.label, { marginTop: 8 }]}>Assign Agents</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by email"
            style={styles.input}
          />
          {options.length > 0 && (
            <FlatList
              data={options}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const active = selectedAgents.some((a) => a.id === item.id);
                return (
                  <TouchableOpacity onPress={() => toggleAgent(item)} style={[styles.agentItem, active && styles.agentItemActive]}>
                    <Text style={[styles.agentText, active && styles.agentTextActive]}>{item.name || item.email}</Text>
                  </TouchableOpacity>
                );
              }}
              style={{ maxHeight: 140, marginBottom: 8 }}
            />
          )}
          {selectedAgents.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {selectedAgents.map((a) => (
                <View key={a.id} style={styles.agentChip}>
                  <Text style={styles.agentChipText}>{a.name || a.email}</Text>
                </View>
              ))}
            </View>
          )}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={[styles.cancelButton, { flex: 1 }]} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity disabled={saving} style={[styles.primaryButton, { flex: 1 }]} onPress={createSession}>
              <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : session ? 'Save Changes' : 'Create Session'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 28 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 16, color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  label: { fontSize: 16, color: colors.text },
  input: { borderWidth: 2, borderColor: colors.border, borderRadius: 12, padding: 12, textAlignVertical: 'top' },
  primaryButton: { height: 52, backgroundColor: colors.primary, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  cancelButton: { height: 52, backgroundColor: '#f3f4f6', borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  cancelButtonText: { color: colors.textMuted, fontWeight: '600' },
  agentItem: { paddingVertical: 10, paddingHorizontal: 12, borderWidth: 2, borderColor: colors.border, borderRadius: 12, marginBottom: 6 },
  agentItemActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  agentText: { color: colors.text },
  agentTextActive: { color: colors.primary, fontWeight: '700' },
  agentChip: { backgroundColor: colors.accent + '15', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14 },
  agentChipText: { color: colors.accent, fontWeight: '700' },
});


