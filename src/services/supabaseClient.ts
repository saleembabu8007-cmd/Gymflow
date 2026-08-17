import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';
import { env } from '../config/env';

export const isSupabaseConfigured = env.IS_SUPABASE_CONFIGURED;

export const supabase = isSupabaseConfigured
  ? createClient<Database>(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Health check helper for verifying Supabase initialization and auth connectivity.
 */
export async function checkSupabaseHealth(): Promise<{
  configured: boolean;
  connected: boolean;
  error?: string;
}> {
  if (!isSupabaseConfigured || !supabase) {
    return { configured: false, connected: false };
  }
  try {
    const { error } = await supabase.auth.getSession();
    if (error) {
      return { configured: true, connected: false, error: error.message };
    }
    return { configured: true, connected: true };
  } catch (err: any) {
    return { configured: true, connected: false, error: err.message || 'Connection failed' };
  }
}
