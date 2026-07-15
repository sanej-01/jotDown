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
 * past due.
 *
 * The real <input type="date"> is the element that actually receives clicks
 * and taps — it's stretched over the decorative badge below it. This matters
 * on two fronts: iOS only opens its native date wheel for a genuine tap on
 * the real control (a hidden/zero-size input won't trigger it), while desktop
 * browsers only auto-open the calendar when the click lands on their native
 * picker-icon hotspot (a few pixels wide) rather than anywhere in the input.
 * Calling showPicker() from the input's own onClick opens the calendar no
 * matter where in the control the click landed, on both platforms.
 */
export function DueDateControl({ dueDate, onChange }: DueDateControlProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function openPicker() {
    const el = inputRef.current;
    if (el && typeof el.showPicker === 'function') el.showPicker();
  }

  const overdue = dueDate ? isOverdue(dueDate) : false;

  return (
    <div className="group relative shrink-0">
      {/* Decorative badge — visual only; the input on top handles all interaction. */}
      {dueDate ? (
        <span
          aria-hidden
          className={[
            'block rounded-pill border px-2.5 py-1 text-xs font-medium',
            overdue ? 'border-danger/40 text-danger' : 'border-border text-content-muted',
          ].join(' ')}
        >
          {dueLabel(dueDate)}
        </span>
      ) : (
        <span
          aria-hidden
          className="flex h-9 w-9 items-center justify-center rounded-full text-content-muted transition-colors group-hover:bg-surface-muted group-hover:text-content"
        >
          <CalendarIcon className="h-4 w-4" />
        </span>
      )}

      {/* Real date input, stretched over the badge so every click/tap in the
          control's full area opens the picker, not just a narrow hotspot. */}
      <input
        ref={inputRef}
        type="date"
        value={dueDate ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        onClick={openPicker}
        aria-label={dueDate ? `Due ${dueLabel(dueDate)}. Change or clear due date` : 'Set due date'}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </div>
  );
}
