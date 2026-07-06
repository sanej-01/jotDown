import { useRef, useState, type FormEvent } from 'react';
import { PlusIcon } from './icons';
import { LIMITS } from '@/types/database';

interface AddInputProps {
  placeholder: string;
  /** Called with the trimmed value on submit. */
  onAdd: (value: string) => void;
  autoFocus?: boolean;
  ariaLabel?: string;
  /** Max input length; defaults to the item title limit. */
  maxLength?: number;
}

/**
 * The always-visible add row (FR-T1 / capture-speed): a pill input with a round
 * "+" button. Enter or the button submits; the input clears and keeps focus so
 * rapid entry never locks (HUM-01). Clearing on submit also makes an accidental
 * double-submit a no-op (HUM-02), on top of the idempotent client UUID.
 */
export function AddInput({
  placeholder,
  onAdd,
  autoFocus = false,
  ariaLabel,
  maxLength = LIMITS.titleMax,
}: AddInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return; // whitespace-only is a silent no-op (TODO-08)
    onAdd(trimmed);
    setValue('');
    inputRef.current?.focus();
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        maxLength={maxLength}
        autoFocus={autoFocus}
        className="min-h-touch w-full rounded-pill border border-border bg-surface px-5 py-3 text-content placeholder:text-content-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      />
      <button
        type="submit"
        aria-label="Add"
        className="flex h-12 w-12 min-h-touch min-w-touch shrink-0 items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand-strong focus-visible:outline-none"
      >
        <PlusIcon className="h-5 w-5" />
      </button>
    </form>
  );
}
