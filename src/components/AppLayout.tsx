import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Brand } from './Brand';
import { ThemeToggle } from './ThemeToggle';
import { AccountMenu } from './AccountMenu';
import { TabBar } from './TabBar';
import { useLastTab, type TabPath } from '@/hooks/useLastTab';

/**
 * Authenticated app shell: sticky header (wordmark + theme toggle + account),
 * routed content, and the bottom tab bar. Records the current tab so the app
 * reopens where the user left off (FR-N2).
 */
export function AppLayout() {
  const location = useLocation();
  const { setLastTab } = useLastTab();

  useEffect(() => {
    const path = location.pathname;
    if (path === '/todos' || path === '/ideas' || path === '/lists') {
      setLastTab(path as TabPath);
    }
  }, [location.pathname, setLastTab]);

  return (
    <div className="min-h-full bg-canvas">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between gap-2 px-4 py-3">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="" width={28} height={28} className="h-7 w-7" />
            <Brand />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AccountMenu />
          </div>
        </div>
      </header>

      {/* Bottom padding leaves room for the fixed tab bar. */}
      <main className="mx-auto max-w-md px-4 pb-24 pt-4">
        <Outlet />
      </main>

      <TabBar />
    </div>
  );
}
