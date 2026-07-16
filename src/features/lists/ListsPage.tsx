import { AddInput } from '@/components/AddInput';
import { EmptyState } from '@/components/EmptyState';
import { QueryState } from '@/components/QueryState';
import { LIMITS } from '@/types/database';
import { ListRow } from './ListRow';
import { useCreateList, useLists } from './useLists';

export function ListsPage() {
  const lists = useLists();
  const { create } = useCreateList();

  const items = lists.data ?? [];

  return (
    <section aria-label="Lists">
      <AddInput
        placeholder="New list…"
        ariaLabel="New list name"
        maxLength={LIMITS.listNameMax}
        onAdd={(name) => create(name)}
      />

      <QueryState
        isLoading={lists.isLoading}
        isError={lists.isError}
        hasCachedData={Boolean(lists.data)}
        onRetry={() => lists.refetch()}
      >
        {items.length === 0 ? (
          <EmptyState>No lists yet. Create one above — try "Shopping".</EmptyState>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {items.map((list) => (
              <ListRow key={list.id} list={list} />
            ))}
          </ul>
        )}
      </QueryState>
    </section>
  );
}
