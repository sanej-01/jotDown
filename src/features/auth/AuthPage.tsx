import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { AuthScreen } from './AuthScreen';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useLastTab } from '@/hooks/useLastTab';

const MIN_PASSWORD = 8;

interface LocationState {
  from?: { pathname: string };
}

type AuthTab = 'signin' | 'signup';

function tabForPath(pathname: string): AuthTab {
  return pathname === '/signup' ? 'signup' : 'signin';
}

/**
 * Combined sign-in / create-account screen (FR-A1-A3). New users kept missing
 * the separate "Create account" page, so both flows now live behind tabs on
 * one screen. The URL (/login, /signup) stays in sync with the active tab so
 * existing deep links and the "Back to sign in" link keep working.
 */
export function AuthPage() {
  const { signInWithPassword, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { getLastTab } = useLastTab();

  const [tab, setTab] = useState<AuthTab>(() => tabForPath(location.pathname));
  const [email, setEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Keep the tab in sync with browser back/forward between /login and /signup.
  useEffect(() => {
    setTab(tabForPath(location.pathname));
  }, [location.pathname]);

  // Where to land after sign-in: the originally requested page, else last tab.
  const from = (location.state as LocationState | null)?.from?.pathname ?? getLastTab();

  const passwordError =
    tab === 'signup' && signupPassword.length > 0 && signupPassword.length < MIN_PASSWORD
      ? `Minimum ${MIN_PASSWORD} characters.`
      : undefined;

  function selectTab(next: AuthTab) {
    if (next === tab) return;
    setError(null);
    navigate(next === 'signup' ? '/signup' : '/login', { replace: true, state: location.state });
  }

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    if (busy) return; // FR-D3: prevent double submit
    setError(null);
    setBusy(true);
    const { error } = await signInWithPassword(email.trim(), signinPassword);
    setBusy(false);
    if (error) {
      setError(error);
      return;
    }
    navigate(from, { replace: true });
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (signupPassword.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`);
      return;
    }
    setError(null);
    setBusy(true);
    // Simple signup, no email verification: a session is created immediately.
    const { error } = await signUp(email.trim(), signupPassword);
    setBusy(false);
    if (error) {
      setError(error);
      return;
    }
    navigate('/todos', { replace: true });
  }

  return (
    <AuthScreen>
      <div
        role="tablist"
        aria-label="Sign in or create account"
        className="mb-4 flex rounded-pill border border-border bg-surface p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'signin'}
          onClick={() => selectTab('signin')}
          className={[
            'flex-1 rounded-pill py-2 text-sm font-semibold transition-colors focus-visible:outline-none',
            tab === 'signin' ? 'bg-brand text-white' : 'text-content-muted hover:text-content',
          ].join(' ')}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'signup'}
          onClick={() => selectTab('signup')}
          className={[
            'flex-1 rounded-pill py-2 text-sm font-semibold transition-colors focus-visible:outline-none',
            tab === 'signup' ? 'bg-brand text-white' : 'text-content-muted hover:text-content',
          ].join(' ')}
        >
          Create account
        </button>
      </div>

      {tab === 'signin' ? (
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
            value={signinPassword}
            onChange={(e) => setSigninPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>

          <p className="mt-1 text-center text-sm text-content-muted">
            <Link to="/forgot" className="hover:text-content">
              Forgot password?
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleSignUp} className="flex flex-col gap-3" noValidate>
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
            value={signupPassword}
            onChange={(e) => setSignupPassword(e.target.value)}
            error={passwordError}
            required
          />

          {error && (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth disabled={busy || Boolean(passwordError)}>
            {busy ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
      )}
    </AuthScreen>
  );
}
