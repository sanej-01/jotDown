import { useLayoutEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { LIMITS } from '@/types/database';

interface EditableTextProps {
  value: string;
  onSave: (next: string) => void;
  /** Render with strikethrough + muted (completed items). */
  done?: boolean;
  /** Max input length; defaults to the item title limit. */
  maxLength?: number;
  className?: string;
  /**
   * Render as a taller, word-wrapping field instead of the default single
   * line: a multi-line clamp while collapsed, a textarea while editing.
   * Bold while collapsed, normal weight while editing (used for idea titles,
   * which can run long).
   */
  multiline?: boolean;
  /** Lines shown when collapsed; only used when multiline. */
  displayLines?: 2 | 3 | 4;
  /** Textarea rows while editing; only used when multiline. */
  editRows?: number;
  /** Notifies the parent when edit mode starts/stops (e.g. to show a color picker alongside). */
  onEditingChange?: (editing: boolean) => void;
}

const lineClampClasses: Record<number, string> = {
  2: 'line-clamp-2',
  3: 'line-clamp-3',
  4: 'line-clamp-4',
};

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
  multiline = false,
  displayLines = 2,
  editRows = 5,
  onEditingChange,
}: EditableTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cancelledRef = useRef(false);

  useLayoutEffect(() => {
    if (editing) {
      const el = multiline ? textareaRef.current : inputRef.current;
      el?.focus();
      el?.select();
    }
  }, [editing, multiline]);

  function begin() {
    setDraft(value);
    cancelledRef.current = false;
    setEditing(true);
    onEditingChange?.(true);
  }

  function commit() {
    const next = draft.trim();
    if (next && next !== value) onSave(next);
    setEditing(false);
    onEditingChange?.(false);
  }

  function cancel() {
    cancelledRef.current = true;
    setDraft(value);
    setEditing(false);
    onEditingChange?.(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setDraft(e.target.value);
  }

  function handleBlur() {
    // Esc already handled the cancel; don't also save on the blur it fires.
    if (cancelledRef.current) {
      cancelledRef.current = false;
      return;
    }
    commit();
  }

  if (editing) {
    if (multiline) {
      return (
        <textarea
          ref={textareaRef}
          rows={editRows}
          value={draft}
          maxLength={maxLength}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className={[
            'w-full resize-none rounded-lg border border-brand bg-surface px-2 py-1 font-normal text-content',
            'focus-visible:outline-none',
            className,
          ].join(' ')}
        />
      );
    }

    return (
      <input
        ref={inputRef}
        value={draft}
        maxLength={maxLength}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
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
        'w-full text-left',
        multiline ? [lineClampClasses[displayLines] ?? 'line-clamp-2', 'font-semibold'].join(' ') : 'truncate',
        done ? 'text-content-muted line-through' : 'text-content',
        className,
      ].join(' ')}
    >
      {value}
    </button>
  );
}
