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

-- ─────────────────────────────────────────────────────────────────────────────
-- Daily limits for voice notes and screenshots (founder decision 16 Oct:
-- voice 3/day free, 6/day paid). Keys are one-way hashes; no raw IDs or IPs.
-- Rows older than 2 days are deleted automatically.

create table if not exists public.quota_usage (
  day date not null default (now() at time zone 'utc')::date,
  kind text not null check (kind in ('voice', 'screenshot', 'check')),
  key text not null check (char_length(key) = 64),
  used integer not null default 0,
  primary key (day, kind, key)
);

alter table public.quota_usage enable row level security;
-- No policies: nobody can read or write this table directly. Only the functions below can.

create or replace function public.use_quota(
  p_kind text, p_device_key text, p_ip_key text, p_limit int, p_ip_limit int
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  d date := (now() at time zone 'utc')::date;
  dev_used int;
  ip_used int;
begin
  if p_kind not in ('voice', 'screenshot', 'check') then
    return json_build_object('allowed', false, 'used', 0);
  end if;
  -- Hard ceilings so nobody can pass a huge limit.
  p_limit := least(greatest(p_limit, 0), 50);
  p_ip_limit := least(greatest(p_ip_limit, 0), 150);

  delete from quota_usage where day < d - 1;

  insert into quota_usage (day, kind, key, used) values (d, p_kind, p_device_key, 0)
    on conflict do nothing;
  insert into quota_usage (day, kind, key, used) values (d, p_kind, 'ip' || substr(p_ip_key, 3), 0)
    on conflict do nothing;

  select used into dev_used from quota_usage
    where day = d and kind = p_kind and key = p_device_key for update;
  select used into ip_used from quota_usage
    where day = d and kind = p_kind and key = 'ip' || substr(p_ip_key, 3) for update;

  if dev_used >= p_limit or ip_used >= p_ip_limit then
    return json_build_object('allowed', false, 'used', dev_used);
  end if;

  update quota_usage set used = used + 1
    where day = d and kind = p_kind and key in (p_device_key, 'ip' || substr(p_ip_key, 3));
  return json_build_object('allowed', true, 'used', dev_used + 1);
end;
$$;

create or replace function public.refund_quota(
  p_kind text, p_device_key text, p_ip_key text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  d date := (now() at time zone 'utc')::date;
begin
  update quota_usage set used = greatest(used - 1, 0)
    where day = d and kind = p_kind and key in (p_device_key, 'ip' || substr(p_ip_key, 3));
end;
$$;

revoke all on function public.use_quota(text, text, text, int, int) from public;
revoke all on function public.refund_quota(text, text, text) from public;
grant execute on function public.use_quota(text, text, text, int, int) to anon;
grant execute on function public.refund_quota(text, text, text) to anon;

-- ─────────────────────────────────────────────────────────────────────────────
-- Paywall (founder decision 16 Oct): first unfreeze free, then a 4-day trial,
-- then $9.99/month or $39.99/year. Crisis help is never behind this.
-- Keyed by a one-way hash of the anonymous device ID ("device_ref"). The payment
-- provider holds the email and card; we never store them.

create table if not exists public.entitlements (
  device_ref text primary key check (char_length(device_ref) = 64),
  provider text not null default 'paddle',
  subscription_id text not null,
  customer_id text,
  status text not null,              -- trialing, active, past_due, paused, canceled
  price_id text,
  period_ends_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.entitlements enable row level security;
-- No policies: only the functions below touch this table.

create table if not exists public.free_sessions (
  key text primary key check (char_length(key) = 64),
  first_used_at timestamptz not null default now()
);
alter table public.free_sessions enable row level security;

-- Is this device on an active trial or plan? (app server, public key)
create or replace function public.get_entitlement(p_device_ref text) returns json
language sql security definer set search_path = public stable as $$
  select coalesce(
    (select json_build_object('active', status in ('trialing','active','past_due'), 'status', status, 'period_ends_at', period_ends_at)
       from entitlements where device_ref = p_device_ref),
    json_build_object('active', false, 'status', 'none')
  );
$$;

-- Payment webhook writes here (server only, service key).
create or replace function public.upsert_entitlement(
  p_device_ref text, p_subscription_id text, p_customer_id text, p_status text, p_price_id text, p_period_ends_at timestamptz
) returns void
language sql security definer set search_path = public as $$
  insert into entitlements (device_ref, subscription_id, customer_id, status, price_id, period_ends_at, updated_at)
  values (p_device_ref, p_subscription_id, p_customer_id, p_status, p_price_id, p_period_ends_at, now())
  on conflict (device_ref) do update set
    subscription_id = excluded.subscription_id,
    customer_id = excluded.customer_id,
    status = excluded.status,
    price_id = excluded.price_id,
    period_ends_at = excluded.period_ends_at,
    updated_at = now();
$$;

-- The one free unfreeze. Allowed if this device hasn't used it, or used it in the last
-- 30 minutes (same session: "try another move", retries). Someone clearing cookies to get
-- another free session is accepted: it's one session, and we keep no extra data to stop it.
create or replace function public.use_free_session(p_device_key text) returns json
language plpgsql security definer set search_path = public as $$
declare
  dev_first timestamptz;
begin
  select first_used_at into dev_first from free_sessions where key = p_device_key;
  if dev_first is not null then
    return json_build_object('allowed', dev_first > now() - interval '30 minutes');
  end if;
  insert into free_sessions (key) values (p_device_key) on conflict do nothing;
  return json_build_object('allowed', true);
end;
$$;

revoke all on function public.get_entitlement(text) from public;
revoke all on function public.upsert_entitlement(text, text, text, text, text, timestamptz) from public;
revoke all on function public.use_free_session(text) from public;
grant execute on function public.get_entitlement(text) to anon;
grant execute on function public.use_free_session(text) to anon;
grant execute on function public.upsert_entitlement(text, text, text, text, text, timestamptz) to service_role;

-- For "Manage subscription" in Settings (server only asks for this device's own IDs).
create or replace function public.get_subscription_ids(p_device_ref text) returns json
language sql security definer set search_path = public stable as $$
  select coalesce(
    (select json_build_object('customer_id', customer_id, 'subscription_id', subscription_id)
       from entitlements where device_ref = p_device_ref),
    '{}'::json
  );
$$;
revoke all on function public.get_subscription_ids(text) from public;
grant execute on function public.get_subscription_ids(text) to anon;
