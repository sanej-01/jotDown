import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AddInput } from '@/components/AddInput';
import { ItemRow } from '@/components/ItemRow';
import { ReorderableList } from '@/components/ReorderableList';
import { EmptyState } from '@/components/EmptyState';
import { EditableText } from '@/components/EditableText';
import { QueryState } from '@/components/QueryState';
import { ChevronLeftIcon, TrashIcon } from '@/components/icons';
import { LIMITS } from '@/types/database';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { useDeleteList, useLists, useRenameList, useRestoreList } from './useLists';
import { useListEntries, useListEntryActions } from './useListEntries';
import type { Item } from '@/types/database';

export function ListDetailPage() {
  const { listId = '' } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const lists = useLists();
  const list = useMemo(
    () => (lists.data ?? []).find((l) => l.id === listId),
    [lists.data, listId],
  );

  const { rename } = useRenameList();
  const { remove: removeList } = useDeleteList();
  const { restore: restoreList } = useRestoreList();

  const entries = useListEntries(listId);
  const { add, toggle, editTitle, reorder, remove, restore, clearCompleted, restoreCleared } =
    useListEntryActions(listId);

  const [confirmOpen, setConfirmOpen] = useState(false);

  // Split list entries into open (reorderable) and done (static, with clear action).
  // The underlying order is sort_order (ascending) per the useListEntries query.
  const { open, done } = useMemo(() => {
    const list = entries.data ?? [];
    return { open: list.filter((e) => !e.done), done: list.filter((e) => e.done) };
  }, [entries.data]);

  function handleDeleteEntry(item: Item) {
    remove(item);
    showToast({ message: 'Item deleted', actionLabel: 'Undo', onAction: () => restore(item) });
  }

  async function handleClearCompleted() {
    const cleared = await clearCompleted();
    if (cleared.length > 0) {
      showToast({
        message: `Cleared ${cleared.length}`,
        actionLabel: 'Undo',
        onAction: () => restoreCleared(cleared),
      });
    }
  }

  async function handleDeleteList() {
    setConfirmOpen(false);
    const { entryIds } = await removeList(listId);
    navigate('/lists', { replace: true });
    showToast({
      message: 'List deleted',
      actionLabel: 'Undo',
      onAction: () => restoreList(listId, entryIds),
    });
  }

  const isEmpty = open.length === 0 && done.length === 0;

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate('/lists')}
          aria-label="Back to lists"
          className="flex h-9 w-9 items-center justify-center rounded-full text-content-muted hover:bg-surface-muted hover:text-content focus-visible:outline-none"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>

        <span aria-hidden className="text-lg">
          {list?.emoji ?? '📝'}
        </span>

        <div className="min-w-0 flex-1 text-base font-semibold">
          {list ? (
            <EditableText
              value={list.name}
              maxLength={LIMITS.listNameMax}
              onSave={(name) => rename(list.id, name)}
            />
          ) : (
            <span className="text-content-muted">List</span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          aria-label="Delete list"
          className="flex h-9 w-9 items-center justify-center rounded-full text-content-muted hover:bg-surface-muted hover:text-danger focus-visible:outline-none"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>

      <AddInput placeholder="Add item…" ariaLabel="Add item" onAdd={add} autoFocus />

      <QueryState
        isLoading={entries.isLoading}
        isError={entries.isError}
        hasCachedData={Boolean(entries.data)}
        onRetry={() => entries.refetch()}
      >
        {isEmpty ? (
          <EmptyState>This list is empty. Add your first item above.</EmptyState>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {/* ReorderableList renders only open entries (TODO-07). Unlike Todos,
                list entries have no trailing due-date control, only the reorder
                handle and delete button. The reorder handler persists fractional
                sort_order changes to Supabase via the data layer. */}
            <ReorderableList
              items={open}
              onToggle={toggle}
              onEditTitle={editTitle}
              onDelete={handleDeleteEntry}
              onReorder={reorder}
            />

            {done.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-content-muted">
                  <span className="h-px flex-1 bg-border" />
                  Completed · {done.length}
                  <span className="h-px flex-1 bg-border" />
                </div>
                <ul className="flex flex-col gap-2">
                  {done.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      onToggle={toggle}
                      onEditTitle={editTitle}
                      onDelete={handleDeleteEntry}
                    />
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={handleClearCompleted}
                  className="mt-1 self-center text-sm font-medium text-content-muted hover:text-content focus-visible:outline-none"
                >
                  Clear completed
                </button>
              </div>
            )}
          </div>
        )}
      </QueryState>

      <ConfirmDialog
        open={confirmOpen}
        title={`Delete "${list?.name ?? 'list'}"?`}
        message="This deletes the list and its items. You can undo right after."
        onConfirm={handleDeleteList}
        onCancel={() => setConfirmOpen(false)}
      />
    </section>
  );
}
