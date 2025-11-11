import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const inferLanHost = () => {
  const hostUri = (Constants as any)?.expoConfig?.hostUri as string | undefined;
  if (hostUri && hostUri.includes(':')) return hostUri.split(':')[0];
  const dbg = (Constants as any)?.manifest?.debuggerHost as string | undefined;
  if (dbg && dbg.includes(':')) return dbg.split(':')[0];
  return '127.0.0.1';
};

const defaultUrl = `http://${inferLanHost()}:54321`;
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || defaultUrl;
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
