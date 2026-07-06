import type { Item } from '@/types/database';

/**
 * Fractional sort-order helpers (Appendix: "fractional sort_order — midpoint
 * insertion"). Items are ordered by ascending `sort_order`; inserting between
 * two neighbours uses their midpoint so no other rows need rewriting.
 *
 * Precision note: repeated midpoint insertions between the same two neighbours
 * will eventually exhaust float precision. The PRD calls for server-side
 * re-normalization when gaps exhaust; for the MVP that is a rare edge and left
 * as a follow-up. New items always append (max + STEP), which never degrades.
 */
const STEP = 1;

/** Order key for a new item appended after all existing ones. */
export function appendOrder(items: readonly Item[]): number {
  if (items.length === 0) return STEP;
  const max = Math.max(...items.map((i) => i.sort_order));
  return max + STEP;
}

/** Order key for a new item placed before all existing ones (newest-first). */
export function prependOrder(items: readonly Item[]): number {
  if (items.length === 0) return STEP;
  const min = Math.min(...items.map((i) => i.sort_order));
  return min - STEP;
}

/**
 * Order key that places an item between `before` and `after` (either may be
 * undefined when dropping at an end of the list).
 *
 * Edge cases (used by TODO-07 drag-to-reorder):
 * - Both undefined: brand-new reorder (drop in empty?), use STEP = 1
 * - No `before`: dropping above others, use after.sort_order - 1 (prepend)
 * - No `after`: dropping below all, use before.sort_order + 1 (append)
 * - Both present: use midpoint (before + after) / 2 (fractional insertion)
 *
 * Why this works: neighbors provide a bounded interval; the midpoint is always
 * valid and lies strictly between them (no collision with existing items).
 */
export function orderBetween(before?: Item, after?: Item): number {
  if (!before && !after) return STEP;
  if (!before) return after!.sort_order - STEP;
  if (!after) return before.sort_order + STEP;
  return (before.sort_order + after.sort_order) / 2;
}
