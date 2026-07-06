import { useMemo, useState } from 'react';
import { AddInput } from '@/components/AddInput';
import { EmptyState } from '@/components/EmptyState';
import { QueryState } from '@/components/QueryState';
import { SearchIcon } from '@/components/icons';
import { useToast } from '@/components/ui/Toast';
import { IdeaCard } from './IdeaCard';
import { useAddIdea, useEditIdea, useIdeaActions, useIdeas } from './useIdeas';
import type { Item } from '@/types/database';

export function IdeasPage() {
  const ideas = useIdeas();
  const { add } = useAddIdea();
  const { edit } = useEditIdea();
  const { remove, restore } = useIdeaActions();
  const { showToast } = useToast();

  const [filter, setFilter] = useState('');

  // Case-insensitive filter over title + note (FR-I4 / IDEA-02).
  const visible = useMemo(() => {
    const list = ideas.data ?? [];
    const q = filter.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (i) =>
        i.title.toLowerCase().includes(q) || i.note.toLowerCase().includes(q),
    );
  }, [ideas.data, filter]);

  function handleDelete(item: Item) {
    remove(item);
    showToast({ message: 'Idea deleted', actionLabel: 'Undo', onAction: () => restore(item) });
  }

  const hasIdeas = (ideas.data ?? []).length > 0;

  return (
    <section aria-labelledby="ideas-heading">
      <h1 id="ideas-heading" className="mb-3 text-sm font-medium text-content-muted">
        Ideas
      </h1>

      <AddInput placeholder="Jot an idea…" ariaLabel="Jot an idea" onAdd={add} />

      {hasIdeas && (
        <div className="relative mt-3">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
          <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter ideas…"
            aria-label="Filter ideas"
            className="min-h-touch w-full rounded-pill border border-border bg-surface pl-11 pr-4 py-2 text-content placeholder:text-content-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
        </div>
      )}

      <QueryState
        isLoading={ideas.isLoading}
        isError={ideas.isError}
        hasCachedData={Boolean(ideas.data)}
        onRetry={() => ideas.refetch()}
      >
        {!hasIdeas ? (
          <EmptyState>No ideas yet. Jot your first one above.</EmptyState>
        ) : visible.length === 0 ? (
          <EmptyState>No ideas match "{filter}".</EmptyState>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {visible.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onEditTitle={(id, title) => edit(id, { title })}
                onEditNote={(id, note) => edit(id, { note })}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        )}
      </QueryState>
    </section>
  );
}
