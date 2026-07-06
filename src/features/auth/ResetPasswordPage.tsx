import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { AuthScreen } from './AuthScreen';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';

const MIN_PASSWORD = 8;

/**
 * Reached from the password-reset email link. Supabase (detectSessionInUrl)
 * establishes a temporary recovery session, so updateUser can set a new
 * password (AUTH-08).
 */
export function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const passwordError =
    password.length > 0 && password.length < MIN_PASSWORD
      ? `Minimum ${MIN_PASSWORD} characters.`
      : undefined;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`);
      return;
    }
    setError(null);
    setBusy(true);
    const { error } = await updatePassword(password);
    setBusy(false);
    if (error) {
      setError(error);
      return;
    }
    setDone(true);
    setTimeout(() => navigate('/todos', { replace: true }), 1200);
  }

  return (
    <AuthScreen>
      {done ? (
        <p className="text-center text-sm text-brand-strong" role="status">
          Password updated. Taking you to your todos…
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
          <p className="text-center text-sm text-content-muted">Choose a new password.</p>
          <TextField
            label="New password"
            hideLabel
            type="password"
            autoComplete="new-password"
            placeholder="New password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
            required
          />
          {error && <p className="text-sm text-danger" role="alert">{error}</p>}
          <Button type="submit" fullWidth disabled={busy || Boolean(passwordError)}>
            {busy ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      )}

      <p className="mt-2 text-center text-sm text-content-muted">
        <Link to="/login" className="font-semibold text-content hover:text-brand-strong">
          Back to sign in
        </Link>
      </p>
    </AuthScreen>
  );
}
