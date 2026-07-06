import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { AuthScreen } from './AuthScreen';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';

const MIN_PASSWORD = 8;

export function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Inline weak-password check before submit (AUTH-04).
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
    // Simple signup, no email verification: a session is created immediately.
    const { error } = await signUp(email.trim(), password);
    setBusy(false);
    if (error) {
      setError(error);
      return;
    }
    navigate('/todos', { replace: true });
  }

  return (
    <AuthScreen>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
        <TextField
          label="Email"
          hideLabel
          type="email"
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Password"
          hideLabel
          type="password"
          autoComplete="new-password"
          placeholder="Password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={passwordError}
          required
        />

        {error && <p className="text-sm text-danger" role="alert">{error}</p>}

        <Button type="submit" fullWidth disabled={busy || Boolean(passwordError)}>
          {busy ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-2 text-center text-sm text-content-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-content hover:text-brand-strong">
          Sign in
        </Link>
      </p>
    </AuthScreen>
  );
}
