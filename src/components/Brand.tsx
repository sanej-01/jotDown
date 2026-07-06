interface BrandProps {
  /** Show the tagline under the wordmark (used on the auth screens). */
  withTagline?: boolean;
  className?: string;
}

/** The "jotdown" wordmark, optionally with the tagline. */
export function Brand({ withTagline = false, className = '' }: BrandProps) {
  return (
    <div className={className}>
      <span className="text-2xl font-extrabold tracking-tight">
        <span className="text-brand-strong">jot</span>
        <span className="text-content">down</span>
      </span>
      {withTagline && (
        <p className="mt-1 text-sm text-content-muted">catch it b4 it's gone</p>
      )}
    </div>
  );
}
