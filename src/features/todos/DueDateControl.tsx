import { useRef } from 'react';
import { CalendarIcon } from '@/components/icons';
import { dueLabel, isOverdue } from '@/lib/date';

interface DueDateControlProps {
  dueDate: string | null;
  onChange: (dueDate: string | null) => void;
}

/**
 * Due-date affordance for a todo (FR-T4 / TODO-06). When unset, shows a subtle
 * calendar button; when set, shows a date badge that turns red/"Overdue" when
 * past due. Tapping opens the native date picker (real <input type="date"> for
 * accessibility). Selecting the same badge again lets the user clear it.
 */
export function DueDateControl({ dueDate, onChange }: DueDateControlProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function openPicker() {
    const el = inputRef.current;
    if (!el) return;
    // showPicker() where supported; focus is the fallback.
    if (typeof el.showPicker === 'function') el.showPicker();
    else el.focus();
  }

  const overdue = dueDate ? isOverdue(dueDate) : false;

  return (
    <div className="relative shrink-0">
      {dueDate ? (
        <button
          type="button"
          onClick={openPicker}
          aria-label={`Due ${dueLabel(dueDate)}. Change or clear due date`}
          className={[
            'rounded-pill border px-2.5 py-1 text-xs font-medium focus-visible:outline-none',
            overdue ? 'border-danger/40 text-danger' : 'border-border text-content-muted',
          ].join(' ')}
        >
          {dueLabel(dueDate)}
        </button>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          aria-label="Set due date"
          className="flex h-9 w-9 items-center justify-center rounded-full text-content-muted hover:bg-surface-muted hover:text-content focus-visible:outline-none"
        >
          <CalendarIcon className="h-4 w-4" />
        </button>
      )}

      {/* Real date input, visually hidden but focusable/pickerable. */}
      <input
        ref={inputRef}
        type="date"
        value={dueDate ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="pointer-events-none absolute bottom-0 right-0 h-0 w-0 opacity-0"
        tabIndex={-1}
        aria-hidden
      />
    </div>
  );
}
