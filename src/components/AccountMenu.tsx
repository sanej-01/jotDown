import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthProvider';

/** Avatar button that opens a small menu with the account email and Sign out (FR-A5). */
export function AccountMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const email = user?.email ?? '';
  const initial = email ? email[0]!.toUpperCase() : '?';

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  async function handleSignOut() {
    setOpen(false);
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex h-8 w-8 min-h-touch min-w-touch items-center justify-center rounded-full bg-brand text-sm font-semibold text-white focus-visible:outline-none"
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-56 rounded-card border border-border bg-surface p-2 shadow-lg"
        >
          <p className="truncate px-3 py-2 text-xs text-content-muted" title={email}>
            {email}
          </p>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-content hover:bg-surface-muted focus-visible:outline-none"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
