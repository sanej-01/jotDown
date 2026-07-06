import { useCallback } from 'react';
import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { itemsRepo } from '@/data/items.repo';
import { optimisticList } from '@/lib/optimistic';
import { appendOrder, orderBetween } from '@/lib/sortOrder';
import { clampNote, clampTitle, isNonEmpty } from '@/lib/validation';
import { qk } from '@/lib/queryKeys';
import type { Item, ItemType } from '@/types/database';

/**
 * Optimistic mutation hooks shared by Todos and List entries — both are `items`
 * rows with the same add / toggle / edit / reorder / delete / restore behavior.
 * Ideas differ enough (newest-first, note-on-add) to have their own hook.
 *
 * `scope` identifies which cached list a mutation touches. It is a plain object
 * recomputed each render; TanStack compares query keys structurally so that's
 * fine.
 */
export interface ItemScope {
  queryKey: QueryKey;
  type: ItemType;
  listId?: string | null;
}

/** Keep a cached list ordered by sort_order ascending after an optimistic edit. */
function bySortOrder(a: Item, b: Item): number {
  return a.sort_order - b.sort_order;
}

/**
 * List entries feed the "N of M done" counts cached under qk.lists (the Lists
 * overview screen). That query is separate from qk.listEntries(listId), so
 * mutations that change an entry's total/done count must invalidate it too,
 * or the overview page shows stale counts after editing inside a list.
 * Todos don't affect those counts, so this is a no-op for them.
 */
function invalidateListCountsIfEntry(qc: ReturnType<typeof useQueryClient>, scope: ItemScope) {
  if (scope.type === 'list_entry') void qc.invalidateQueries({ queryKey: qk.lists });
}

/** Add a new todo / list entry (appended to the end). */
export function useAddItem(scope: ItemScope) {
  const qc = useQueryClient();
  const sync = optimisticList<Item, Item>(qc, scope.queryKey, (cur, row) => [...cur, row]);
  const mutation = useMutation({
    mutationFn: (row: Item) =>
      itemsRepo.insert({
        id: row.id,
        type: row.type,
        list_id: row.list_id,
        title: row.title,
        note: row.note,
        done: row.done,
        due_date: row.due_date,
        sort_order: row.sort_order,
      }),
    ...sync,
    onSettled: () => {
      sync.onSettled();
      invalidateListCountsIfEntry(qc, scope);
    },
  });

  const add = useCallback(
    (title: string, extra?: { note?: string; dueDate?: string | null }) => {
      // Whitespace-only is a silent no-op (TODO-08 / Appendix).
      if (!isNonEmpty(title)) return;
      const current = qc.getQueryData<Item[]>(scope.queryKey) ?? [];
      const now = new Date().toISOString();
      const row: Item = {
        id: crypto.randomUUID(), // client-generated for idempotency (FR-D2)
        owner_id: '', // filled by the DB default; not rendered
        type: scope.type,
        list_id: scope.listId ?? null,
        title: clampTitle(title),
        note: clampNote(extra?.note ?? ''),
        done: false,
        due_date: extra?.dueDate ?? null,
        sort_order: appendOrder(current),
        created_at: now,
        updated_at: now,
        deleted_at: null,
      };
      mutation.mutate(row);
    },
    // mutation identity is stable enough for our use; deps kept minimal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [qc, scope.queryKey, scope.type, scope.listId],
  );

  return { ...mutation, add };
}

/** Toggle done/undone. */
export function useToggleItem(scope: ItemScope) {
  const qc = useQueryClient();
  const sync = optimisticList<Item, { id: string; done: boolean }>(qc, scope.queryKey, (cur, v) =>
    cur.map((i) => (i.id === v.id ? { ...i, done: v.done } : i)),
  );
  const mutation = useMutation({
    mutationFn: (v: { id: string; done: boolean }) => itemsRepo.update(v.id, { done: v.done }),
    ...sync,
    onSettled: () => {
      sync.onSettled();
      invalidateListCountsIfEntry(qc, scope);
    },
  });
  const toggle = useCallback(
    (item: Item) => mutation.mutate({ id: item.id, done: !item.done }),
    [mutation],
  );
  return { ...mutation, toggle };
}

