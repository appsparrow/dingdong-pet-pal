import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';
import { Button } from 'react-native';
import { TextInput } from 'react-native';
import { Text } from 'react-native';

export default function AuthScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'fur_boss' | 'fur_agent'>('fur_boss');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      alert(error?.message ?? 'Unable to sign in');
      return;
    }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
    navigation.replace(profile?.role === 'fur_boss' ? 'BossHome' : 'AgentHome');
  };

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role } },
    });
    if (error) {
      alert(error.message);
      return;
    }
    alert('Check your email to confirm and then sign in.');
    setIsSignUp(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DingDongDog</Text>
      <TextInput placeholder="Email" autoCapitalize="none" style={styles.input} value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry style={styles.input} value={password} onChangeText={setPassword} />
      {isSignUp && (
        <View style={styles.roleRow}>
          <Button title={role === 'fur_boss' ? 'Fur Boss ✓' : 'Fur Boss'} onPress={() => setRole('fur_boss')} />
          <Button title={role === 'fur_agent' ? 'Fur Agent ✓' : 'Fur Agent'} onPress={() => setRole('fur_agent')} />
        </View>
      )}
      <Button title={isSignUp ? 'Create account' : 'Sign in'} onPress={isSignUp ? handleSignUp : handleSignIn} />
      <View style={{ height: 8 }} />
      <Button title={isSignUp ? 'Have an account? Sign in' : "New here? Sign up"} onPress={() => setIsSignUp(!isSignUp)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  roleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
});


