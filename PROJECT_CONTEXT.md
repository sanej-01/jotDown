# Jotdown — Project Handoff Summary

## What it is

**Jotdown** is a production-ready personal tracker web app (todos, ideas, lists) built as a
mobile-first SPA. Tagline: "catch it b4 it's gone."

- **Repo:** https://github.com/sanej-01/jotDown (branch `main`, all work merged)
- **Dev:** `npm install && npm run dev` → localhost:5173. Build: `npm run build` (tsc + vite)
- **Bundle:** ~161 KB gzipped (budget was 200 KB)

## Tech stack

| Layer | Choice |
|---|---|
| UI | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS, CSS-variable light/dark themes (`.dark` class on `<html>`, persisted to localStorage) |
| Server state | TanStack Query v5 with optimistic mutations |
| Backend | Supabase only (Postgres + Auth + REST) — **no custom server** |
| Drag & drop | @dnd-kit (pointer + touch + keyboard sensors) |
| Routing | React Router v6 with auth guards |
| Validation | Zod (env vars, fail-fast at startup) |

Env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` in `.env` (`.env.example` is **gitignored**
because it holds real values — get them from Supabase dashboard → Project Settings → API).

## Database (Supabase Postgres)

Two tables, both with **RLS `owner_id = auth.uid()`** on all four operations — this is the entire
security boundary; the anon key is public by design.

- **`items`** — id (client-generated UUID), owner_id, type (`todo` | `idea` | `list_entry`),
  list_id (nullable), title, note, done, due_date, sort_order (float),
  **color** (`red`|`yellow`|`blue`, default yellow), created_at, updated_at (trigger),
  deleted_at (soft delete)
- **`lists`** — id, owner_id, name, emoji, created_at, deleted_at

Migrations: `supabase/migrations/0001_init.sql` (schema + RLS + trigger),
`0002_idea_color.sql` (color column — **must be run manually in the Supabase SQL Editor**).

## Architecture decisions (with the "why")

1. **Optimistic UI everywhere** — `optimisticList()` helper builds onMutate/onError/onSettled:
   cancel in-flight refetch → patch cache → rollback on error → invalidate to reconcile.
2. **Fractional sort_order** — drag-reorder writes one row: new order = midpoint of new
   neighbours (`orderBetween()` in `src/lib/sortOrder.ts`). No sibling rewrites.
3. **Client-generated UUIDs** — idempotent creates; double-submit yields one row.
4. **Soft delete only** — `deleted_at` stamp; every delete shows a 6-second undo toast; list
   delete cascades to entries and undo restores both.
5. **Date picker = `<label>` wrapping an `sr-only` `<input type=date>`** — critical iOS lesson
   (see below).
6. **Nav = fixed bottom tab bar; header shows only the active tab's name** as text
   ("jotdown · Todos"); `document.title` also tracks the tab.

## Code layout (src/)

- `config/env.ts`, `lib/` (supabase client, errors, optimistic, sortOrder, validation, date, queryKeys)
- `data/items.repo.ts`, `data/lists.repo.ts` — thin typed Supabase wrappers
- `features/auth/` — AuthProvider (session persistence + auto-refresh), tabbed
  sign-in/create-account page, forgot/reset, RequireAuth guard with deep-link restore
- `features/todos|ideas|lists/` — pages + hooks (`useTodos`, `useIdeas`, `useListEntries`,
  shared `itemMutations.ts`)
- `components/` — AppLayout (sticky header + bottom TabBar), ItemRow (ref-forwarding for
  dnd-kit), ReorderableList, EditableText, AddInput, Toast (undo), ConfirmDialog, QueryState, icons

## Features shipped

- **Auth:** email/password signup with **email verification disabled** (deliberate; "Confirm
  email" off in Supabase), magic link, password reset, session persists across reloads, guarded
  routes, generic error copy (no account enumeration), last-tab restore.
- **Todos:** add / inline-edit / toggle / delete+undo, due dates (red "Overdue · Jul 2" badge),
  drag-to-reorder open todos, completed section.
- **Ideas:** newest-first, expand/collapse note, live filter over title+note, **color label
  red/yellow/blue** (default yellow) — coloured left-border when collapsed; 3 circle swatches at
  bottom-right of the edit box, shown while editing **title or note** (`EditableText` exposes
  `onEditingChange`; swatches use `onMouseDown preventDefault` so clicking doesn't blur/close
  the editor).
- **Lists:** create/rename/delete+undo (cascades), entries with toggle/edit/reorder/delete,
  "N of M done" + progress bar, "Clear completed" with bulk undo.
- **Quality:** 44px touch targets, no horizontal scroll at 320px, stored-XSS inert (React
  escaping), inline max-length caps (title 500, note 5000, list name 100).

## Hard-won lessons (do not re-attempt)

1. **iOS date picker vs delete button:** an invisible `absolute inset-0 opacity-0` date input
   stole taps from the sibling delete button on iPhone. First fix (`pointer-events: none`) fixed
   delete but **broke the picker**. Correct fix: wrap the visual badge in a `<label>` with the
   input `sr-only` — native click-through, both work.
2. **Header tabs experiment (reverted):** moving Todos/Ideas/Lists into the header required
   10px text/zero gaps to fit 320px — too cramped. Reverted to bottom bar; header shows title
   only (commits `01bae51` → reverted by `2db77c9`).

## Known deferrals (also in README)

- Full offline mode / write queue (explicit MVP cut; optimistic+retry only)
- Failed-write "tap to retry" badge (rolls back instead)
- Self-serve account deletion — requires a Supabase Edge Function with service_role (no custom
  server in MVP)
- Ideas are newest-first by design (no reorder UI)

## Key commits

`7b91d67` initial 5-phase MVP → `0634a4a` tabbed auth screen → `022f0bc` label-based date
control (final iOS fix) → `4b18fd4` idea colors → `524ba75` color picker on title-edit →
`2db77c9` bottom-nav restore → `9283a8c` latest on main.

## Operational notes

- Test account `jotdown.qa2@gmail.com` may still hold test data (incl. an XSS-test string) —
  deletable via Supabase dashboard.
- Deployment configs present (`vercel.json`, `public/_redirects`) — static build + Supabase,
  so any static host works.
- Next most valuable work: account-deletion Edge Function, offline write queue, or
  code-splitting the 500 KB+ pre-gzip chunk.
