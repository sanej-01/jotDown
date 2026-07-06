/**
 * Date helpers for todo due dates. Dates are timezone-naive `YYYY-MM-DD`
 * strings; "overdue" compares against the user's *local* date (Appendix:
 * "dates are timezone-naive; 'overdue' compares to user's local date").
 */

/** Today as a local `YYYY-MM-DD` string. */
export function todayLocalISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** True when the due date is strictly before today (local). */
export function isOverdue(due: string): boolean {
  // Lexicographic comparison is correct for zero-padded ISO dates.
  return due < todayLocalISO();
}

/** Format a `YYYY-MM-DD` string as e.g. "Jul 2" in the user's locale. */
export function formatShortDate(due: string): string {
  const [y, m, d] = due.split('-').map(Number);
  if (!y || !m || !d) return due;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

/** Badge label for a due date: "Overdue · Jul 2" or "Jul 12". */
export function dueLabel(due: string): string {
  const short = formatShortDate(due);
  return isOverdue(due) ? `Overdue · ${short}` : short;
}

/**
 * Idea timestamp label, e.g. "TODAY · 09:41", "YESTERDAY · 22:40", or
 * "JUL 2 · 14:10" for older items.
 */
export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const time = d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  let day: string;
  if (d.toDateString() === now.toDateString()) day = 'TODAY';
  else if (d.toDateString() === yesterday.toDateString()) day = 'YESTERDAY';
  else day = formatShortDate(iso.slice(0, 10)).toUpperCase();

  return `${day} · ${time}`;
}
