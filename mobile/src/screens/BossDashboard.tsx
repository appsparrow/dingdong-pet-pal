import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import { colors } from '../theme/colors';
import { AddPetModal } from '../components/AddPetModal';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function BossDashboard({ navigation }: any) {
  const [pets, setPets] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    loadUser();
  }, []);
  useFocusEffect(useCallback(() => { loadUser(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUser();
    setRefreshing(false);
  };

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      loadPets(user.id);
      loadProfile(user.id);
      loadSessions(user.id);
    }
  };
  
  const loadSessions = async (userId: string) => {
    const { data } = await supabase
      .from('sessions')
      .select('*, pets(name), session_agents(fur_agent_id, profiles(name))')
      .eq('fur_boss_id', userId)
      .order('created_at', { ascending: false });
    console.log('Boss sessions:', data);
    setSessions(data || []);
  };

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data);
  };

  const loadPets = async (userId: string) => {
    const { data } = await supabase
      .from('pets')
      .select('*')
      .eq('fur_boss_id', userId)
      .order('created_at', { ascending: false });
    setPets(data || []);
  };

  const getPetIcon = (petType: string | null) => {
    switch (petType) {
      case 'dog': return '🐶';
      case 'cat': return '🐱';
      case 'fish': return '🐠';
      case 'bird': return '🐦';
      case 'rabbit': return '🐰';
      case 'turtle': return '🐢';
      case 'hamster': return '🐭';
      default: return '🐾';
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
    >
      {/* Header with Gradient */}
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={styles.greeting}>Welcome back! 👋</Text>
        <Text style={styles.name}>{profile?.name || user?.email?.split('@')[0]}</Text>
      </LinearGradient>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{pets.length}</Text>
          <Text style={styles.statLabel}>My Pets</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{sessions.filter(s => s.status === 'active').length}</Text>
          <Text style={styles.statLabel}>Active Sessions</Text>
        </View>
      </View>

      {/* My Pets Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Pets</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setAddOpen(true)}>
            <Text style={styles.addButtonText}>+ Add Pet</Text>
          </TouchableOpacity>
        </View>

        {pets.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🐕</Text>
            <Text style={styles.emptyTitle}>No pets yet</Text>
            <Text style={styles.emptyText}>Add your first furry friend to get started!</Text>
          </View>
        ) : (
          <View style={styles.petGrid}>
            {pets.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={styles.petCard}
                onPress={() => navigation.navigate('PetDetail', { petId: pet.id })}
              >
                <LinearGradient
                  colors={[`${colors.primary}20`, `${colors.secondary}20`]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.petCardGradient}
                >
                  <View style={styles.petIconContainer}>
                    {pet.photo_url ? (
                      <Text style={styles.petPhoto}>📷</Text>
                    ) : (
                      <Text style={styles.petIcon}>{getPetIcon(pet.pet_type)}</Text>
                    )}
                  </View>
                  <Text style={styles.petName}>{pet.name}</Text>
                  {pet.breed && <Text style={styles.petBreed}>{pet.breed}</Text>}
                  {pet.age && <Text style={styles.petAge}>{pet.age} years</Text>}
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      <AddPetModal
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={async () => {
          if (user?.id) {
            await loadPets(user.id);
          }
        }}
      />

      {/* Care Sessions Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Care Sessions</Text>
        </View>
        {sessions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>No sessions yet</Text>
          </View>
        ) : (
          sessions.map((session) => (
            <TouchableOpacity
              key={session.id}
              style={styles.petCard}
              onPress={() => navigation.navigate('PetDetail', { petId: session.pet_id })}
            >
              <Text style={styles.petName}>{session.pets?.name}</Text>
              <Text style={styles.petBreed}>
                {new Date(session.start_date).toLocaleDateString()} - {new Date(session.end_date).toLocaleDateString()}
              </Text>
              <Text style={styles.petAge}>{session.status.toUpperCase()}</Text>
              {session.session_agents?.length > 0 && (
                <Text style={styles.petAge}>
                  Agents: {session.session_agents.map((a: any) => a.profiles?.name).join(', ')}
                </Text>
              )}
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 60, paddingBottom: 32, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  greeting: { fontSize: 16, color: '#fff', opacity: 0.9, marginBottom: 4 },
  name: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  statsContainer: { flexDirection: 'row', paddingHorizontal: 16, marginTop: -24, gap: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  statNumber: { fontSize: 32, fontWeight: 'bold', color: colors.primary, marginBottom: 4 },
  statLabel: { fontSize: 14, color: colors.textMuted },
  section: { padding: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text },
  addButton: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  addButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 8 },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  petGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  petCard: { width: '48%', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  petCardGradient: { padding: 16, minHeight: 140, justifyContent: 'center', alignItems: 'center' },
  petIconContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  petIcon: { fontSize: 32 },
  petPhoto: { fontSize: 24 },
  petName: { fontSize: 16, fontWeight: 'bold', color: colors.text, textAlign: 'center', marginBottom: 4 },
  petBreed: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  petAge: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 4 },
});
