/**
 * Application data model types, mirroring the Supabase schema in
 * `supabase/migrations/0001_init.sql`. Kept hand-written (rather than generated)
 * to stay dependency-light for the MVP; regenerate/replace with
 * `supabase gen types` later if desired.
 */

export type ItemType = 'todo' | 'idea' | 'list_entry';

/** A row in the `items` table (todos, ideas, and entries inside a list). */
export interface Item {
  id: string;
  owner_id: string;
  type: ItemType;
  /** Set only when type === 'list_entry'; null for todos and ideas. */
  list_id: string | null;
  title: string;
  /** Free-form note. Empty string when unused. */
  note: string;
  done: boolean;
  /** Timezone-naive ISO date (YYYY-MM-DD) or null. Todos only. */
  due_date: string | null;
  /** Fractional order key for midpoint-insertion reordering. */
  sort_order: number;
  created_at: string;
  updated_at: string;
  /** Soft-delete marker. Non-null rows are hidden from every view. */
  deleted_at: string | null;
}

/** A row in the `lists` table. */
export interface List {
  id: string;
  owner_id: string;
  name: string;
  emoji: string | null;
  created_at: string;
  deleted_at: string | null;
}

/** Field length guardrails, shared by client validation and the DB CHECK constraints. */
export const LIMITS = {
  titleMax: 500,
  noteMax: 5000,
  listNameMax: 100,
  maxLists: 100,
  maxEntriesPerList: 500,
} as const;
