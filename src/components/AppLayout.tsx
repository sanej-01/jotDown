import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Brand } from './Brand';
import { ThemeToggle } from './ThemeToggle';
import { AccountMenu } from './AccountMenu';
import { TabBar } from './TabBar';
import { useLastTab, type TabPath } from '@/hooks/useLastTab';

/** Label for each top-level tab (FR-N1: title reflects the active tab). */
const TAB_TITLES: Record<TabPath, string> = {
  '/todos': 'Todos',
  '/ideas': 'Ideas',
  '/lists': 'Lists',
};

/** Which tab label applies to the current path, including nested /lists/:id. */
function currentTabTitle(path: string): string | null {
  if (path === '/todos' || path === '/ideas' || path === '/lists') return TAB_TITLES[path];
  if (path.startsWith('/lists/')) return TAB_TITLES['/lists'];
  return null;
}

/**
 * Authenticated app shell: sticky header (wordmark + current tab's title +
 * theme toggle + account), routed content, and the bottom tab bar for actual
 * navigation. The header shows only the label of whichever tab is displayed
 * — it's a page title, not a picker — so it stays a single compact row no
 * matter how narrow the screen. Records the current tab so the app reopens
 * where the user left off (FR-N2) and keeps the browser tab title in sync.
 */
export function AppLayout() {
  const location = useLocation();
  const { setLastTab } = useLastTab();
  const tabTitle = currentTabTitle(location.pathname);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/todos' || path === '/ideas' || path === '/lists') {
      setLastTab(path as TabPath);
    }
    document.title = tabTitle ? `${tabTitle} · jotdown` : 'jotdown';
  }, [location.pathname, setLastTab, tabTitle]);

  return (
    <div className="min-h-full bg-canvas">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-2 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <img src="/logo.png" alt="" width={28} height={28} className="h-7 w-7 shrink-0" />
            <Brand />
            {tabTitle && (
              <span className="truncate text-sm font-medium text-content-muted before:mr-2 before:text-border before:content-['·']">
                {tabTitle}
              </span>
            )}
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-2">
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
