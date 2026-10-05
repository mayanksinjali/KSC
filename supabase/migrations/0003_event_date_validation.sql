-- Require a complete, in-range Bikram Sambat date for every event.
alter table public.events
  drop constraint if exists events_date_bs_check;

alter table public.events
  add constraint events_date_bs_check check (
    case
      when date_bs ~ '^\d{4}-\d{2}-\d{2}$' then
        substring(date_bs from 1 for 4)::integer between 1 and 9999
        and substring(date_bs from 6 for 2)::integer between 1 and 12
        and substring(date_bs from 9 for 2)::integer between 1 and 32
      else false
    end
  );
