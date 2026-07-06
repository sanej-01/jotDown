/** Minimal loading spinner. */
export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={[
        'inline-block h-5 w-5 animate-spin rounded-full',
        'border-2 border-border border-t-brand',
        className,
      ].join(' ')}
    />
  );
}

/** Full-screen centered spinner for route/session loading states. */
export function FullscreenLoader() {
  return (
    <div className="flex min-h-full items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
