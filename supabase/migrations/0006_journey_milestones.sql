create table if not exists public.journey_milestones (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) between 3 and 140),
  year_label text not null check (length(trim(year_label)) between 2 and 80),
  description text not null check (length(trim(description)) between 10 and 4000),
  sort_order integer not null default 0 check (sort_order between 0 and 100000),
  created_at timestamptz not null default now()
);

create index if not exists journey_milestones_order_idx
  on public.journey_milestones (sort_order, created_at);

alter table public.journey_milestones enable row level security;

drop policy if exists "journey milestones public read" on public.journey_milestones;
create policy "journey milestones public read"
  on public.journey_milestones for select using (true);

drop policy if exists "journey milestones admin write" on public.journey_milestones;
create policy "journey milestones admin write"
  on public.journey_milestones for all
  using (public.is_admin()) with check (public.is_admin());

grant select on public.journey_milestones to anon;
grant select, insert, update, delete on public.journey_milestones to authenticated;
