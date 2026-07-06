import { forwardRef, useId, type InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Inline error message shown below the field. */
  error?: string;
  /** Visually hide the label but keep it for screen readers. */
  hideLabel?: boolean;
}

/** Rounded input matching the prototype, with accessible label + error. */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, hideLabel = false, id, className = '', ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className={hideLabel ? 'sr-only' : 'mb-1 block text-sm font-medium text-content-muted'}
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={[
          'w-full min-h-touch rounded-2xl border bg-surface px-4 py-3 text-content',
          'placeholder:text-content-muted',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
          error ? 'border-danger' : 'border-border',
          className,
        ].join(' ')}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
