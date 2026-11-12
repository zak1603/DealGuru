-- One row per Deal Guru account, holding the location deals are sorted by.
-- Paste this into Supabase: SQL Editor > New query > Run.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  location_label text check (char_length(location_label) <= 80),
  -- Rounded to about 1 km by the site before saving.
  lat double precision check (lat between -90 and 90),
  lng double precision check (lng between -180 and 180),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- People can only see and change their own row.
create policy "Read own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

create policy "Create own profile" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);

create policy "Update own profile" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
