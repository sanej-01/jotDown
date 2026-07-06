import { NavLink } from 'react-router-dom';
import { CheckIcon, ListIcon, SparkleIcon } from './icons';
import type { TabPath } from '@/hooks/useLastTab';

const tabs: { to: TabPath; label: string; Icon: typeof CheckIcon }[] = [
  { to: '/todos', label: 'Todos', Icon: CheckIcon },
  { to: '/ideas', label: 'Ideas', Icon: SparkleIcon },
  { to: '/lists', label: 'Lists', Icon: ListIcon },
];

/**
 * Bottom tab bar (FR-N1). Fixed to the bottom for one-hand mobile use; the
 * content column is centered so it also reads well on desktop.
 */
export function TabBar() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-md items-stretch">
        {tabs.map(({ to, label, Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                [
                  'flex min-h-touch flex-col items-center justify-center gap-1 py-2 text-xs font-medium',
                  'focus-visible:outline-none',
                  isActive ? 'text-brand-strong' : 'text-content-muted hover:text-content',
                ].join(' ')
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
