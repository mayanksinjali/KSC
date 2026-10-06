alter table public.admin_users
  add column if not exists invitation_pending boolean not null default false;

drop function if exists public.list_appointable_members();
create function public.list_appointable_members()
returns table (
  member_id uuid,
  name text,
  class text,
  account text,
  user_id uuid,
  role public.admin_role,
  invitation_pending boolean
)
language plpgsql
security definer
set search_path = public, auth
stable
as $$
begin
  if not public.is_super_admin() then
    raise exception 'Super Admin access required.';
  end if;

  return query
  select distinct on (m.id)
    m.id,
    m.name,
    m.class,
    a.contact,
    u.id,
    coalesce(au.role, a.appointed_role),
    coalesce(au.invitation_pending, false)
  from public.members m
  join public.applications a on a.accepted_member_id = m.id
  left join auth.users u on (
    (
      a.contact like '%@%'
      and lower(u.email) = lower(trim(a.contact))
    )
    or
    (
      a.contact not like '%@%'
      and public.phone_matches_contact(a.contact, u.phone)
    )
  )
  left join public.admin_users au on au.id = u.id
  where m.active
  order by m.id, a.created_at desc, u.created_at desc;
end;
$$;

revoke all on function public.list_appointable_members() from public, anon;
grant execute on function public.list_appointable_members() to authenticated;

create or replace function public.clear_admin_invitation_pending()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if new.email_confirmed_at is not null or new.phone_confirmed_at is not null then
    update public.admin_users
      set invitation_pending = false
      where id = new.id and invitation_pending;
  end if;
  return new;
end;
$$;

drop trigger if exists clear_admin_invitation_pending on auth.users;
create trigger clear_admin_invitation_pending
  after insert or update
  on auth.users
  for each row
  execute function public.clear_admin_invitation_pending();

revoke all on function public.clear_admin_invitation_pending() from public, anon, authenticated;
