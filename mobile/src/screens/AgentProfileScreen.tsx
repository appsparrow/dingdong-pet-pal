import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { supabase } from '../lib/supabase';
import { colors } from '../theme/colors';
import { Mail, Phone, MapPin, UserRound } from 'lucide-react-native';

export default function AgentProfileScreen({ route }: any) {
  const { agentId } = route.params;
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', agentId).single();
      setProfile(data);
    };
    load();
  }, [agentId]);

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        {profile.photo_url ? (
          <Image source={{ uri: profile.photo_url }} style={styles.avatarImage} />
        ) : (
          <UserRound color={colors.primary} size={48} />
        )}
      </View>
      <Text style={styles.name}>{profile.name || 'Agent'}</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Mail color={colors.textMuted} size={18} />
          <Text style={styles.value}>{profile.email}</Text>
        </View>
        <View style={styles.row}>
          <Phone color={colors.textMuted} size={18} />
          <Text style={styles.value}>{profile.phone || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <MapPin color={colors.textMuted} size={18} />
          <Text style={styles.value}>{profile.address || 'N/A'}</Text>
        </View>
      </View>
      {profile.bio ? (
        <View style={styles.card}>
          <Text style={styles.bio}>{profile.bio}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  loading: { textAlign: 'center', marginTop: 40, color: colors.textMuted },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 20, marginBottom: 12, borderWidth: 2, borderColor: colors.border, overflow: 'hidden' },
  avatarImage: { width: 96, height: 96 },
  name: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 16, color: colors.text },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  value: { color: colors.text, fontSize: 16 },
  bio: { color: colors.textMuted, fontSize: 16, lineHeight: 22 },
});


