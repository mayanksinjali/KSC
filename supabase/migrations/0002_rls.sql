-- Kanti Science Club — Row Level Security
--
-- Permission model enforced in the database, not just the UI:
--   * Anyone may read published public content.
--   * Anyone may submit an application (insert only).
--   * Editors and Super Admins may manage content.
--   * Only Super Admins may manage admin users or edit settings.

alter table public.members      enable row level security;
alter table public.events       enable row level security;
alter table public.notices      enable row level security;
alter table public.gallery      enable row level security;
alter table public.applications enable row level security;
alter table public.settings     enable row level security;
alter table public.admin_users  enable row level security;

-- ---------------------------------------------------------------------------
-- Public content: readable by everyone (anon + authenticated)
-- ---------------------------------------------------------------------------
drop policy if exists "members public read" on public.members;
create policy "members public read" on public.members for select using (true);

drop policy if exists "events public read" on public.events;
create policy "events public read" on public.events for select using (true);

drop policy if exists "notices public read" on public.notices;
create policy "notices public read" on public.notices for select using (true);

drop policy if exists "gallery public read" on public.gallery;
create policy "gallery public read" on public.gallery for select using (true);

-- ---------------------------------------------------------------------------
-- Content management: any admin (editor or super admin)
-- ---------------------------------------------------------------------------
drop policy if exists "members admin write" on public.members;
create policy "members admin write" on public.members
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "events admin write" on public.events;
create policy "events admin write" on public.events
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "notices admin write" on public.notices;
create policy "notices admin write" on public.notices
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "gallery admin write" on public.gallery;
create policy "gallery admin write" on public.gallery
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Applications: public may insert and never read; admins may do everything
-- ---------------------------------------------------------------------------
drop policy if exists "applications public insert" on public.applications;
create policy "applications public insert" on public.applications
  for insert with check (true);

drop policy if exists "applications admin read" on public.applications;
create policy "applications admin read" on public.applications
  for select using (public.is_admin());

drop policy if exists "applications admin update" on public.applications;
create policy "applications admin update" on public.applications
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "applications admin delete" on public.applications;
create policy "applications admin delete" on public.applications
  for delete using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Settings: everyone reads (the public site renders them), only Super Admins write
-- ---------------------------------------------------------------------------
drop policy if exists "settings public read" on public.settings;
create policy "settings public read" on public.settings for select using (true);

drop policy if exists "settings super admin insert" on public.settings;
create policy "settings super admin insert" on public.settings
  for insert with check (public.is_super_admin());

drop policy if exists "settings super admin update" on public.settings;
create policy "settings super admin update" on public.settings
  for update using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists "settings super admin delete" on public.settings;
create policy "settings super admin delete" on public.settings
  for delete using (public.is_super_admin());

-- ---------------------------------------------------------------------------
-- Admin users: an admin may read their own row; only Super Admins manage rows
-- ---------------------------------------------------------------------------
drop policy if exists "admin_users self read" on public.admin_users;
create policy "admin_users self read" on public.admin_users
  for select using (id = auth.uid());

drop policy if exists "admin_users super admin write" on public.admin_users;
create policy "admin_users super admin write" on public.admin_users
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- ---------------------------------------------------------------------------
-- Storage buckets and policies
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('member-photos', 'member-photos', true),
  ('event-images', 'event-images', true),
  ('gallery-images', 'gallery-images', true),
  ('notice-attachments', 'notice-attachments', true),
  ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

drop policy if exists "public read public buckets" on storage.objects;
create policy "public read public buckets" on storage.objects
  for select using (
    bucket_id in ('member-photos', 'event-images', 'gallery-images', 'notice-attachments', 'site-assets')
  );

drop policy if exists "admins upload public buckets" on storage.objects;
create policy "admins upload public buckets" on storage.objects
  for insert to authenticated with check (
    bucket_id in ('member-photos', 'event-images', 'gallery-images', 'notice-attachments', 'site-assets')
    and public.is_admin()
  );

drop policy if exists "admins update public buckets" on storage.objects;
create policy "admins update public buckets" on storage.objects
  for update to authenticated using (
    bucket_id in ('member-photos', 'event-images', 'gallery-images', 'notice-attachments', 'site-assets')
    and public.is_admin()
  );

drop policy if exists "admins delete public buckets" on storage.objects;
create policy "admins delete public buckets" on storage.objects
  for delete to authenticated using (
    bucket_id in ('member-photos', 'event-images', 'gallery-images', 'notice-attachments', 'site-assets')
    and public.is_admin()
  );
