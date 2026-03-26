create extension if not exists pgcrypto;

create table if not exists public.city_buildings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  leetcode_username text not null,
  easy integer not null default 0,
  medium integer not null default 0,
  hard integer not null default 0,
  houses integer not null default 0,
  buildings integer not null default 0,
  skyscrapers integer not null default 0,
  city_level text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, leetcode_username)
);

create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  avatar_data_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists city_buildings_set_updated_at on public.city_buildings;
drop trigger if exists user_profiles_set_updated_at on public.user_profiles;

create trigger city_buildings_set_updated_at
before update on public.city_buildings
for each row
execute function public.set_updated_at();

create trigger user_profiles_set_updated_at
before update on public.user_profiles
for each row
execute function public.set_updated_at();

alter table public.city_buildings enable row level security;
alter table public.user_profiles enable row level security;

drop policy if exists "Authenticated users can read all city buildings" on public.city_buildings;
create policy "Authenticated users can read all city buildings"
on public.city_buildings
for select
to authenticated
using (true);

drop policy if exists "Users can insert their own city buildings" on public.city_buildings;
create policy "Users can insert their own city buildings"
on public.city_buildings
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own city buildings" on public.city_buildings;
create policy "Users can update their own city buildings"
on public.city_buildings
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read their own profile" on public.user_profiles;
create policy "Users can read their own profile"
on public.user_profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own profile" on public.user_profiles;
create policy "Users can insert their own profile"
on public.user_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own profile" on public.user_profiles;
create policy "Users can update their own profile"
on public.user_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
