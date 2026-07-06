import { supabase } from '@/lib/supabase';
import { unwrap } from '@/lib/errors';
import type { Item, List } from '@/types/database';

/**
 * Data-access layer for the `lists` table, plus the aggregate read the Lists
 * screen needs (each list with its entry counts).
 */

export interface NewList {
  id: string; // client-generated UUID (FR-D2)
  name: string;
  emoji?: string | null;
}

export type ListPatch = Partial<Pick<List, 'name' | 'emoji'>>;

/** A list decorated with live entry counts for the Lists screen (LIST-01). */
export interface ListWithCounts extends List {
  total: number;
  done: number;
}

const TABLE = 'lists';

export const listsRepo = {
  async list(): Promise<List[]> {
    const result = await supabase
      .from(TABLE)
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    return unwrap('lists.list', result);
  },

  /**
   * Lists with their non-deleted entry counts. Fetches lists and their entries
   * in two queries and aggregates client-side — fine at MVP scale (max 100
   * lists) and avoids a DB view/RPC for now.
   */
  async listWithCounts(): Promise<ListWithCounts[]> {
    const lists = await this.list();
    if (lists.length === 0) return [];

    const entriesResult = await supabase
      .from('items')
      .select('list_id, done')
      .eq('type', 'list_entry')
      .is('deleted_at', null);
    const entries = unwrap('lists.listWithCounts.entries', entriesResult) as Pick<
      Item,
      'list_id' | 'done'
    >[];

    const counts = new Map<string, { total: number; done: number }>();
    for (const entry of entries) {
      if (!entry.list_id) continue;
      const c = counts.get(entry.list_id) ?? { total: 0, done: 0 };
      c.total += 1;
      if (entry.done) c.done += 1;
      counts.set(entry.list_id, c);
    }

    return lists.map((l) => ({
      ...l,
      total: counts.get(l.id)?.total ?? 0,
      done: counts.get(l.id)?.done ?? 0,
    }));
  },

  async getById(id: string): Promise<List | null> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();
    if (error) {
      console.error('[data] lists.getById failed:', error);
      throw error;
    }
    return data;
  },

  async insert(list: NewList): Promise<List> {
    const result = await supabase
      .from(TABLE)
      .insert({ id: list.id, name: list.name, emoji: list.emoji ?? null })
      .select()
      .single();
    return unwrap('lists.insert', result);
  },

  async update(id: string, patch: ListPatch): Promise<List> {
    const result = await supabase
      .from(TABLE)
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    return unwrap('lists.update', result);
  },

  /**
   * Soft-delete a list and all its entries together (LIST-02: list and entries
   * soft-deleted; undo restores everything). Returns the entry ids that were
   * deleted so the caller can restore exactly those on undo.
   */
  async softDeleteWithEntries(id: string): Promise<{ entryIds: string[] }> {
    const now = new Date().toISOString();

    const affected = await supabase
      .from('items')
      .select('id')
      .eq('type', 'list_entry')
      .eq('list_id', id)
      .is('deleted_at', null);
    const entryIds = unwrap('lists.softDeleteWithEntries.select', affected).map(
      (r) => r.id,
    );

    if (entryIds.length > 0) {
      const { error } = await supabase
        .from('items')
        .update({ deleted_at: now })
        .in('id', entryIds);
      if (error) {
        console.error('[data] lists.softDeleteWithEntries.entries failed:', error);
        throw error;
      }
    }

    const { error: listError } = await supabase
      .from(TABLE)
      .update({ deleted_at: now })
      .eq('id', id);
    if (listError) {
      console.error('[data] lists.softDeleteWithEntries.list failed:', listError);
      throw listError;
    }

    return { entryIds };
  },

  /** Restore a soft-deleted list together with the given entry ids (undo). */
  async restoreWithEntries(id: string, entryIds: string[]): Promise<void> {
    const { error: listError } = await supabase
      .from(TABLE)
      .update({ deleted_at: null })
      .eq('id', id);
    if (listError) {
      console.error('[data] lists.restoreWithEntries.list failed:', listError);
      throw listError;
    }

    if (entryIds.length > 0) {
      const { error } = await supabase
        .from('items')
        .update({ deleted_at: null })
        .in('id', entryIds);
      if (error) {
        console.error('[data] lists.restoreWithEntries.entries failed:', error);
        throw error;
      }
    }
  },
};
