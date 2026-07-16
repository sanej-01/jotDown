import { NavLink } from 'react-router-dom';
import { CheckIcon, ListIcon, SparkleIcon } from './icons';
import type { TabPath } from '@/hooks/useLastTab';

const tabs: { to: TabPath; label: string; Icon: typeof CheckIcon }[] = [
  { to: '/todos', label: 'Todos', Icon: CheckIcon },
  { to: '/ideas', label: 'Ideas', Icon: SparkleIcon },
  { to: '/lists', label: 'Lists', Icon: ListIcon },
];

/**
 * Primary navigation (FR-N1), placed in the header next to the wordmark
 * rather than as a separate fixed bottom bar — reclaims the vertical space
 * the bar used to occupy. NavLink's default (non-"end") matching keeps
 * "Lists" highlighted while on a nested /lists/:id detail page too.
 */
export function TabBar() {
  return (
    <nav aria-label="Primary" className="min-w-0 flex-1 overflow-x-auto">
      <ul className="flex items-center justify-center">
        {tabs.map(({ to, label, Icon }) => (
          <li key={to} className="shrink-0">
            <NavLink
              to={to}
              className={({ isActive }) =>
                [
                  // Horizontal padding is tight to fit all 3 tabs beside the wordmark
                  // on narrow phones; min-h-touch keeps the tap target's *height* at
                  // the 44px accessibility minimum even though the box looks slim.
                  'flex min-h-touch items-center gap-0 whitespace-nowrap rounded-pill px-0.5 text-[10px] font-medium sm:gap-1 sm:px-3 sm:text-xs',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                  isActive
                    ? 'bg-surface-muted text-brand-strong'
                    : 'text-content-muted hover:text-content',
                ].join(' ')
              }
            >
              <Icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
