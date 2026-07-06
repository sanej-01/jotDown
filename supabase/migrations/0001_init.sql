-- =============================================================================
-- Jot — initial schema (MVP)
-- =============================================================================
-- Two owner-scoped tables (`lists`, `items`) with Row Level Security so that a
-- user can only ever read or write their own rows. RLS is the security boundary
-- for the whole app (there is no custom server) and is what the SEC-* /
-- cross-user-isolation test cases exercise.
--
-- Apply via the Supabase SQL editor, or with the Supabase CLI:
--   supabase db push
-- =============================================================================

-- gen_random_uuid() lives in pgcrypto (available by default on Supabase).
create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'item_type') then
    create type item_type as enum ('todo', 'idea', 'list_entry');
  end if;
end$$;

-- -----------------------------------------------------------------------------
-- lists
-- -----------------------------------------------------------------------------
create table if not exists public.lists (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name       text not null check (char_length(name) between 1 and 100),
  emoji      text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- -----------------------------------------------------------------------------
-- items  (todos, ideas, and entries that belong to a list)
-- -----------------------------------------------------------------------------
create table if not exists public.items (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type       item_type not null,
  list_id    uuid references public.lists (id) on delete cascade,
  title      text not null check (char_length(title) between 1 and 500),
  note       text not null default '' check (char_length(note) <= 5000),
  done       boolean not null default false,
  due_date   date,
  sort_order double precision not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,

  -- A list_entry must reference a list; todos and ideas must not.
  constraint items_list_id_matches_type check (
    (type = 'list_entry' and list_id is not null)
    or (type <> 'list_entry' and list_id is null)
  )
);

-- -----------------------------------------------------------------------------
-- Indexes — tuned for the "fetch my non-deleted rows for a view" access pattern.
-- Partial on deleted_at is null so soft-deleted rows never weigh on live reads.
-- -----------------------------------------------------------------------------
create index if not exists items_owner_type_idx
  on public.items (owner_id, type)
  where deleted_at is null;

create index if not exists items_list_idx
  on public.items (list_id)
  where deleted_at is null;

create index if not exists lists_owner_idx
  on public.lists (owner_id)
  where deleted_at is null;

-- -----------------------------------------------------------------------------
-- updated_at maintenance (regression suite: updated_at changes on every edit;
-- created_at never changes).
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  new.created_at := old.created_at; -- created_at is immutable
  return new;
end;
$$;

drop trigger if exists items_set_updated_at on public.items;
create trigger items_set_updated_at
  before update on public.items
  for each row execute function public.set_updated_at();

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.lists enable row level security;
alter table public.items enable row level security;

-- lists: owner-only for every operation.
drop policy if exists lists_select_own on public.lists;
create policy lists_select_own on public.lists
  for select using (owner_id = auth.uid());

drop policy if exists lists_insert_own on public.lists;
create policy lists_insert_own on public.lists
  for insert with check (owner_id = auth.uid());

drop policy if exists lists_update_own on public.lists;
create policy lists_update_own on public.lists
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists lists_delete_own on public.lists;
create policy lists_delete_own on public.lists
  for delete using (owner_id = auth.uid());

-- items: owner-only for every operation.
drop policy if exists items_select_own on public.items;
create policy items_select_own on public.items
  for select using (owner_id = auth.uid());

drop policy if exists items_insert_own on public.items;
create policy items_insert_own on public.items
  for insert with check (owner_id = auth.uid());

drop policy if exists items_update_own on public.items;
create policy items_update_own on public.items
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists items_delete_own on public.items;
create policy items_delete_own on public.items
  for delete using (owner_id = auth.uid());
