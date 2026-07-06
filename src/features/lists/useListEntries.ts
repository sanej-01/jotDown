import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { itemsRepo } from '@/data/items.repo';
import { qk } from '@/lib/queryKeys';
import { optimisticList } from '@/lib/optimistic';
import {
  useAddItem,
  useDeleteItem,
  useEditTitle,
  useReorderItem,
  useRestoreItem,
  useToggleItem,
  type ItemScope,
} from '@/features/items/itemMutations';
import type { Item } from '@/types/database';

function entryScope(listId: string): ItemScope {
  return { queryKey: qk.listEntries(listId), type: 'list_entry', listId };
}

/** Fetch a list's non-deleted entries (ordered by sort_order). */
export function useListEntries(listId: string) {
  return useQuery({
    queryKey: qk.listEntries(listId),
    queryFn: () => itemsRepo.listEntries(listId),
    enabled: Boolean(listId),
  });
}

/**
 * Entry mutations for a list. Same add/check/edit/delete/reorder as todos
 * (minus due dates, FR-L2), plus "Clear completed" (FR-L4 / LIST-03).
 */
export function useListEntryActions(listId: string) {
  const scope = entryScope(listId);
  const qc = useQueryClient();

  const { add } = useAddItem(scope);
  const { toggle } = useToggleItem(scope);
  const { editTitle } = useEditTitle(scope);
  const { reorder } = useReorderItem(scope);
  const { remove } = useDeleteItem(scope);
  const { restore } = useRestoreItem(scope);

  // Clear completed: soft-delete all done entries as one undoable action.
  const clearMutation = useMutation({
    mutationFn: (ids: string[]) => itemsRepo.softDeleteMany(ids),
    ...optimisticList<Item, string[]>(qc, scope.queryKey, (cur, ids) => {
      const gone = new Set(ids);
      return cur.filter((i) => !gone.has(i.id));
    }),
  });

  const restoreClearedMutation = useMutation({
    mutationFn: (items: Item[]) => itemsRepo.restoreMany(items.map((i) => i.id)),
    ...optimisticList<Item, Item[]>(qc, scope.queryKey, (cur, items) =>
      [...cur, ...items].sort((a, b) => a.sort_order - b.sort_order),
    ),
  });

  /** Clears done entries; resolves with the cleared items for undo. */
  const clearCompleted = useCallback(async (): Promise<Item[]> => {
    const current = qc.getQueryData<Item[]>(scope.queryKey) ?? [];
    const cleared = current.filter((i) => i.done);
    if (cleared.length === 0) return [];
    await clearMutation.mutateAsync(cleared.map((i) => i.id));
    return cleared;
  }, [qc, scope.queryKey, clearMutation]);

  const restoreCleared = useCallback(
    (items: Item[]) => restoreClearedMutation.mutate(items),
    [restoreClearedMutation],
  );

  return useMemo(
    () => ({ add, toggle, editTitle, reorder, remove, restore, clearCompleted, restoreCleared }),
    [add, toggle, editTitle, reorder, remove, restore, clearCompleted, restoreCleared],
  );
}
