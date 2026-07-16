import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Brand } from './Brand';
import { ThemeToggle } from './ThemeToggle';
import { AccountMenu } from './AccountMenu';
import { TabBar } from './TabBar';
import { useLastTab, type TabPath } from '@/hooks/useLastTab';

/** Document-title label for each top-level tab (FR-N1: title reflects the active tab). */
const TAB_TITLES: Record<TabPath, string> = {
  '/todos': 'Todos',
  '/ideas': 'Ideas',
  '/lists': 'Lists',
};

/**
 * Authenticated app shell: sticky header with the wordmark, primary nav, and
 * account controls all on one row (the nav used to be a separate fixed
 * bottom bar; folding it into the header reclaims that vertical space).
 * Records the current tab so the app reopens where the user left off
 * (FR-N2) and keeps the browser tab title in sync with the active section.
 */
export function AppLayout() {
  const location = useLocation();
  const { setLastTab } = useLastTab();

  useEffect(() => {
    const path = location.pathname;
    if (path === '/todos' || path === '/ideas' || path === '/lists') {
      setLastTab(path as TabPath);
      document.title = `${TAB_TITLES[path as TabPath]} · jotdown`;
    } else if (path.startsWith('/lists/')) {
      document.title = 'Lists · jotdown';
    } else {
      document.title = 'jotdown';
    }
  }, [location.pathname, setLastTab]);

  return (
    <div className="min-h-full bg-canvas">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-0.5 px-1.5 py-2 sm:gap-2 sm:px-4">
          <div className="flex shrink-0 items-center gap-1">
            <img src="/logo.png" alt="" width={20} height={20} className="h-5 w-5" />
            <Brand small />
          </div>

          <TabBar />

          <div className="flex shrink-0 items-center gap-0.5">
            <ThemeToggle />
            <AccountMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pb-6 pt-4">
        <Outlet />
      </main>
    </div>
  );
}
