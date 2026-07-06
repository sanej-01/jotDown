# jotdown

> catch it b4 it's gone

A nimble, personal web app to capture and manage **todos**, **ideas**, and **lists**. Built as a zero-server MVP: a React + Vite frontend talking directly to Supabase (auth + Postgres + REST), with data isolation enforced by Row Level Security.

## Stack

| Layer            | Choice                          |
| ---------------- | ------------------------------- |
| Frontend         | React 18 + Vite + TypeScript    |
| Auth + DB + API  | Supabase                        |
| Data fetching    | TanStack Query (optimistic UI)  |
| Routing          | React Router                    |
| Styling          | Tailwind CSS (light + dark)     |
| Validation       | Zod                             |

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com) (free tier).

3. **Apply the schema** — open the SQL editor in the Supabase dashboard and run
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql), or use the
   Supabase CLI (`supabase db push`).

4. **Configure environment** — copy `.env.example` to `.env` and fill in your
   project URL and anon (publishable) key from **Project Settings → API**.

   ```bash
   cp .env.example .env
   ```

5. **Disable email confirmation** (MVP uses simple signup with no email
   verification): Supabase dashboard → **Authentication → Providers → Email** →
   turn **"Confirm email"** off.

6. **Run**

   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check and build for production
- `npm run preview` — preview the production build
- `npm run lint` — type-check only (`tsc --noEmit`)

## Data model

Two owner-scoped tables, both with RLS (`owner_id = auth.uid()`):

- **`lists`** — named collections (`name`, optional `emoji`), soft-deleted via `deleted_at`.
- **`items`** — todos, ideas, and list entries (`type`), with `title`, `note`,
  `done`, optional `due_date`, fractional `sort_order`, and soft delete.

See [`src/types/database.ts`](src/types/database.ts) and the migration for details.

## Security model

The frontend uses the **public anon key**; this is safe because access is gated
by Postgres **Row Level Security**, not by key secrecy. Every row is stamped with
`owner_id` and every policy requires `owner_id = auth.uid()`, so a user can only
ever read or write their own data. The `service_role` key is never used in the
client.

## Build phases

- **Phase 1 — Scaffold, schema & env** ✅
- **Phase 2 — Data-access layer + optimistic hooks** ✅
- **Phase 3 — Auth (email/password + magic link, route guards, session persistence)** ✅
- **Phase 4 — Todos, Ideas, Lists features (add / toggle / edit / delete + undo)** ✅
- **Phase 5 — Test-alignment pass across the P0/P1 test suite** ✅

## MVP scope notes

- **Simple signup, no email verification** — accounts are usable immediately.
  Requires Supabase → Authentication → Email → "Confirm email" **off**.
- **Reordering** — drag-to-reorder (mouse, touch, and keyboard) on Todos and
  list entries, backed by fractional `sort_order` midpoint insertion.

## Known limitations (deferred beyond this MVP)

These were consciously scoped out; each is isolated and additive to build later:

- **Full offline mode** (test cases NET-01–04) — the app has optimistic UI,
  retries, and cached error views, but no offline write queue. A cut for the MVP.
- **Failed-write "retry" badge** (NET-07) — a write that ultimately fails is
  rolled back (after TanStack's retries) rather than left in place with an amber
  "Not saved — tap to retry" badge. Part of the same offline/retry system above.
- **Self-serve account deletion** (SEC-05 / NFR-4) — a client can't delete its
  own Supabase auth user, so this needs a small Supabase Edge Function using the
  service-role key (outside the no-custom-server MVP).
