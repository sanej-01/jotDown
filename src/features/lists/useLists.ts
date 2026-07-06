import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listsRepo, type ListWithCounts } from '@/data/lists.repo';
import { qk } from '@/lib/queryKeys';
import { optimisticList } from '@/lib/optimistic';
import { clampListName, isNonEmpty } from '@/lib/validation';
import { LIMITS } from '@/types/database';

/** Fetch all non-deleted lists with their entry counts (newest-first). */
export function useLists() {
  return useQuery({
    queryKey: qk.lists,
    queryFn: () => listsRepo.listWithCounts(),
  });
}

/** Create a list (with optional emoji). Enforces the max-lists guardrail (FR-L5). */
export function useCreateList() {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (list: ListWithCounts) =>
      listsRepo.insert({ id: list.id, name: list.name, emoji: list.emoji }),
    ...optimisticList<ListWithCounts, ListWithCounts>(qc, qk.lists, (cur, list) => [
      list,
      ...cur,
    ]),
  });

  const create = useCallback(
    (name: string, emoji: string | null = null) => {
      if (!isNonEmpty(name)) return;
      const current = qc.getQueryData<ListWithCounts[]>(qk.lists) ?? [];
      if (current.length >= LIMITS.maxLists) return; // guardrail: max 100 lists
      const now = new Date().toISOString();
      const list: ListWithCounts = {
        id: crypto.randomUUID(),
        owner_id: '',
        name: clampListName(name),
        emoji,
        created_at: now,
        deleted_at: null,
        total: 0,
        done: 0,
      };
      mutation.mutate(list);
    },
    [qc, mutation],
  );

  return { ...mutation, create };
}

/** Rename a list (LIST-04: 100 accepted, 101 blocked). */
export function useRenameList() {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (v: { id: string; name: string }) =>
      listsRepo.update(v.id, { name: v.name }),
    ...optimisticList<ListWithCounts, { id: string; name: string }>(qc, qk.lists, (cur, v) =>
      cur.map((l) => (l.id === v.id ? { ...l, name: v.name } : l)),
    ),
  });

  const rename = useCallback(
    (id: string, name: string) => {
      if (!isNonEmpty(name)) return;
      mutation.mutate({ id, name: clampListName(name) });
    },
    [mutation],
  );

  return { ...mutation, rename };
}

/**
 * Delete a list and its entries (LIST-02). `remove` resolves with the deleted
 * entry ids so an undo toast can restore exactly those via `restore`.
 */
export function useDeleteList() {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (id: string) => listsRepo.softDeleteWithEntries(id),
    ...optimisticList<ListWithCounts, string>(qc, qk.lists, (cur, id) =>
      cur.filter((l) => l.id !== id),
    ),
    onSettled: (_data, _err, id) => {
      void qc.invalidateQueries({ queryKey: qk.lists });
      void qc.invalidateQueries({ queryKey: qk.listEntries(id) });
    },
  });

  const remove = useCallback(
    (id: string) => mutation.mutateAsync(id), // resolves to { entryIds }
    [mutation],
  );

  return { ...mutation, remove };
}

/** Restore a deleted list together with its entries (undo of delete). */
export function useRestoreList() {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (v: { id: string; entryIds: string[] }) =>
      listsRepo.restoreWithEntries(v.id, v.entryIds),
    onSettled: (_data, _err, v) => {
      void qc.invalidateQueries({ queryKey: qk.lists });
      void qc.invalidateQueries({ queryKey: qk.listEntries(v.id) });
    },
  });

  const restore = useCallback(
    (id: string, entryIds: string[]) => mutation.mutate({ id, entryIds }),
    [mutation],
  );

  return { ...mutation, restore };
}
