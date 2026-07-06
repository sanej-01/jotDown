import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { itemsRepo } from '@/data/items.repo';
import { qk } from '@/lib/queryKeys';
import { optimisticList } from '@/lib/optimistic';
import { clampNote, clampTitle, isNonEmpty } from '@/lib/validation';
import {
  useDeleteItem,
  useRestoreItem,
  type ItemScope,
} from '@/features/items/itemMutations';
import type { Item } from '@/types/database';

const ideaScope: ItemScope = { queryKey: qk.ideas, type: 'idea', listId: null };

/** Fetch all non-deleted ideas, newest-first (FR-I2). */
export function useIdeas() {
  return useQuery({
    queryKey: qk.ideas,
    queryFn: () =>
      itemsRepo.listByType('idea', { orderBy: 'created_at', ascending: false }),
  });
}

/** Add an idea (title + optional note), inserted at the top (newest-first). */
export function useAddIdea() {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (row: Item) =>
      itemsRepo.insert({
        id: row.id,
        type: 'idea',
        title: row.title,
        note: row.note,
        sort_order: row.sort_order,
      }),
    // Prepend: ideas are shown newest-first.
    ...optimisticList<Item, Item>(qc, qk.ideas, (cur, row) => [row, ...cur]),
  });

  const add = useCallback(
    (title: string, note = '') => {
      if (!isNonEmpty(title)) return;
      const now = new Date().toISOString();
      const row: Item = {
        id: crypto.randomUUID(),
        owner_id: '',
        type: 'idea',
        list_id: null,
        title: clampTitle(title),
        note: clampNote(note),
        done: false,
        due_date: null,
        sort_order: 0,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      };
      mutation.mutate(row);
    },
    [mutation],
  );

  return { ...mutation, add };
}

/** Edit an idea's title and/or note. */
export function useEditIdea() {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (v: { id: string; title?: string; note?: string }) =>
      itemsRepo.update(v.id, {
        ...(v.title !== undefined ? { title: clampTitle(v.title) } : {}),
        ...(v.note !== undefined ? { note: clampNote(v.note) } : {}),
      }),
    ...optimisticList<Item, { id: string; title?: string; note?: string }>(
      qc,
      qk.ideas,
      (cur, v) =>
        cur.map((i) =>
          i.id === v.id
            ? {
                ...i,
                ...(v.title !== undefined ? { title: clampTitle(v.title) } : {}),
                ...(v.note !== undefined ? { note: clampNote(v.note) } : {}),
              }
            : i,
        ),
    ),
  });

  const edit = useCallback(
    (id: string, patch: { title?: string; note?: string }) => {
      // Don't wipe a title to empty; a blank note is allowed.
      if (patch.title !== undefined && !isNonEmpty(patch.title)) return;
      mutation.mutate({ id, ...patch });
    },
    [mutation],
  );

  return { ...mutation, edit };
}

/** Idea delete + restore reuse the shared item hooks. */
export function useIdeaActions() {
  const { remove } = useDeleteItem(ideaScope);
  const { restore } = useRestoreItem(ideaScope);
  return { remove, restore };
}
