import type { ReactNode } from 'react';

/** Friendly empty-state message (FR-T7 and friends). */
export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="mt-10 px-4 text-center text-sm text-content-muted">{children}</p>
  );
}
