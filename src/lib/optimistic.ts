import type { QueryClient, QueryKey } from '@tanstack/react-query';

/**
 * Build the onMutate / onError / onSettled trio for an optimistic mutation over
 * a list-shaped query cache (FR-D1: creates/edits/toggles render instantly, then
 * persist in the background; on failure the previous cache is rolled back).
 *
 * Three-phase flow (HUM-01):
 * 1. onMutate: immediately update the cache via apply() so the UI re-renders
 *    with the user's change. Save the old cache as a rollback point.
 * 2. mutationFn: fire the write to Supabase in the background.
 * 3. onError: if the write fails, restore the old cache (user sees undo).
 * 4. onSettled: invalidate the cache to refetch from the server, reconciling
 *    real ids, timestamps, owner_id, and any concurrent edits.
 *
 * `apply` receives the current cached list and the mutation variables and
 * returns the next list. It must be pure and must not mutate its input.
 */
export function optimisticList<TData, TVars>(
  qc: QueryClient,
  queryKey: QueryKey,
  apply: (current: TData[], vars: TVars) => TData[],
) {
  return {
    onMutate: async (vars: TVars) => {
      // Cancel any in-flight refetch for this query key so it doesn't overwrite
      // the optimistic update we're about to make.
      await qc.cancelQueries({ queryKey });
      const previous = qc.getQueryData<TData[]>(queryKey) ?? [];
      // Immediately update the cache; the UI will re-render with the new state.
      qc.setQueryData<TData[]>(queryKey, apply(previous, vars));
      // Return the old cache so onError can roll back if the write fails.
      return { previous };
    },
    onError: (_err: unknown, _vars: TVars, ctx: { previous: TData[] } | undefined) => {
      // Restore the cached list to its pre-mutation state (undo the optimistic update).
      if (ctx) qc.setQueryData(queryKey, ctx.previous);
    },
    onSettled: () => {
      // After the write completes (success or failure), refetch from the server
      // to reconcile real IDs (optimistic items use client UUIDs), timestamps,
      // owner_id, and any concurrent changes from other clients.
      void qc.invalidateQueries({ queryKey });
    },
  };
}
