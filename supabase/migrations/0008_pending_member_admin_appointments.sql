alter table public.applications
  add column if not exists appointed_role public.admin_role;

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
  select
    m.id,
    m.name,
    m.class,
    a.contact,
    u.id,
    coalesce(au.role, a.appointed_role)
  from public.members m
  join public.applications a on a.accepted_member_id = m.id
  left join auth.users u on (
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
  where m.active;
end;
$$;

drop function if exists public.appoint_member_as_admin(uuid, public.admin_role);

create function public.appoint_member_as_admin(
  p_member_id uuid,
  p_role public.admin_role
)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  actor_id uuid := auth.uid();
  application_row public.applications%rowtype;
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

  select a.*
    into application_row
    from public.applications a
    join public.members m on m.id = a.accepted_member_id
    where m.id = p_member_id and m.active
    for update of a;

  if not found then
    raise exception 'Accepted member not found.';
  end if;

  select u.*
    into target_user
    from auth.users u
    where (
      (
        application_row.contact like '%@%'
        and lower(u.email) = lower(trim(application_row.contact))
        and u.email_confirmed_at is not null
      )
      or
      (
        application_row.contact not like '%@%'
        and public.phone_matches_contact(application_row.contact, u.phone)
        and u.phone_confirmed_at is not null
      )
    )
    order by u.created_at desc
    limit 1;

  if not found then
    update public.applications
      set appointed_role = p_role
      where id = application_row.id;
    return true;
  end if;

  if target_user.id = actor_id then
    raise exception 'You cannot change your own admin role.';
  end if;

  select au.role into target_role
    from public.admin_users au
    where au.id = target_user.id;

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

  update public.applications
    set appointed_role = null
    where id = application_row.id;

  return false;
end;
$$;

create or replace function public.activate_pending_member_admin_appointment()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  appointment record;
begin
  if new.email_confirmed_at is null and new.phone_confirmed_at is null then
    return new;
  end if;

  select a.id, a.appointed_role
    into appointment
    from public.applications a
    join public.members m on m.id = a.accepted_member_id
    where a.appointed_role is not null
      and m.active
      and (
        (
          a.contact like '%@%'
          and lower(new.email) = lower(trim(a.contact))
          and new.email_confirmed_at is not null
        )
        or
        (
          a.contact not like '%@%'
          and public.phone_matches_contact(a.contact, new.phone)
          and new.phone_confirmed_at is not null
        )
      )
    order by a.created_at desc
    limit 1
    for update of a;

  if not found then
    return new;
  end if;

  insert into public.admin_users (id, email, role)
  values (new.id, coalesce(new.email, new.phone), appointment.appointed_role)
  on conflict (id) do nothing;

  update public.applications
    set appointed_role = null
    where id = appointment.id;

  return new;
end;
$$;

drop trigger if exists activate_pending_member_admin_appointment on auth.users;
create trigger activate_pending_member_admin_appointment
  after insert or update
  on auth.users
  for each row
  execute function public.activate_pending_member_admin_appointment();

revoke all on function public.list_appointable_members() from public, anon;
grant execute on function public.list_appointable_members() to authenticated;

revoke all on function public.appoint_member_as_admin(uuid, public.admin_role) from public, anon;
grant execute on function public.appoint_member_as_admin(uuid, public.admin_role) to authenticated;

revoke all on function public.activate_pending_member_admin_appointment() from public, anon, authenticated;
