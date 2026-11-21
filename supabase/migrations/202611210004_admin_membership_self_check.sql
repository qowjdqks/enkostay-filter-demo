-- Users may check only their own admin membership; writes remain service-role only.
grant select on public.admin_users to authenticated;

create policy "admins can read their own membership"
  on public.admin_users for select to authenticated
  using (user_id = (select auth.uid()));
