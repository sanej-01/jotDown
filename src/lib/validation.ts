import { LIMITS } from '@/types/database';

/**
 * Input guardrails shared by the data hooks and (later) the UI. Kept small and
 * dependency-free; the DB CHECK constraints are the ultimate backstop.
 */

/** Trim a title/name for storage. */
export function normalize(raw: string): string {
  return raw.trim();
}

/**
 * True when a title is non-empty after trimming. Whitespace-only is invalid so
 * callers can perform a silent no-op (TODO-08 / Appendix "whitespace-only").
 */
export function isNonEmpty(raw: string): boolean {
  return normalize(raw).length > 0;
}

/** Clamp a title to the max length (TODO-09: blocked at 500, no crash). */
export function clampTitle(raw: string): string {
  return normalize(raw).slice(0, LIMITS.titleMax);
}

/** Clamp a note to the max length. */
export function clampNote(raw: string): string {
  return raw.slice(0, LIMITS.noteMax);
}

/** Clamp a list name to the max length (LIST-04: 100 accepted, 101 blocked). */
export function clampListName(raw: string): string {
  return normalize(raw).slice(0, LIMITS.listNameMax);
}
