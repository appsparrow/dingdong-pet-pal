import { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { colors } from '../theme/colors';

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
};

const PET_TYPES = ['dog', 'cat', 'fish', 'bird', 'rabbit', 'turtle', 'hamster', 'other'] as const;
type PetType = typeof PET_TYPES[number];

export function AddPetModal({ visible, onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [petType, setPetType] = useState<PetType>('dog');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [food, setFood] = useState('');
  const [medical, setMedical] = useState('');
  const [vet, setVet] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant photo library access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const uploadToBucket = async (uri: string): Promise<string | null> => {
    try {
      const res = await fetch(uri);
      const blob = await res.blob();
      const fileName = `pet_${Date.now()}.jpg`;
      const { data, error } = await supabase.storage.from('pet-photos').upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: false,
      });
      if (error) throw error;
      const { data: pub } = supabase.storage.from('pet-photos').getPublicUrl(data.path);
      return pub.publicUrl ?? null;
    } catch (e: any) {
      console.warn(e?.message || e);
      return null;
    }
  };

  const createPet = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter a pet name.');
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      let photo_url: string | null = null;
      if (photoUri) {
        photo_url = await uploadToBucket(photoUri);
      }

      const { error } = await supabase.from('pets').insert({
        fur_boss_id: user.id,
        name,
        pet_type: petType,
        breed: breed || null,
        age: age ? Number(age) : null,
        food_preferences: food || null,
        medical_info: medical || null,
        vet_contact: vet || null,
        photo_url,
      });
      if (error) throw error;
      onCreated();
      onClose();
      reset();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to create pet');
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setName('');
    setPetType('dog');
    setBreed('');
    setAge('');
    setFood('');
    setMedical('');
    setVet('');
    setPhotoUri(null);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Add Pet</Text>
          <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
            <TouchableOpacity style={styles.photo} onPress={pickPhoto}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photoImg} />
              ) : (
                <Text style={styles.photoPlaceholder}>📷 Add Photo</Text>
              )}
            </TouchableOpacity>

            <TextInput placeholder="Pet Name" value={name} onChangeText={setName} style={styles.input} />
            <View style={styles.typeRow}>
              {PET_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setPetType(t)}
                  style={[styles.typeChip, petType === t && styles.typeChipActive]}
                >
                  <Text style={[styles.typeText, petType === t && styles.typeTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput placeholder="Breed" value={breed} onChangeText={setBreed} style={styles.input} />
            <TextInput placeholder="Age (years)" value={age} onChangeText={setAge} keyboardType="number-pad" style={styles.input} />
            <TextInput placeholder="Food preferences" value={food} onChangeText={setFood} style={styles.input} />
            <TextInput placeholder="Medical info" value={medical} onChangeText={setMedical} style={styles.input} />
            <TextInput placeholder="Vet contact" value={vet} onChangeText={setVet} style={styles.input} />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity style={[styles.cancelButton, { flex: 1 }]} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity disabled={saving} style={[styles.primaryButton, { flex: 1 }]} onPress={createPet}>
                <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'Save Pet'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '88%' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12, color: colors.text },
  photo: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16 },
  photoImg: { width: 120, height: 120, borderRadius: 60 },
  photoPlaceholder: { color: colors.textMuted },
  input: { height: 52, borderWidth: 2, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, marginBottom: 12 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  typeChip: { borderWidth: 2, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  typeChipActive: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  typeText: { color: colors.textMuted, fontWeight: '600' },
  typeTextActive: { color: colors.primary },
  primaryButton: { height: 52, backgroundColor: colors.primary, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  cancelButton: { height: 52, backgroundColor: '#f3f4f6', borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  cancelButtonText: { color: colors.textMuted, fontWeight: '600' },
});


