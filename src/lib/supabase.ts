import { createClient } from '@supabase/supabase-js';
import { env } from '@/config/env';

/**
 * The single Supabase client for the whole app. The frontend talks directly to
 * Supabase (no custom server), so this client is the one data-access seam.
 *
 * Session handling satisfies FR-A4 / AUTH-06: the session is persisted to
 * localStorage and the access token is silently refreshed in the background
 * (AUTH-07), so users stay signed in across browser restarts.
 */
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // needed for magic-link / password-reset redirects
    storageKey: 'jotdown.auth',
  },
});
