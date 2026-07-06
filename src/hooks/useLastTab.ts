import { useCallback } from 'react';

/** The three primary tabs. */
export type TabPath = '/todos' | '/ideas' | '/lists';

const STORAGE_KEY = 'jotdown.lastTab';
const DEFAULT_TAB: TabPath = '/todos';

function isTabPath(value: string | null): value is TabPath {
  return value === '/todos' || value === '/ideas' || value === '/lists';
}

/**
 * Remembers the last visited tab across sessions (FR-N2 / AUTH-06: lands on
 * last-used tab). Reads/writes localStorage; falls back to Todos.
 */
export function useLastTab() {
  const getLastTab = useCallback((): TabPath => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isTabPath(stored) ? stored : DEFAULT_TAB;
  }, []);

  const setLastTab = useCallback((tab: TabPath) => {
    window.localStorage.setItem(STORAGE_KEY, tab);
  }, []);

  return { getLastTab, setLastTab };
}
