import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';
import { Dog } from 'lucide-react-native';

type Pet = {
  id: string;
  name: string;
  pet_type: string | null;
  photo_url: string | null;
};

export default function BossDashboard({ navigation }: any) {
  const [pets, setPets] = useState<Pet[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('pets').select('id,name,pet_type,photo_url').eq('fur_boss_id', user.id).order('created_at', { ascending: false });
      setPets(data || []);
    };
    load();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Pets</Text>
      <FlatList
        data={pets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('PetDetail', { petId: item.id })}>
            <Dog color="#FF6B6B" size={20} />
            <Text style={styles.cardTitle}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No pets yet. Add one from Profile.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  empty: { textAlign: 'center', color: '#64748B', marginTop: 24 },
});


