import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { AuthScreen } from './AuthScreen';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useLastTab } from '@/hooks/useLastTab';

interface LocationState {
  from?: { pathname: string };
}

export function LoginPage() {
  const { signInWithPassword, signInWithMagicLink } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { getLastTab } = useLastTab();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  // Where to land after login: the originally requested page, else last tab.
  const from = (location.state as LocationState | null)?.from?.pathname ?? getLastTab();

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    if (busy) return; // FR-D3: prevent double submit
    setError(null);
    setBusy(true);
    const { error } = await signInWithPassword(email.trim(), password);
    setBusy(false);
    if (error) {
      setError(error);
      return;
    }
    navigate(from, { replace: true });
  }

  async function handleMagicLink() {
    if (busy) return;
    if (!email.trim()) {
      setError('Enter your email to get a magic link.');
      return;
    }
    setError(null);
    setBusy(true);
    const { error } = await signInWithMagicLink(email.trim());
    setBusy(false);
    if (error) setError(error);
    else setMagicSent(true);
  }

  return (
    <AuthScreen>
      <form onSubmit={handleSignIn} className="flex flex-col gap-3" noValidate>
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
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-sm text-danger" role="alert">{error}</p>}
        {magicSent && (
          <p className="text-sm text-brand-strong" role="status">
            Check your email for a magic link to sign in.
          </p>
        )}

        <Button type="submit" fullWidth disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <div className="my-1 text-center text-xs text-content-muted">— or —</div>

      <Button variant="secondary" fullWidth disabled={busy} onClick={handleMagicLink}>
        Email me a magic link
      </Button>

      <p className="mt-2 text-center text-sm text-content-muted">
        <Link to="/forgot" className="hover:text-content">
          Forgot password?
        </Link>{' '}
        ·{' '}
        <Link to="/signup" className="font-semibold text-content hover:text-brand-strong">
          Create account
        </Link>
      </p>
    </AuthScreen>
  );
}
