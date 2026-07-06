import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { itemsRepo } from '@/data/items.repo';
import { qk } from '@/lib/queryKeys';
import {
  useAddItem,
  useDeleteItem,
  useEditTitle,
  useReorderItem,
  useRestoreItem,
  useSetDueDate,
  useToggleItem,
  type ItemScope,
} from '@/features/items/itemMutations';

const todoScope: ItemScope = { queryKey: qk.todos, type: 'todo', listId: null };

/** Fetch all non-deleted todos (ordered by sort_order). */
export function useTodos() {
  return useQuery({
    queryKey: qk.todos,
    queryFn: () => itemsRepo.listByType('todo'),
  });
}

/**
 * All todo mutations bound to the todos cache. Grouped so components pull one
 * hook: `const { add, toggle, remove, restore, ... } = useTodoActions()`.
 */
export function useTodoActions() {
  const { add } = useAddItem(todoScope);
  const { toggle } = useToggleItem(todoScope);
  const { editTitle } = useEditTitle(todoScope);
  const { setDueDate } = useSetDueDate(todoScope);
  const { reorder } = useReorderItem(todoScope);
  const { remove } = useDeleteItem(todoScope);
  const { restore } = useRestoreItem(todoScope);

  return useMemo(
    () => ({ add, toggle, editTitle, setDueDate, reorder, remove, restore }),
    [add, toggle, editTitle, setDueDate, reorder, remove, restore],
  );
}
