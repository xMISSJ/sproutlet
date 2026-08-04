-- Sproutlet schema
-- Shared plant species catalog + per-user care collection (ready for multi-user rollout)

create table if not exists public.plants (
  id bigint generated always as identity primary key,
  common_name text not null,
  scientific_name text,
  description text not null default '',
  care_level text not null default 'easy' check (care_level in ('easy', 'moderate', 'fussy')),
  light text not null default 'bright-indirect',
  water_frequency_days integer not null default 7 check (water_frequency_days > 0),
  humidity text not null default 'average',
  image_url text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.care_plants (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  plant_id bigint not null references public.plants(id) on delete restrict,
  nickname text,
  location text,
  acquired_at date,
  last_watered_at timestamptz,
  notes text not null default '',
  image_url text,
  is_favorite boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_roles (
  email text primary key,
  role text not null default 'member' check (role in ('admin', 'member')),
  assigned_by text,
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists care_plants_user_id_idx on public.care_plants (user_id);
create index if not exists care_plants_plant_id_idx on public.care_plants (plant_id);
create index if not exists plants_common_name_idx on public.plants (common_name);

grant usage on schema public to anon, authenticated;
grant select on table public.plants to anon, authenticated;
grant insert, update, delete on table public.plants to authenticated;
grant select, insert, update, delete on table public.care_plants to authenticated;
grant select, insert, update, delete on table public.user_roles to authenticated;
grant usage, select on sequence public.plants_id_seq to anon, authenticated;
grant usage, select on sequence public.care_plants_id_seq to authenticated;

alter table public.plants enable row level security;
alter table public.care_plants enable row level security;
alter table public.user_roles enable row level security;

drop policy if exists "Anyone can read plants" on public.plants;
create policy "Anyone can read plants"
  on public.plants
  for select
  using (true);

drop policy if exists "Authenticated users can insert plants" on public.plants;
create policy "Authenticated users can insert plants"
  on public.plants
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can update plants" on public.plants;
create policy "Authenticated users can update plants"
  on public.plants
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users can delete plants" on public.plants;
create policy "Authenticated users can delete plants"
  on public.plants
  for delete
  to authenticated
  using (true);

drop policy if exists "Users read own care plants" on public.care_plants;
create policy "Users read own care plants"
  on public.care_plants
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users insert own care plants" on public.care_plants;
create policy "Users insert own care plants"
  on public.care_plants
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users update own care plants" on public.care_plants;
create policy "Users update own care plants"
  on public.care_plants
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own care plants" on public.care_plants;
create policy "Users delete own care plants"
  on public.care_plants
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users read roles" on public.user_roles;
create policy "Users read roles"
  on public.user_roles
  for select
  to authenticated
  using (true);

drop policy if exists "Users manage roles" on public.user_roles;
create policy "Users manage roles"
  on public.user_roles
  for all
  to authenticated
  using (true)
  with check (true);
