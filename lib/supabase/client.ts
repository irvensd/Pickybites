// TODO: Replace with Supabase client when env vars are configured
export function createSupabaseClient() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  // import { createClient } from '@supabase/supabase-js'
  // return createClient(url, key)
  return null;
}
