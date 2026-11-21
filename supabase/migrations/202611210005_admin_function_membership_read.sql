-- The admin Edge Function uses the service role to check membership.
-- The function still checks the caller's user_id before allowing admin actions.
grant select on public.admin_users to service_role;
