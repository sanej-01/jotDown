interface BrandProps {
  /** Show the tagline under the wordmark (used on the auth screens). */
  withTagline?: boolean;
  className?: string;
  /** Increase text size by 20% (used on auth screens). */
  large?: boolean;
  /** Shrink text size (used in the app-shell header, which also holds nav tabs). */
  small?: boolean;
}

/** The "jotdown" wordmark, optionally with the tagline. */
export function Brand({ withTagline = false, className = '', large = false, small = false }: BrandProps) {
  const textSize = large ? 'text-[1.65rem]' : small ? 'text-base' : 'text-2xl';
  const taglineGap = large ? 'mt-0' : 'mt-1';
  return (
    <div className={className}>
      <span className={`${textSize} font-extrabold tracking-tight`}>
        <span className="text-brand-strong">jot</span>
        <span className="text-content">down</span>
      </span>
      {withTagline && (
        <p className={`${taglineGap} text-sm text-content-muted`}>catch it b4 it's gone</p>
      )}
    </div>
  );
}
