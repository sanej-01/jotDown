import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-strong disabled:opacity-60',
  secondary:
    'bg-surface text-content border border-border hover:bg-surface-muted disabled:opacity-60',
  ghost: 'bg-transparent text-content-muted hover:text-content',
};

/** Pill button matching the prototype. 44px min height for touch (NFR-5). */
export function Button({
  variant = 'primary',
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        'inline-flex min-h-touch items-center justify-center gap-2 rounded-pill px-5 py-3',
        'text-sm font-semibold transition-colors',
        'focus-visible:outline-none disabled:cursor-not-allowed',
        variants[variant],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    />
  );
}
