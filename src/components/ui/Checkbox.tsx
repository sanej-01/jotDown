import { CheckIcon } from '../icons';

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  /** Accessible label announced by screen readers (ACC-02). */
  label: string;
}

/**
 * Circular checkbox backed by a real <input> (NFR-5: checkboxes are real
 * inputs, keyboard-reachable, announce label + state). The 44px label makes
 * the whole target tappable.
 */
export function Checkbox({ checked, onChange, label }: CheckboxProps) {
  return (
    <label className="flex min-h-touch min-w-touch cursor-pointer items-center justify-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={label}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={[
          'flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-brand peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-canvas',
          checked ? 'border-brand bg-brand text-white' : 'border-content-muted/50 bg-transparent',
        ].join(' ')}
      >
        {checked && <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
    </label>
  );
}
