import type { ReactNode } from 'react';
import { Spinner } from './ui/Spinner';
import { Button } from './ui/Button';

/**
 * Standard loading / error wrapper for a query-backed view. On error it shows a
 * Retry (NET-08 / NFR-2); pass `hasCachedData` so a refetch error can still
 * render the last-known data underneath rather than replacing it.
 */
export function QueryState({
  isLoading,
  isError,
  onRetry,
  hasCachedData = false,
  children,
}: {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  hasCachedData?: boolean;
  children: ReactNode;
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-7 w-7" />
      </div>
    );
  }

  if (isError && !hasCachedData) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-content-muted">Couldn't load. Check your connection.</p>
        <Button variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
