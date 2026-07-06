import type { AuthError } from '@supabase/supabase-js';

/**
 * Map Supabase auth errors to user-friendly copy. Sign-in failures are
 * deliberately generic so we never leak whether an account exists (AUTH-03).
 */
export function friendlyAuthError(error: AuthError | null): string | null {
  if (!error) return null;
  const msg = error.message.toLowerCase();

  if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
    return 'Invalid email or password.';
  }
  if (msg.includes('already registered') || msg.includes('already exists')) {
    return 'An account with this email already exists. Try signing in or resetting your password.';
  }
  if (msg.includes('rate limit') || msg.includes('too many')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (msg.includes('network')) {
    return 'Network error. Check your connection and try again.';
  }
  // Fall back to the provider message rather than something misleadingly vague.
  return error.message;
}
