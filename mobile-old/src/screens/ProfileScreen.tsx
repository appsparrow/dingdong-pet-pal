import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { supabase } from '../lib/supabase';
import { PawPrint, Plus } from 'lucide-react-native';

type Pet = { id: string; name: string };

export default function ProfileScreen() {
  const [name, setName] = useState<string>('');
  const [pets, setPets] = useState<Pet[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from('profiles').select('name').eq('id', user.id).single();
      setName(profile?.name || '');
      const { data: petData } = await supabase
        .from('pets')
        .select('id,name')
        .eq('fur_boss_id', user.id)
        .order('created_at', { ascending: false });
      setPets(petData || []);
    };
    load();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>{name}</Text>
      <Text style={styles.section}>My Pets</Text>
      <FlatList
        data={pets}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.petRow}>
            <PawPrint color="#4ECDC4" size={18} />
            <Text style={styles.petName}>{item.name}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No pets yet. Add one from the web app for now.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#64748B', marginBottom: 16 },
  section: { fontSize: 16, fontWeight: '700', marginBottom: 8, marginTop: 8 },
  petRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  petName: { fontSize: 15, fontWeight: '600' },
  empty: { textAlign: 'center', color: '#64748B', marginTop: 24 },
});


