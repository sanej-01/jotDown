import { useTheme } from '@/theme/ThemeProvider';
import { MoonIcon, SunIcon } from './icons';

/** Light/dark toggle shown in the app header and on the auth screens. */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={[
        'inline-flex h-8 w-8 min-h-touch min-w-touch items-center justify-center',
        'rounded-full bg-surface-muted text-content-muted',
        'hover:text-content focus-visible:outline-none',
        className,
      ].join(' ')}
    >
      {isDark ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
    </button>
  );
}
