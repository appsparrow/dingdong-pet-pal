import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, FlatList } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { UserRound, Mail, Phone, MapPin, Edit, Save, X, LogOut, Shuffle } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { colors } from '../theme/colors';
import { AddPetModal } from '../components/AddPetModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', bio: '' });
  const [pets, setPets] = useState<any[]>([]);
  const [addPetOpen, setAddPetOpen] = useState(false);
  const navigation = useNavigation<any>();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(data);
      if (data) {
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          address: data.address || '',
          bio: data.bio || '',
        });
      }
      // Load pets
      const { data: petData } = await supabase
        .from('pets')
        .select('id,name,breed,age,pet_type,photo_url')
        .eq('fur_boss_id', user.id)
        .order('created_at', { ascending: false });
      setPets(petData || []);
    }
  };
  useFocusEffect(useCallback(() => { loadProfile(); }, []));

  const saveProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update(formData)
      .eq('id', user.id);

    if (error) Alert.alert('Error', error.message);
    else {
      Alert.alert('Success', 'Profile updated!');
      setEditing(false);
      loadProfile();
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };
  const switchRole = async () => {
    const next = profile?.role === 'fur_boss' ? 'fur_agent' : 'fur_boss';
    await AsyncStorage.setItem('activeRole', next);
    Alert.alert('Role switched', `Active role set to ${next.replace('_', ' ')}`);
  };

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const pickProfilePhoto = async () => {
    const { status } = await (await import('expo-image-picker')).requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant photo access');
      return;
    }
    const ImagePicker = await import('expo-image-picker');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.Images],
      quality: 0.6,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      const res = await fetch(uri);
      const blob = await res.blob();
      const fileName = `profile_${profile.id}_${Date.now()}.jpg`;
      const { data, error } = await supabase.storage.from('profile-photos').upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });
      if (error) {
        Alert.alert('Error', error.message);
        return;
      }
      const { data: pub } = supabase.storage.from('profile-photos').getPublicUrl(data.path);
      await supabase.from('profiles').update({ photo_url: pub.publicUrl }).eq('id', profile.id);
      await loadProfile();
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.avatarContainer}>
          <TouchableOpacity style={styles.avatar} onPress={pickProfilePhoto}>
            <UserRound color="#fff" size={48} />
          </TouchableOpacity>
        </View>
        {!editing && (
          <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
            <Edit color="#fff" size={20} />
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* Profile Content */}
      <View style={styles.content}>
        {editing ? (
          <>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(name) => setFormData({ ...formData, name })}
              placeholder="Your name"
            />

            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(phone) => setFormData({ ...formData, phone })}
              placeholder="Phone number"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(address) => setFormData({ ...formData, address })}
              placeholder="Your address"
              multiline
            />

            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio}
              onChangeText={(bio) => setFormData({ ...formData, bio })}
              placeholder="Tell us about yourself"
              multiline
              numberOfLines={4}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setEditing(false)}>
                <X color={colors.textMuted} size={20} />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
                <Save color="#fff" size={20} />
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.name}>{profile.name || 'No name set'}</Text>
            <Text style={styles.role}>
              {profile.role === 'fur_boss' ? '🐶 Fur Boss (Pet Owner)' : '❤️ Fur Agent (Caretaker)'}
            </Text>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Mail color={colors.textMuted} size={20} />
                <Text style={styles.infoText}>{profile.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Phone color={colors.textMuted} size={20} />
                <Text style={styles.infoText}>{profile.phone || 'Add your phone'}</Text>
              </View>
              <View style={styles.infoRow}>
                <MapPin color={colors.textMuted} size={20} />
                <Text style={styles.infoText}>{profile.address || 'Add your address'}</Text>
              </View>
            </View>

            <View style={styles.bioCard}>
              <Text style={styles.bioTitle}>About Me</Text>
              <Text style={styles.bioText}>{profile.bio || 'Add a short bio about you'}</Text>
            </View>

            {profile.role === 'fur_agent' && (
              <View style={styles.statsCard}>
                <Text style={styles.statsTitle}>Paw Points</Text>
                <Text style={styles.statsValue}>⭐ {profile.paw_points || 0}</Text>
              </View>
            )}

            {/* My Pets Section */}
            <View style={{ marginTop: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>My Pets</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => setAddPetOpen(true)}>
                  <Text style={styles.addButtonText}>+ Add Pet</Text>
                </TouchableOpacity>
              </View>
              {pets.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>🐾</Text>
                  <Text style={styles.emptyText}>No pets yet. Add your first pet!</Text>
                </View>
              ) : (
                <View style={styles.petGrid}>
                  {pets.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={styles.petCard}
                      onPress={() => navigation.navigate('PetDetail', { petId: p.id })}
                    >
                      <Text style={styles.petEmoji}>
                        {p.pet_type === 'dog' ? '🐶' :
                         p.pet_type === 'cat' ? '🐱' :
                         p.pet_type === 'fish' ? '🐠' :
                         p.pet_type === 'bird' ? '🐦' :
                         p.pet_type === 'rabbit' ? '🐰' :
                         p.pet_type === 'turtle' ? '🐢' :
                         p.pet_type === 'hamster' ? '🐭' : '🐾'}
                      </Text>
                      <Text style={styles.petNameSmall}>{p.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </>
        )}

        {/* Sign Out */}
        {!editing && (
          <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
            <LogOut color={colors.primary} size={20} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        )}
        {!editing && (
          <TouchableOpacity style={[styles.signOutButton, { borderColor: colors.accent, marginTop: 12 }]} onPress={switchRole}>
            <Shuffle color={colors.accent} size={20} />
            <Text style={[styles.signOutText, { color: colors.accent }]}>Switch Role</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Add Pet Modal */}
      <AddPetModal
        visible={addPetOpen}
        onClose={() => setAddPetOpen(false)}
        onCreated={loadProfile}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingText: { fontSize: 18, color: colors.textMuted, textAlign: 'center', marginTop: 40 },
  header: { paddingTop: 60, paddingBottom: 80, paddingHorizontal: 24, alignItems: 'center' },
  avatarContainer: { alignItems: 'center' },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#fff' },
  editButton: { position: 'absolute', top: 60, right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  content: { marginTop: -40, paddingHorizontal: 20, paddingBottom: 40, paddingTop: 50 },
  name: { fontSize: 28, fontWeight: 'bold', color: colors.text, textAlign: 'center', marginBottom: 8 },
  role: { fontSize: 16, color: colors.textMuted, textAlign: 'center', marginBottom: 24 },
  infoCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  infoText: { fontSize: 16, color: colors.text, flex: 1 },
  bioCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  bioTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 12 },
  bioText: { fontSize: 16, color: colors.textMuted, lineHeight: 24 },
  statsCard: { backgroundColor: colors.primary + '15', borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 16 },
  statsTitle: { fontSize: 16, color: colors.textMuted, marginBottom: 8 },
  statsValue: { fontSize: 32, fontWeight: 'bold', color: colors.primary },
  label: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8, marginTop: 16 },
  input: { height: 56, borderWidth: 2, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 20, fontSize: 16, backgroundColor: colors.background, color: colors.text },
  textArea: { height: 120, paddingTop: 16, textAlignVertical: 'top' },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelButton: { flex: 1, height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: colors.border, gap: 8 },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: colors.textMuted },
  saveButton: { flex: 1, height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: colors.primary, gap: 8 },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  signOutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 56, borderRadius: 16, borderWidth: 2, borderColor: colors.primary, gap: 8, marginTop: 24 },
  signOutText: { fontSize: 16, fontWeight: '600', color: colors.primary },
  addButton: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  addButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  petGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  petCard: { width: '30%', backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  petEmoji: { fontSize: 28, marginBottom: 8 },
  petNameSmall: { fontSize: 12, fontWeight: '600', color: colors.text },
  emptyState: { alignItems: 'center', paddingVertical: 40, backgroundColor: '#fff', borderRadius: 16 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 14, color: colors.textMuted },
});