/** Edit an item's title inline. */
export function useEditTitle(scope: ItemScope) {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (v: { id: string; title: string }) => itemsRepo.update(v.id, { title: v.title }),
    ...optimisticList<Item, { id: string; title: string }>(qc, scope.queryKey, (cur, v) =>
      cur.map((i) => (i.id === v.id ? { ...i, title: v.title } : i)),
    ),
  });
  const editTitle = useCallback(
    (id: string, title: string) => {
      if (!isNonEmpty(title)) return; // don't save empty; caller restores old text
      mutation.mutate({ id, title: clampTitle(title) });
    },
    [mutation],
  );
  return { ...mutation, editTitle };
}

/** Set or clear a todo's due date. */
export function useSetDueDate(scope: ItemScope) {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (v: { id: string; due_date: string | null }) =>
      itemsRepo.update(v.id, { due_date: v.due_date }),
    ...optimisticList<Item, { id: string; due_date: string | null }>(
      qc,
      scope.queryKey,
      (cur, v) => cur.map((i) => (i.id === v.id ? { ...i, due_date: v.due_date } : i)),
    ),
  });
  const setDueDate = useCallback(
    (id: string, dueDate: string | null) => mutation.mutate({ id, due_date: dueDate }),
    [mutation],
  );
  return { ...mutation, setDueDate };
}

/**
 * Reorder a single item via drag-and-drop using fractional midpoint insertion (TODO-07).
 *
 * Design: When an item is dropped between `before` and `after`, instead of
 * rewriting sibling sort_order values, we calculate a single new sort_order
 * as the midpoint (e.g., if before.sort_order=10 and after.sort_order=20,
 * the moved item gets 15). The orderBetween() helper handles edge cases:
 * - If no `before`, prepend: sort_order = after.sort_order / 2
 * - If no `after`, append: sort_order = before.sort_order + 1
 * - If both present: sort_order = (before + after) / 2
 *
 * The mutation uses optimistic update + sort, so the UI reflects the new order
 * immediately before the write hits Supabase. On error, the cache is rolled back.
 */
export function useReorderItem(scope: ItemScope) {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (v: { id: string; sort_order: number }) =>
      itemsRepo.update(v.id, { sort_order: v.sort_order }),
    ...optimisticList<Item, { id: string; sort_order: number }>(qc, scope.queryKey, (cur, v) =>
      // Update the item's sort_order and re-sort the cached list by sort_order asc.
      cur.map((i) => (i.id === v.id ? { ...i, sort_order: v.sort_order } : i)).sort(bySortOrder),
    ),
  });
  const reorder = useCallback(
    (item: Item, before?: Item, after?: Item) =>
      mutation.mutate({ id: item.id, sort_order: orderBetween(before, after) }),
    [mutation],
  );
  return { ...mutation, reorder };
}

/** Soft-delete a single item (undo handled by useRestoreItem). */
export function useDeleteItem(scope: ItemScope) {
  const qc = useQueryClient();
  const sync = optimisticList<Item, string>(qc, scope.queryKey, (cur, id) =>
    cur.filter((i) => i.id !== id),
  );
  const mutation = useMutation({
    mutationFn: (id: string) => itemsRepo.softDelete(id),
    ...sync,
    onSettled: () => {
      sync.onSettled();
      invalidateListCountsIfEntry(qc, scope);
    },
  });
  const remove = useCallback((item: Item) => mutation.mutate(item.id), [mutation]);
  return { ...mutation, remove };
}

/** Restore a soft-deleted item to its original position (undo of delete). */
export function useRestoreItem(scope: ItemScope) {
  const qc = useQueryClient();
  const sync = optimisticList<Item, Item>(qc, scope.queryKey, (cur, item) =>
    [...cur.filter((i) => i.id !== item.id), item].sort(bySortOrder),
  );
  const mutation = useMutation({
    mutationFn: (item: Item) => itemsRepo.restore(item.id),
    ...sync,
    onSettled: () => {
      sync.onSettled();
      invalidateListCountsIfEntry(qc, scope);
    },
  });
  const restore = useCallback((item: Item) => mutation.mutate(item), [mutation]);
  return { ...mutation, restore };
}
