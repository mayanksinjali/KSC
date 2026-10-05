-- Grant only the Data API operations used by the app.
-- Row Level Security policies remain responsible for which rows each role can access.
grant usage on schema public to anon, authenticated;

grant select on public.members, public.events, public.notices, public.gallery, public.settings
  to anon;
grant insert on public.applications to anon;

grant select, insert, update, delete
  on public.members, public.events, public.notices, public.gallery,
     public.applications, public.settings, public.admin_users
  to authenticated;
