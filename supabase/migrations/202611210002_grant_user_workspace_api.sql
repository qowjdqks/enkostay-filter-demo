-- Allow signed-in users to use the Data API. Row-level security below these
-- grants still restricts every row to its owning account.
grant select, insert, update, delete on public.saved_listings to authenticated;
grant select, insert, update, delete on public.user_preferences to authenticated;
