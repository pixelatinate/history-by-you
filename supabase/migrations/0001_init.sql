-- History By You — initial schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a fresh project.
-- Replaces the original two-table MySQL schema (Locations, Comments) with:
--   - a real geography column (PostGIS) instead of separate lat/lng floats
--   - entries tied to authenticated users instead of anonymous free-text names
--   - row-level security so the API can be exposed directly to the client safely

create extension if not exists postgis;

-- One pin on the map.
create table if not exists locations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  point       geography(point, 4326) not null, -- (longitude, latitude)
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists locations_point_idx on locations using gist (point);

-- A history entry / comment on a location. Replaces the original flat
-- "Comments" table; upvotes/downvotes are derived from location_votes
-- instead of stored as mutable counters.
create table if not exists entries (
  id          uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,
  author_id   uuid references auth.users(id) on delete set null,
  body        text not null check (char_length(body) between 1 and 4000),
  created_at  timestamptz not null default now()
);

create index if not exists entries_location_id_idx on entries(location_id);

-- One vote per user per entry (replaces mutable upvotes/downvotes counters).
create table if not exists entry_votes (
  entry_id uuid not null references entries(id) on delete cascade,
  user_id  uuid not null references auth.users(id) on delete cascade,
  value    smallint not null check (value in (-1, 1)),
  primary key (entry_id, user_id)
);

-- Row Level Security: anyone can read, only authenticated users can write,
-- and only the author can edit/delete their own rows.
alter table locations enable row level security;
alter table entries enable row level security;
alter table entry_votes enable row level security;

create policy "locations are publicly readable" on locations
  for select using (true);
create policy "authenticated users can add locations" on locations
  for insert to authenticated with check (auth.uid() = created_by);
create policy "authors can update their own locations" on locations
  for update to authenticated using (auth.uid() = created_by);

create policy "entries are publicly readable" on entries
  for select using (true);
create policy "authenticated users can add entries" on entries
  for insert to authenticated with check (auth.uid() = author_id);
create policy "authors can update their own entries" on entries
  for update to authenticated using (auth.uid() = author_id);

create policy "votes are publicly readable" on entry_votes
  for select using (true);
create policy "authenticated users can vote" on entry_votes
  for insert to authenticated with check (auth.uid() = user_id);
create policy "users can change their own vote" on entry_votes
  for update to authenticated using (auth.uid() = user_id);
create policy "users can remove their own vote" on entry_votes
  for delete to authenticated using (auth.uid() = user_id);

-- Convenience view: each entry with its score, so clients don't have to
-- aggregate entry_votes themselves.
create or replace view entries_with_score as
select
  e.*,
  coalesce(sum(v.value), 0) as score
from entries e
left join entry_votes v on v.entry_id = e.id
group by e.id;
