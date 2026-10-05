-- Kanti Science Club — schema, constraints and indexes
-- Run in the Supabase SQL editor, or via `supabase db push`.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type member_type as enum ('student', 'teacher');
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_category as enum ('Exhibition', 'Quiz', 'Talk', 'Inspire', 'Code', 'Art');
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_status as enum ('upcoming', 'completed', 'postponed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type application_status as enum ('new', 'reviewed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type admin_role as enum ('super_admin', 'editor');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- admin_users — must exist before the is_admin() helpers reference it
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role admin_role not null default 'editor',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- members
-- ---------------------------------------------------------------------------
create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 1),
  role text not null check (length(trim(role)) > 1),
  type member_type not null default 'student',
  session text,
  class text,
  photo_url text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists members_active_idx on public.members (active, sort_order);

-- ---------------------------------------------------------------------------
-- events — both dates are required by constraint, not just by the form
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 2),
  category event_category not null,
  description text not null check (length(trim(description)) > 5),
  date_bs text not null check (
    case
      when date_bs ~ '^\d{4}-\d{2}-\d{2}$' then
        substring(date_bs from 1 for 4)::integer between 1 and 9999
        and substring(date_bs from 6 for 2)::integer between 1 and 12
        and substring(date_bs from 9 for 2)::integer between 1 and 32
      else false
    end
  ),
  date_ad date not null,
  venue text not null check (length(trim(venue)) > 2),
  status event_status not null default 'upcoming',
  cover_url text,
  registration_url text,
  result text,
  created_at timestamptz not null default now()
);

create index if not exists events_date_idx on public.events (date_ad desc);
create index if not exists events_status_idx on public.events (status, date_ad);
create index if not exists events_category_idx on public.events (category);

-- ---------------------------------------------------------------------------
-- notices
-- ---------------------------------------------------------------------------
create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 2),
  body text not null check (length(trim(body)) > 5),
  attachment_url text,
  image_url text,
  pinned boolean not null default false,
  published_at timestamptz not null default now()
);

create index if not exists notices_published_idx on public.notices (pinned desc, published_at desc);

-- ---------------------------------------------------------------------------
-- gallery
-- ---------------------------------------------------------------------------
create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text not null check (length(trim(caption)) > 2),
  alt_text text not null check (length(trim(alt_text)) > 2),
  category text not null,
  event_id uuid references public.events (id) on delete set null,
  uploaded_at timestamptz not null default now()
);

create index if not exists gallery_event_idx on public.gallery (event_id);
create index if not exists gallery_category_idx on public.gallery (category, uploaded_at desc);

-- ---------------------------------------------------------------------------
-- applications — written by the public, read only by admins
-- ---------------------------------------------------------------------------
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 1),
  class text not null,
  contact text not null,
  message text not null,
  status application_status not null default 'new',
  created_at timestamptz not null default now()
);

create index if not exists applications_status_idx on public.applications (status, created_at desc);

-- ---------------------------------------------------------------------------
-- settings — key/value, editable by Super Admins
-- ---------------------------------------------------------------------------
create table if not exists public.settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Role helper functions (security definer avoids recursive RLS on admin_users)
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admin_users where id = auth.uid());
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admin_users where id = auth.uid() and role = 'super_admin'
  );
$$;

-- Keep settings.updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists settings_touch on public.settings;
create trigger settings_touch before update on public.settings
  for each row execute function public.touch_updated_at();
