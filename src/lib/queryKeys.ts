/**
 * Centralized TanStack Query keys. Keeping them in one place avoids typos and
 * makes cache invalidation targets easy to find.
 */
export const qk = {
  todos: ['todos'] as const,
  ideas: ['ideas'] as const,
  lists: ['lists'] as const,
  listEntries: (listId: string) => ['listEntries', listId] as const,
};
