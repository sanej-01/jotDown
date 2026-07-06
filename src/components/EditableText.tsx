import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { LIMITS } from '@/types/database';

interface EditableTextProps {
  value: string;
  onSave: (next: string) => void;
  /** Render with strikethrough + muted (completed items). */
  done?: boolean;
  /** Max input length; defaults to the item title limit. */
  maxLength?: number;
  className?: string;
}

/**
 * Inline-editable text (TODO-03 / FR-T3): tap to edit, Enter or blur saves,
 * Esc cancels and restores the original. Empty input cancels rather than
 * saving. Enforces the title max length (TODO-09).
 */
export function EditableText({
  value,
  onSave,
  done = false,
  maxLength = LIMITS.titleMax,
  className = '',
}: EditableTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelledRef = useRef(false);

  useLayoutEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function begin() {
    setDraft(value);
    cancelledRef.current = false;
    setEditing(true);
  }

  function commit() {
    const next = draft.trim();
    if (next && next !== value) onSave(next);
    setEditing(false);
  }

  function cancel() {
    cancelledRef.current = true;
    setDraft(value);
    setEditing(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        maxLength={maxLength}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          // Esc already handled the cancel; don't also save on the blur it fires.
          if (cancelledRef.current) {
            cancelledRef.current = false;
            return;
          }
          commit();
        }}
        className={[
          'w-full rounded-lg border border-brand bg-surface px-2 py-1 text-content',
          'focus-visible:outline-none',
          className,
        ].join(' ')}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={begin}
      className={[
        'w-full truncate text-left',
        done ? 'text-content-muted line-through' : 'text-content',
        className,
      ].join(' ')}
    >
      {value}
    </button>
  );
}
