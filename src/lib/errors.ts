import type { PostgrestError } from '@supabase/supabase-js';

/**
 * A normalized error for anything that goes wrong in the data layer. Repos wrap
 * raw Supabase/Postgrest errors in this so callers get a consistent shape and a
 * single place logging happens.
 */
export class DataError extends Error {
  constructor(
    message: string,
    readonly context: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'DataError';
  }
}

/**
 * Unwrap a Supabase `{ data, error }` result, throwing a logged DataError on
 * failure. `context` identifies the operation for logs (e.g. 'items.insert').
 */
export function unwrap<T>(
  context: string,
  result: { data: T | null; error: PostgrestError | null },
): T {
  if (result.error) {
    console.error(`[data] ${context} failed:`, result.error);
    throw new DataError(result.error.message, context, result.error);
  }
  if (result.data === null) {
    // Should not happen for the calls we make (we always .select()), but keep
    // the type honest rather than asserting non-null.
    throw new DataError('No data returned', context);
  }
  return result.data;
}
