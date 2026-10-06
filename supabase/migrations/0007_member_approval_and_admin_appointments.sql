-- Link accepted applications to the member created during approval.
alter table public.applications
  add column if not exists accepted_member_id uuid
  references public.members (id) on delete set null;

create unique index if not exists applications_accepted_member_idx
  on public.applications (accepted_member_id)
  where accepted_member_id is not null;

create or replace function public.phone_matches_contact(contact text, auth_phone text)
returns boolean
language sql
immutable
set search_path = pg_catalog
as $$
  with digits as (
    select
      regexp_replace(coalesce(contact, ''), '[^0-9]', '', 'g') as contact_digits,
      regexp_replace(coalesce(auth_phone, ''), '[^0-9]', '', 'g') as phone_digits
  )
  select contact_digits <> ''
    and (
      contact_digits = phone_digits
      or (length(contact_digits) = 10 and phone_digits = '977' || contact_digits)
      or (
        length(phone_digits) = 13
        and left(phone_digits, 3) = '977'
        and right(phone_digits, 10) = contact_digits
      )
      or (
        length(contact_digits) = 13
        and left(contact_digits, 3) = '977'
        and length(phone_digits) = 10
        and right(contact_digits, 10) = phone_digits
      )
    )
  from digits
$$;

create or replace function public.accept_application(p_application_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  application_row public.applications%rowtype;
  new_member_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Admin access required.';
  end if;

  select *
    into application_row
    from public.applications
    where id = p_application_id
    for update;

  if not found then
    raise exception 'Application not found.';
  end if;

  if application_row.accepted_member_id is not null then
    return application_row.accepted_member_id;
  end if;

  insert into public.members (name, role, type, class, sort_order, active)
  values (
    application_row.name,
    'Member',
    'student',
    application_row.class,
    coalesce((select max(sort_order) + 1 from public.members), 0),
    true
  )
  returning id into new_member_id;

  update public.applications
    set status = 'reviewed', accepted_member_id = new_member_id
    where id = p_application_id;

  return new_member_id;
end;
$$;

create or replace function public.list_appointable_members()
returns table (
  member_id uuid,
  name text,
  class text,
  account text,
  user_id uuid,
  role public.admin_role
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
    coalesce(u.email, u.phone),
    u.id,
    au.role
  from public.members m
  join public.applications a on a.accepted_member_id = m.id
  join auth.users u on (
    (
      a.contact like '%@%'
      and lower(u.email) = lower(trim(a.contact))
      and u.email_confirmed_at is not null
    )
    or
    (
      a.contact not like '%@%'
      and public.phone_matches_contact(a.contact, u.phone)
      and u.phone_confirmed_at is not null
    )
  )
  left join public.admin_users au on au.id = u.id
  where m.active
  order by m.id, a.created_at desc, u.created_at desc;
end;
$$;

create or replace function public.appoint_member_as_admin(
  p_member_id uuid,
  p_role public.admin_role
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  actor_id uuid := auth.uid();
  target_user auth.users%rowtype;
  target_role public.admin_role;
  super_admin_count integer;
begin
  if not public.is_super_admin() then
    raise exception 'Super Admin access required.';
  end if;
  if p_role is null then
    raise exception 'Choose an admin role.';
  end if;

  select u.*
    into target_user
    from public.members m
    join public.applications a on a.accepted_member_id = m.id
    join auth.users u on (
      (
        a.contact like '%@%'
        and lower(u.email) = lower(trim(a.contact))
        and u.email_confirmed_at is not null
      )
      or
      (
        a.contact not like '%@%'
        and public.phone_matches_contact(a.contact, u.phone)
        and u.phone_confirmed_at is not null
      )
    )
    where m.id = p_member_id and m.active
    order by a.created_at desc, u.created_at desc
    limit 1;

  if not found then
    raise exception 'This member has no confirmed account linked to their application.';
  end if;

  if target_user.id = actor_id then
    raise exception 'You cannot change your own admin role.';
  end if;

  select role into target_role
    from public.admin_users
    where id = target_user.id;

  if target_role = 'super_admin' and p_role = 'editor' then
    select count(*) into super_admin_count
      from public.admin_users
      where role = 'super_admin';
    if super_admin_count <= 1 then
      raise exception 'The last Super Admin cannot be demoted.';
    end if;
  end if;

  insert into public.admin_users (id, email, role)
  values (target_user.id, coalesce(target_user.email, target_user.phone), p_role)
  on conflict (id) do update
    set email = excluded.email, role = excluded.role;
end;
$$;

revoke all on function public.accept_application(uuid) from public, anon;
grant execute on function public.accept_application(uuid) to authenticated;

revoke all on function public.phone_matches_contact(text, text) from public, anon, authenticated;

revoke all on function public.list_appointable_members() from public, anon;
grant execute on function public.list_appointable_members() to authenticated;

revoke all on function public.appoint_member_as_admin(uuid, public.admin_role) from public, anon;
grant execute on function public.appoint_member_as_admin(uuid, public.admin_role) to authenticated;
