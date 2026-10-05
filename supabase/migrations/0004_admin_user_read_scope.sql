-- Editors can read only their own account row. Super Admins retain full access
-- through the existing super-admin policy.
drop policy if exists "admin_users self read" on public.admin_users;
create policy "admin_users self read" on public.admin_users
  for select using (id = auth.uid());
