create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.saved_listings (
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id integer not null check (listing_id between 1 and 500),
  collection text not null check (collection in ('favorite', 'cart')),
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id, collection)
);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  min_price integer not null default 500000,
  max_price integer not null default 3600000,
  priority_order text[] not null default array['room','amenities','rules','building','floor'],
  required_categories text[] not null default '{}',
  selected_options jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint valid_price_range check (min_price >= 500000 and max_price <= 3600000 and min_price <= max_price),
  constraint valid_priority_order check (
    cardinality(priority_order) = 5 and
    priority_order @> array['room','amenities','rules','building','floor'] and
    array['room','amenities','rules','building','floor'] @> priority_order
  ),
  constraint valid_required_categories check (
    required_categories <@ array['room','amenities','rules','building','floor']
  )
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  singleton boolean not null default true unique check (singleton is true),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.saved_listings enable row level security;
alter table public.user_preferences enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own" on public.profiles for select to authenticated using (id = (select auth.uid()));
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists "saved listings own all" on public.saved_listings;
create policy "saved listings own all" on public.saved_listings for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "preferences own all" on public.user_preferences;
create policy "preferences own all" on public.user_preferences for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- There are deliberately no client policies for admin_users. Only the Edge Function's
-- service role can inspect membership; the service role key never leaves Supabase.

create or replace function public.create_profile_for_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute procedure public.create_profile_for_new_user();
