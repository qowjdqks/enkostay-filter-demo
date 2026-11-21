create table if not exists public.activity_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in (
    'filter_opened', 'option_changed', 'required_toggled', 'priority_changed',
    'price_changed', 'filter_reset', 'search_preview', 'search_applied',
    'sort_changed', 'favorite_added', 'favorite_removed', 'cart_added',
    'cart_removed', 'compare_selected', 'compare_deselected',
    'preset_created', 'preset_applied', 'preset_edited', 'preset_renamed', 'preset_deleted'
  )),
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object' and pg_column_size(payload) <= 8192),
  created_at timestamptz not null default now()
);

create index if not exists activity_events_created_at_idx on public.activity_events (created_at desc);
create index if not exists activity_events_user_created_idx on public.activity_events (user_id, created_at desc);

alter table public.activity_events enable row level security;

drop policy if exists "users add own activity events" on public.activity_events;
create policy "users add own activity events" on public.activity_events
  for insert to authenticated with check (user_id = (select auth.uid()));

grant insert on public.activity_events to authenticated;
grant select, insert, update, delete on public.activity_events to service_role;
grant usage, select on sequence public.activity_events_id_seq to service_role;
