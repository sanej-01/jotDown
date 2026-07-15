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

  const overdue = dueDate ? isOverdue(dueDate) : false;

  return (
    <label className="group relative inline-block shrink-0 cursor-pointer">
      {/* Visual badge/icon — wrapped in a label so clicks pass through to the input.
          The label naturally focuses/activates the associated input, so the native
          date picker opens on both desktop and iOS without needing JavaScript. */}
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

      {/* Real date input — now positioned without absolute positioning, so it only
          occupies its natural space and doesn't interfere with sibling elements.
          The label wrapping it ensures clicks on the visual badge pass through. */}
      <input
        ref={inputRef}
        type="date"
        value={dueDate ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        aria-label={dueDate ? `Due ${dueLabel(dueDate)}. Change or clear due date` : 'Set due date'}
        className="sr-only"
      />
    </label>
  );
}
