import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';
import { Calendar } from 'lucide-react-native';

type Assignment = {
  sessions: {
    id: string;
    pet_id: string;
    start_date: string;
    end_date: string;
    pets: { name: string | null };
  };
};

export default function AgentDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('session_agents')
        .select('sessions(id,pet_id,start_date,end_date,pets(name))')
        .eq('fur_agent_id', user.id);
      setAssignments(data || []);
    };
    load();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Today's Assignments</Text>
      <FlatList
        data={assignments}
        keyExtractor={(i) => i.sessions.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Calendar color="#FF6B6B" size={18} />
            <Text style={styles.cardText}>{item.sessions.pets?.name ?? 'Pet'} • {item.sessions.start_date} → {item.sessions.end_date}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No assignments for today.</Text>}
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
  cardText: { fontSize: 15, fontWeight: '600' },
  empty: { textAlign: 'center', color: '#64748B', marginTop: 24 },
});


