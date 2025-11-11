import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Home, UserRound, PawPrint, Calendar } from 'lucide-react-native';
import { supabase } from './src/lib/supabase';
import BossDashboard from './src/screens/BossDashboard';
import AgentDashboard from './src/screens/AgentDashboard';
import ProfileScreen from './src/screens/ProfileScreen';
import PetDetailScreen from './src/screens/PetDetailScreen';
import AgentPetDetailScreen from './src/screens/AgentPetDetailScreen';
import ScheduleEditorScreen from './src/screens/ScheduleEditorScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AgentProfileScreen from './src/screens/AgentProfileScreen';
import { colors } from './src/theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthScreen({ onSignIn }: { onSignIn: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<'fur_boss' | 'fur_agent'>('fur_boss');

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert('Error', error.message);
    else onSignIn();
  };

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: { role, name: name || email.split('@')[0] } }
    });
    if (error) Alert.alert('Error', error.message);
    else {
      Alert.alert('Success! 🎉', 'Account created! You can now sign in.');
      setIsSignUp(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <LinearGradient
        colors={[colors.primary, colors.secondary, colors.accent]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.authContainer}>
          <Text style={styles.appTitle}>🐕 DingDongDog</Text>
          <Text style={styles.subtitle}>Pet Care Made Simple & Playful</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{isSignUp ? 'Create Account' : 'Welcome Back!'}</Text>
            
            {isSignUp && (
              <TextInput
                style={styles.input}
                placeholder="Your Name"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
              />
            )}
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {isSignUp && (
              <View style={styles.roleSelector}>
                <Text style={styles.roleLabel}>I am a:</Text>
                <View style={styles.roleButtons}>
                  <TouchableOpacity
                    style={[styles.roleButton, role === 'fur_boss' && styles.roleButtonActive]}
                    onPress={() => setRole('fur_boss')}
                  >
                    <Text style={[styles.roleButtonText, role === 'fur_boss' && styles.roleButtonTextActive]}>
                      🐶 Pet Owner
                    </Text>
                    <Text style={[styles.roleSubtext, role === 'fur_boss' && styles.roleSubtextActive]}>
                      (Fur Boss)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.roleButton, role === 'fur_agent' && styles.roleButtonActive]}
                    onPress={() => setRole('fur_agent')}
                  >
                    <Text style={[styles.roleButtonText, role === 'fur_agent' && styles.roleButtonTextActive]}>
                      ❤️ Caretaker
                    </Text>
                    <Text style={[styles.roleSubtext, role === 'fur_agent' && styles.roleSubtextActive]}>
                      (Fur Agent)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.primaryButton} onPress={isSignUp ? signUp : signIn}>
              <Text style={styles.primaryButtonText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={styles.switchButton}>
              <Text style={styles.switchButtonText}>
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </ScrollView>
  );
}

function BossTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={BossDashboard}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  );
}

function AgentTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tab.Screen 
        name="Assignments" 
        component={AgentDashboard}
        options={{
          tabBarLabel: 'Assignments',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  );
}

function MainStack() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setRole('fur_boss');
    // prefer activeRole from storage
    const stored = await AsyncStorage.getItem('activeRole');
    if (stored === 'fur_boss' || stored === 'fur_agent') {
      setRole(stored);
      return;
    }
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    setRole(data?.role || 'fur_boss');
  };

  const HomeTabs = role === 'fur_agent' ? AgentTabs : BossTabs;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeTabs} />
      <Stack.Screen name="PetDetail" component={PetDetailScreen} />
      <Stack.Screen name="AgentPetDetail" component={AgentPetDetailScreen} />
      <Stack.Screen name="ScheduleEditor" component={ScheduleEditorScreen} />
      <Stack.Screen name="AgentProfile" component={AgentProfileScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!session) {
    return <AuthScreen onSignIn={() => setSession(true)} />;
  }

  return (
    <NavigationContainer>
      <MainStack />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1 },
  gradient: { flex: 1, minHeight: '100%' },
  authContainer: { flex: 1, justifyContent: 'center', padding: 20, paddingTop: 60 },
  appTitle: { fontSize: 48, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#fff', textAlign: 'center', marginBottom: 40, opacity: 0.9 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 },
  cardTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 20, textAlign: 'center' },
  input: { height: 56, borderWidth: 2, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 20, marginBottom: 16, fontSize: 16, backgroundColor: colors.background, color: colors.text },
  roleSelector: { marginBottom: 20 },
  roleLabel: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 },
  roleButtons: { flexDirection: 'row', gap: 12 },
  roleButton: { flex: 1, paddingVertical: 16, borderWidth: 2, borderColor: colors.border, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  roleButtonActive: { borderColor: colors.primary, backgroundColor: `${colors.primary}15` },
  roleButtonText: { fontSize: 16, fontWeight: '600', color: colors.textMuted, marginBottom: 4 },
  roleButtonTextActive: { color: colors.primary },
  roleSubtext: { fontSize: 12, color: colors.textMuted },
  roleSubtextActive: { color: colors.primary },
  primaryButton: { height: 56, backgroundColor: colors.primary, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  primaryButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  switchButton: { paddingVertical: 12 },
  switchButtonText: { color: colors.textMuted, fontSize: 14, textAlign: 'center' },
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 18, color: colors.textMuted },
  tabBar: { borderTopWidth: 0, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4, height: 60, paddingBottom: 8, paddingTop: 8 },
});
