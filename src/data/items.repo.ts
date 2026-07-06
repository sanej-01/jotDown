import { supabase } from '@/lib/supabase';
import { unwrap } from '@/lib/errors';
import type { Item, ItemType } from '@/types/database';

/**
 * Data-access layer for the `items` table (todos, ideas, and list entries).
 * Every method is a thin, typed wrapper over the Supabase client. Business
 * rules (optimistic UI, ordering, validation) live in the feature hooks; this
 * layer only reads and writes rows, and never returns soft-deleted rows from
 * its list queries.
 *
 * Owner scoping is handled by the DB: `owner_id` defaults to `auth.uid()` on
 * insert and RLS filters every read/write, so the client never sends owner_id.
 */

/** Columns the client is allowed to set on insert. */
export interface NewItem {
  id: string; // client-generated UUID for idempotency (FR-D2)
  type: ItemType;
  list_id?: string | null;
  title: string;
  note?: string;
  done?: boolean;
  due_date?: string | null;
  sort_order: number;
}

/** Fields that can be patched on an existing item. */
export type ItemPatch = Partial<
  Pick<Item, 'title' | 'note' | 'done' | 'due_date' | 'sort_order'>
>;

const TABLE = 'items';

export const itemsRepo = {
  /**
   * Non-deleted todos or ideas. Todos are ordered by sort_order (drag-to-reorder
   * FR-T6); ideas are ordered newest-first by created_at (FR-I2).
   */
  async listByType(
    type: Exclude<ItemType, 'list_entry'>,
    opts: { orderBy?: 'sort_order' | 'created_at'; ascending?: boolean } = {},
  ): Promise<Item[]> {
    const { orderBy = 'sort_order', ascending = true } = opts;
    const result = await supabase
      .from(TABLE)
      .select('*')
      .eq('type', type)
      .is('deleted_at', null)
      .order(orderBy, { ascending });
    return unwrap(`items.listByType(${type})`, result);
  },

  /** Non-deleted entries within a list, ordered by sort_order ascending. */
  async listEntries(listId: string): Promise<Item[]> {
    const result = await supabase
      .from(TABLE)
      .select('*')
      .eq('type', 'list_entry')
      .eq('list_id', listId)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true });
    return unwrap(`items.listEntries(${listId})`, result);
  },

  async insert(item: NewItem): Promise<Item> {
    const result = await supabase
      .from(TABLE)
      .insert({
        id: item.id,
        type: item.type,
        list_id: item.list_id ?? null,
        title: item.title,
        note: item.note ?? '',
        done: item.done ?? false,
        due_date: item.due_date ?? null,
        sort_order: item.sort_order,
      })
      .select()
      .single();
    return unwrap('items.insert', result);
  },

  async update(id: string, patch: ItemPatch): Promise<Item> {
    const result = await supabase
      .from(TABLE)
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    return unwrap('items.update', result);
  },

  /** Soft delete: stamp deleted_at so the row disappears from every view. */
  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      console.error('[data] items.softDelete failed:', error);
      throw error;
    }
  },

  /** Restore a soft-deleted row (undo). */
  async restore(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE)
      .update({ deleted_at: null })
      .eq('id', id);
    if (error) {
      console.error('[data] items.restore failed:', error);
      throw error;
    }
  },

  /** Soft-delete many entries at once (list "Clear completed"). */
  async softDeleteMany(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const { error } = await supabase
      .from(TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .in('id', ids);
    if (error) {
      console.error('[data] items.softDeleteMany failed:', error);
      throw error;
    }
  },

  /** Restore many entries at once (undo of "Clear completed"). */
  async restoreMany(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const { error } = await supabase
      .from(TABLE)
      .update({ deleted_at: null })
      .in('id', ids);
    if (error) {
      console.error('[data] items.restoreMany failed:', error);
      throw error;
    }
  },
};
