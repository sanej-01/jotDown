import { useMemo } from 'react';
import { AddInput } from '@/components/AddInput';
import { ItemRow } from '@/components/ItemRow';
import { ReorderableList } from '@/components/ReorderableList';
import { EmptyState } from '@/components/EmptyState';
import { QueryState } from '@/components/QueryState';
import { useToast } from '@/components/ui/Toast';
import { DueDateControl } from './DueDateControl';
import { useTodos, useTodoActions } from './useTodos';
import type { Item } from '@/types/database';

export function TodosPage() {
  const todos = useTodos();
  const { add, toggle, editTitle, setDueDate, reorder, remove, restore } = useTodoActions();
  const { showToast } = useToast();

  // Split todos into open (reorderable) and done (static).
  // The underlying database order is sort_order (ascending) from the todos query.
  // Completed todos are shown in a separate non-reorderable section (FR-T6).
  const { open, done } = useMemo(() => {
    const list = todos.data ?? [];
    return {
      open: list.filter((t) => !t.done),
      done: list.filter((t) => t.done),
    };
  }, [todos.data]);

  function handleDelete(item: Item) {
    remove(item);
    showToast({ message: 'Todo deleted', actionLabel: 'Undo', onAction: () => restore(item) });
  }

  const isEmpty = open.length === 0 && done.length === 0;

  return (
    <section aria-labelledby="todos-heading">
      <h1 id="todos-heading" className="mb-3 text-sm font-medium text-content-muted">
        Todos
      </h1>

      <AddInput placeholder="Add a task…" ariaLabel="Add a task" onAdd={add} autoFocus />

      <QueryState
        isLoading={todos.isLoading}
        isError={todos.isError}
        hasCachedData={Boolean(todos.data)}
        onRetry={() => todos.refetch()}
      >
        {isEmpty ? (
          <EmptyState>Nothing to do. Add your first task above.</EmptyState>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {/* ReorderableList renders only open todos (TODO-07). The reorder handler
                accepts the moved item and its new neighbours, calculates a fractional
                sort_order midpoint between them, and persists it to Supabase. This
                avoids rewriting sibling sort_order values. */}
            <ReorderableList
              items={open}
              onToggle={toggle}
              onEditTitle={editTitle}
              onDelete={handleDelete}
              onReorder={reorder}
              renderTrailing={(item) => (
                <DueDateControl
                  dueDate={item.due_date}
                  onChange={(d) => setDueDate(item.id, d)}
                />
              )}
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
                      onDelete={handleDelete}
                    />
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </QueryState>
    </section>
  );
}
