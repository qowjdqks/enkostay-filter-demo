create table if not exists public.saved_filter_presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 40),
  min_price integer not null,
  max_price integer not null,
  priority_order text[] not null,
  required_categories text[] not null default '{}',
  selected_options jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (min_price >= 500000 and max_price <= 3600000 and min_price <= max_price),
  check (
    cardinality(priority_order) = 5 and
    priority_order @> array['room','amenities','rules','building','floor'] and
    array['room','amenities','rules','building','floor'] @> priority_order
  ),
  check (required_categories <@ array['room','amenities','rules','building','floor'])
);

alter table public.saved_filter_presets enable row level security;

create policy "users manage their own filter presets"
  on public.saved_filter_presets for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant select, insert, update, delete on public.saved_filter_presets to authenticated;
