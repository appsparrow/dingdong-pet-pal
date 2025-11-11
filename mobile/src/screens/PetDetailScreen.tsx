import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Calendar, Heart, Plus, Edit, Trash2 } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { colors } from '../theme/colors';
import { EditPetModal } from '../components/EditPetModal';
import { CreateSessionModal } from '../components/CreateSessionModal';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function PetDetailScreen({ route, navigation }: any) {
  const { petId } = route.params;
  const [pet, setPet] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState<any | false>(false);
  const [photos, setPhotos] = useState<any[]>([]);
  const [isBoss, setIsBoss] = useState<boolean>(false);

  useEffect(() => {
    if (petId) {
      loadPetDetails();
      loadSessions();
      loadPhotos();
      loadRole();
    }
  }, [petId]);
  useFocusEffect(useCallback(() => { if (petId) { loadPetDetails(); loadSessions(); loadPhotos(); } }, [petId]));

  const loadRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsBoss(false);
      return;
    }
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    setIsBoss(data?.role === 'fur_boss');
  };

  const loadPetDetails = async () => {
    const { data } = await supabase
      .from('pets')
      .select('*')
      .eq('id', petId)
      .single();
    setPet(data);
  };

  const loadSessions = async () => {
    const { data } = await supabase
      .from('sessions')
      .select('*, session_agents(fur_agent_id, profiles(name))')
      .eq('pet_id', petId)
      .order('created_at', { ascending: false });
    setSessions(data || []);
  };

  const loadPhotos = async () => {
    const { data } = await supabase
      .from('activities')
      .select('id, photo_url, created_at')
      .eq('pet_id', petId)
      .not('photo_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(12);
    setPhotos(data || []);
  };

  const deletePet = async () => {
    const { error } = await supabase.from('pets').delete().eq('id', petId);
    if (error) Alert.alert('Error', error.message);
    else navigation.goBack();
  };

  const handleDeleteSession = (sessionId: string) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this care session? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('sessions').delete().eq('id', sessionId);
            if (!error) {
              loadSessions();
            } else {
              Alert.alert('Error', 'Failed to delete session');
            }
          },
        },
      ]
    );
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

  if (!pet) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>

        {isBoss && (
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.headerButton} onPress={() => setEditOpen(true)}>
              <Edit color="#fff" size={20} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.petIconContainer}>
          <Text style={styles.petIcon}>{getPetIcon(pet.pet_type)}</Text>
        </View>
      </LinearGradient>

      {/* Pet Info Card */}
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.petHeader}>
            <View style={styles.petInfo}>
              <Text style={styles.petName}>{pet.name}</Text>
              {pet.breed && <Text style={styles.petBreed}>{pet.breed}</Text>}
            </View>
            {pet.age && (
              <View style={styles.ageTag}>
                <Text style={styles.ageText}>{pet.age} years</Text>
              </View>
            )}
          </View>
          {isBoss && (
            <TouchableOpacity
              style={[styles.addButton, { alignSelf: 'flex-start', marginTop: 12 }]}
              onPress={() => navigation.navigate('ScheduleEditor', { petId })}
            >
              <Text style={styles.addButtonText}>Daily Schedule</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Pet Details */}
        {(pet.food_preferences || pet.medical_info || pet.vet_contact) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pet Information</Text>
            
            {pet.food_preferences && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>🍽️ Food Preferences</Text>
                <Text style={styles.infoText}>{pet.food_preferences}</Text>
              </View>
            )}

            {pet.medical_info && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>💊 Medical Information</Text>
                <Text style={styles.infoText}>{pet.medical_info}</Text>
              </View>
            )}

            {pet.vet_contact && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>📞 Vet Contact</Text>
                <Text style={styles.infoText}>{pet.vet_contact}</Text>
              </View>
            )}
          </View>
        )}

        {/* Care Sessions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Care Sessions</Text>
            {isBoss && (
              <TouchableOpacity style={styles.addButton} onPress={() => setSessionOpen(true)}>
                <Plus color="#fff" size={20} />
                <Text style={styles.addButtonText}>New</Text>
              </TouchableOpacity>
            )}
          </View>

          {sessions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyText}>No sessions yet</Text>
            </View>
          ) : (
            sessions.map((session) => (
              <View key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <View style={[styles.statusDot, { backgroundColor: session.status === 'active' ? colors.success : colors.secondary }]} />
                  <Text style={styles.statusText}>{session.status.toUpperCase()}</Text>
                </View>
                <View style={styles.sessionRow}>
                  <Calendar color={colors.textMuted} size={16} />
                  <Text style={styles.sessionText}>
                    {new Date(session.start_date).toLocaleDateString()} - {new Date(session.end_date).toLocaleDateString()}
                  </Text>
                </View>
                {session.session_agents.length > 0 && (
                  <View style={[styles.sessionRow, { flexWrap: 'wrap', gap: 6 }]}>
                    <Heart color={colors.textMuted} size={16} />
                    {session.session_agents.map((a: any) => (
                      <TouchableOpacity
                        key={a.fur_agent_id}
                        onPress={() => navigation.navigate('AgentProfile', { agentId: a.fur_agent_id })}
                        style={{ backgroundColor: colors.accent + '15', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14 }}
                      >
                        <Text style={{ color: colors.accent, fontWeight: '700' }}>
                          {a.profiles?.name || 'Agent'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                {isBoss && (
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                    <TouchableOpacity
                      style={[styles.addButton, { flex: 1 }]}
                      onPress={() => setSessionOpen(session)}
                    >
                      <Edit color="#fff" size={16} />
                      <Text style={styles.addButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.addButton, { flex: 1, backgroundColor: '#EF4444' }]}
                      onPress={() => handleDeleteSession(session.id)}
                    >
                      <Trash2 color="#fff" size={16} />
                      <Text style={styles.addButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {/* Activity Photos */}
        {photos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activity Photos</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {photos.map((p) => (
                <Image key={p.id} source={{ uri: p.photo_url }} style={{ width: 96, height: 96, borderRadius: 12 }} />
              ))}
            </View>
          </View>
        )}

        <View style={{ marginTop: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 }}>Danger Zone</Text>
          {isBoss && (
            <TouchableOpacity
              style={{ height: 52, borderRadius: 14, borderWidth: 2, borderColor: '#ef4444', alignItems: 'center', justifyContent: 'center' }}
              onPress={() => {
                Alert.alert('Delete Pet', `Are you sure you want to delete ${pet?.name}?`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: deletePet },
                ]);
              }}
            >
              <Text style={{ color: '#ef4444', fontWeight: '700' }}>Delete Pet</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {isBoss && (
        <EditPetModal
          visible={editOpen}
          onClose={() => setEditOpen(false)}
          pet={pet}
          onSaved={async () => {
            await loadPetDetails();
          }}
        />
      )}
      {isBoss && (
        <CreateSessionModal
          visible={sessionOpen}
          onClose={() => setSessionOpen(false)}
          petId={petId}
          onCreated={async () => {
            await loadSessions();
          }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingText: { fontSize: 18, color: colors.textMuted, textAlign: 'center', marginTop: 40 },
  header: { paddingTop: 60, paddingBottom: 80, paddingHorizontal: 24, alignItems: 'center' },
  backButton: { position: 'absolute', top: 60, left: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  headerButtons: { position: 'absolute', top: 60, right: 20, flexDirection: 'row', gap: 8 },
  headerButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  petIconContainer: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: 'rgba(255,255,255,0.5)' },
  petIcon: { fontSize: 48 },
  content: { marginTop: -40, paddingHorizontal: 20, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  petHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  petInfo: { flex: 1 },
  petName: { fontSize: 28, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  petBreed: { fontSize: 16, color: colors.textMuted },
  ageTag: { backgroundColor: colors.primary + '15', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  ageText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 16 },
  infoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  infoLabel: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 },
  infoText: { fontSize: 16, color: colors.textMuted, lineHeight: 24 },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, gap: 4 },
  addButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 40, backgroundColor: '#fff', borderRadius: 16 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: colors.textMuted },
  sessionCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  sessionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  sessionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  sessionText: { fontSize: 14, color: colors.textMuted, flex: 1 },
});
