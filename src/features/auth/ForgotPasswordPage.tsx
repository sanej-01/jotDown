import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { AuthScreen } from './AuthScreen';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';

export function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    const { error } = await sendPasswordReset(email.trim());
    setBusy(false);
    // Show the same confirmation regardless, to avoid leaking account existence.
    if (error) setError(error);
    else setSent(true);
  }

  return (
    <AuthScreen>
      {sent ? (
        <p className="text-center text-sm text-content" role="status">
          If an account exists for that email, a reset link is on its way. Check your
          inbox.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
          <p className="text-center text-sm text-content-muted">
            Enter your email and we'll send you a link to reset your password.
          </p>
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
          {error && <p className="text-sm text-danger" role="alert">{error}</p>}
          <Button type="submit" fullWidth disabled={busy}>
            {busy ? 'Sending…' : 'Send reset link'}
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
