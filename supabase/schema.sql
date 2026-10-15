-- FreezeFix: anonymous counts only. Paste this into Supabase → SQL Editor → Run.
-- No user IDs, no message text, no IP addresses. (Safety Pack section 5 "Logging".)

create table if not exists public.events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('risk', 'helped', 'session')),
  value smallint not null check (value between 0 and 4),
  moment text check (char_length(moment) <= 20),
  country text check (char_length(country) <= 8)
);

alter table public.events enable row level security;

-- The app can ADD a row, nothing else. Nobody can read rows with the public key.
drop policy if exists "app can insert events" on public.events;
create policy "app can insert events"
  on public.events for insert
  to anon
  with check (true);

-- Handy views for the founder (read them in the Supabase dashboard).
create or replace view public.helped_rate as
  select date_trunc('day', created_at) as day,
         count(*) filter (where value = 1) as thumbs_up,
         count(*) filter (where value = 0) as thumbs_down,
         round(100.0 * count(*) filter (where value = 1) / nullif(count(*), 0), 1) as helped_pct
  from public.events
  where kind = 'helped'
  group by 1
  order by 1 desc;

create or replace view public.safety_counts as
  select date_trunc('day', created_at) as day, value as risk_level, country, count(*) as n
  from public.events
  where kind = 'risk'
  group by 1, 2, 3
  order by 1 desc, 2 desc;

-- Views are for the dashboard only; the public key can't read them.
revoke all on public.helped_rate from anon, authenticated;
revoke all on public.safety_counts from anon, authenticated;
