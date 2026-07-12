-- ============================================================
-- Secure Notes App — Initial Schema Migration
-- ============================================================
-- Tables: folders, notes
-- Security: Row Level Security enabled on both tables.
--   Every policy uses auth.uid() = user_id so a user can
--   only ever read/write their own rows — even via direct
--   API calls with a valid JWT for another user.
-- ============================================================

-- ── Folders ──────────────────────────────────────────────────

create table if not exists folders (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users not null,
  name       text not null check (char_length(name) between 1 and 100),
  created_at timestamptz default now() not null
);

alter table folders enable row level security;

create policy "Users manage their own folders"
  on folders
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Notes ─────────────────────────────────────────────────────
-- Design decision: title is stored as cleartext to enable
-- server-side listing and fast client-side search without
-- requiring decryption on every render.  The body (ciphertext)
-- is AES-GCM encrypted client-side before it ever reaches this
-- table.  The iv column holds the base64-encoded initialisation
-- vector; it is unique per note-save and is required for
-- decryption but not secret.

create table if not exists notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users not null,
  folder_id  uuid references folders on delete set null,
  title      text not null check (char_length(title) between 1 and 300),
  ciphertext text not null,
  iv         text not null,
  tags       text[] default '{}' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table notes enable row level security;

create policy "Users manage their own notes"
  on notes
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Auto-update updated_at ────────────────────────────────────

create or replace function update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger notes_set_updated_at
  before update on notes
  for each row
  execute function update_updated_at_column();

-- ── Indexes ───────────────────────────────────────────────────
-- Speed up the most common query: "all notes for this user"

create index if not exists notes_user_id_idx     on notes (user_id);
create index if not exists notes_folder_id_idx   on notes (folder_id);
create index if not exists folders_user_id_idx   on folders (user_id);
