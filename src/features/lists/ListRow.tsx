import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '@/components/icons';
import type { ListWithCounts } from '@/data/lists.repo';

/**
 * A list card on the Lists screen: emoji, name, "N of M done" count, a progress
 * bar, and a chevron. The whole card links into the list detail.
 */
export function ListRow({ list }: { list: ListWithCounts }) {
  const { total, done } = list;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const allDone = total > 0 && done === total;

  return (
    <li>
      <Link
        to={`/lists/${list.id}`}
        className="flex items-center gap-3 rounded-card border border-border bg-surface px-4 py-3 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-muted text-lg">
          {list.emoji ?? '📝'}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-content">{list.name}</p>
          <p className="text-xs text-content-muted">
            {done} of {total} done {allDone && '✓'}
          </p>
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <ChevronRightIcon className="h-4 w-4 shrink-0 text-content-muted" />
      </Link>
    </li>
  );
}
