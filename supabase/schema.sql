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
  kind text not null check (kind in ('voice', 'screenshot', 'check', 'fix')),
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
  if p_kind not in ('voice', 'screenshot', 'check', 'fix') then
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

-- ─────────────────────────────────────────────────────────────────────────────
-- Suggestions (founder decision 16 Oct): while the app and payments are being
-- finished, ask visitors whether this is actually needed and what they'd want.
--
-- This is the ONE place the product stores something a person typed, so it is
-- kept deliberately thin: the answer, their words, a country and a timestamp.
-- No device id, no IP, no name, nothing that joins it back to a conversation.
-- Nobody can read it back out with the public key.

create table if not exists public.suggestions (
  id bigint generated always as identity primary key,
  -- 'yes' | 'maybe' | 'no': would they use it
  needed text not null check (needed in ('yes', 'maybe', 'no')),
  -- What they'd want, in their words. Optional, and capped.
  words text check (words is null or char_length(words) <= 600),
  -- Optional, only if they offer it, so the founder can reply.
  contact text check (contact is null or char_length(contact) <= 120),
  country text check (country is null or char_length(country) <= 8),
  created_at timestamptz not null default now()
);

alter table public.suggestions enable row level security;
-- No policies: the public key cannot read or write this table directly.

-- Insert-only, through a function, so nothing can be listed or edited from the browser.
create or replace function public.add_suggestion(
  p_needed text, p_words text, p_contact text, p_country text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_needed not in ('yes', 'maybe', 'no') then
    return;
  end if;
  insert into suggestions (needed, words, contact, country)
  values (
    p_needed,
    nullif(left(coalesce(p_words, ''), 600), ''),
    nullif(left(coalesce(p_contact, ''), 120), ''),
    nullif(upper(left(coalesce(p_country, ''), 8)), '')
  );
end;
$$;

revoke all on function public.add_suggestion(text, text, text, text) from public;
grant execute on function public.add_suggestion(text, text, text, text) to anon;

-- What the founder reads. Dashboard only; the public key can't touch it.
create or replace view public.suggestion_summary as
  select date_trunc('day', created_at)::date as day, needed, country, count(*) as n
  from public.suggestions
  group by 1, 2, 3
  order by 1 desc, 4 desc;

revoke all on public.suggestion_summary from anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- Waitlist (added 3 November 2026 — fix feat/waitlist, Europe-audit P1.4)
--
-- Why this table exists
--   Before the Europe-persona audit of 2 November 2026 the public landing page
--   gave visitors three outcomes: "Open Fix", "How privacy works", or leave.
--   The audit showed every persona (Marcus, Sophie, Lars, Emma, Raj) landing,
--   not booking a session, and leaving with no way for us to notify them when
--   the DE/FR/NL localization, the Reduction Program or any paid plan ships.
--   The waitlist captures the one durable signal — an email — nothing else.
--
-- What is NOT stored
--   No name, no phone, no device id, no IP, no user-agent, no referrer, no
--   message. Joining a captured email back to a Fix session or any device is
--   exactly what the product promises not to do, so the schema makes it
--   structurally impossible on this table alone.
--
-- What IS stored
--   Email (unique, lowercased), region (2 letters, from client-side
--   detectRegion), locale (first browser language tag, max 16 chars), source
--   (which page the email came from — "home" or "future-plan"), created_at.
--
-- Access
--   anon role can only execute add_waitlist(). It cannot select from the table,
--   so a stolen anon key cannot be used to list emails or scrape the audience.
--   The founder's dashboard uses a server-side service-role query against the
--   view below.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.waitlist (
  id bigserial primary key,
  email citext not null unique,
  region text check (region is null or char_length(region) <= 2),
  locale text check (locale is null or char_length(locale) <= 16),
  source text check (source is null or char_length(source) <= 32),
  created_at timestamptz not null default now()
);

-- citext is the right type for case-insensitive email uniqueness
-- (Alex@gmail.com and alex@gmail.com dedupe on insert). Enable the extension
-- here in case the project doesn't have it already.
create extension if not exists citext;

alter table public.waitlist enable row level security;
-- No policies: the public (anon) key cannot read or write this table directly.

create or replace function public.add_waitlist(
  p_email text, p_region text, p_locale text, p_source text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email citext;
begin
  v_email := lower(trim(coalesce(p_email, '')))::citext;
  -- Server-side sanity: the API route validates with a strict regex, but the
  -- database also refuses an empty/malformed value so a stolen anon key or a
  -- misbehaving client cannot pollute the table.
  if v_email is null or length(v_email::text) = 0 or length(v_email::text) > 254 then
    return;
  end if;
  if position('@' in v_email::text) < 2 or position('.' in v_email::text) < 3 then
    return;
  end if;
  insert into waitlist (email, region, locale, source)
  values (
    v_email,
    nullif(upper(left(coalesce(p_region, ''), 2)), ''),
    nullif(left(coalesce(p_locale, ''), 16), ''),
    nullif(left(coalesce(p_source, ''), 32), '')
  )
  on conflict (email) do nothing;
end;
$$;

revoke all on function public.add_waitlist(text, text, text, text) from public;
grant execute on function public.add_waitlist(text, text, text, text) to anon;

-- What the founder reads. Dashboard only; the public key can't touch it.
create or replace view public.waitlist_summary as
  select date_trunc('day', created_at)::date as day, region, source, count(*) as n
  from public.waitlist
  group by 1, 2, 3
  order by 1 desc, 4 desc;

revoke all on public.waitlist_summary from anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- The seven free days, recorded server-side so a browser can't restart the clock.
-- Only a one-way device reference is stored; no email, no name, no IP.

create table if not exists public.trials (
  device_ref text primary key,
  started_at timestamptz not null default now()
);

alter table public.trials enable row level security;
-- No policies: the table is only reachable through the two functions below.

create or replace function public.start_trial(p_device_ref text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare s timestamptz;
begin
  if p_device_ref is null or char_length(p_device_ref) < 16 then
    return null;
  end if;
  insert into public.trials (device_ref) values (p_device_ref)
    on conflict (device_ref) do nothing;
  select started_at into s from public.trials where device_ref = p_device_ref;
  return json_build_object('started_at', s);
end;
$$;

create or replace function public.trial_active(p_device_ref text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(
    (select started_at > now() - interval '7 days' from public.trials where device_ref = p_device_ref),
    false
  );
$$;

revoke all on function public.start_trial(text) from public;
revoke all on function public.trial_active(text) from public;
grant execute on function public.start_trial(text) to anon, authenticated;
grant execute on function public.trial_active(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Reminders (Web Push). Added 14 November 2026.
-- One row per browser subscription. No name, no log, no device cookie: just
-- the push address, which of the two reminders they switched on, a local
-- hour, a timezone, and the last local date each kind was sent so a slow
-- cron can't double-send. Reachable only through the functions below.
-- ---------------------------------------------------------------------------

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  sunday boolean not null default false,
  nightly boolean not null default false,
  hour int not null default 23 check (hour between 0 and 23),
  tz text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_sent_sunday date,
  last_sent_nightly date
);

alter table public.push_subscriptions enable row level security;
-- No policies: only the security-definer functions below touch this table.

-- Browser → server: create or update. Both kinds false = they switched
-- everything off; the row is removed rather than kept dormant.
create or replace function public.push_upsert(
  p_endpoint text, p_p256dh text, p_auth text,
  p_sunday boolean, p_nightly boolean, p_hour int, p_tz text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_endpoint is null or char_length(p_endpoint) < 10 or p_endpoint not like 'https://%' then
    return;
  end if;
  if not coalesce(p_sunday, false) and not coalesce(p_nightly, false) then
    delete from public.push_subscriptions where endpoint = p_endpoint;
    return;
  end if;
  insert into public.push_subscriptions (endpoint, p256dh, auth, sunday, nightly, hour, tz)
    values (p_endpoint, p_p256dh, p_auth, coalesce(p_sunday, false), coalesce(p_nightly, false),
            least(greatest(coalesce(p_hour, 23), 0), 23), left(p_tz, 64))
    on conflict (endpoint) do update set
      p256dh = excluded.p256dh,
      auth = excluded.auth,
      sunday = excluded.sunday,
      nightly = excluded.nightly,
      hour = excluded.hour,
      tz = excluded.tz,
      updated_at = now();
end;
$$;

create or replace function public.push_remove(p_endpoint text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.push_subscriptions where endpoint = p_endpoint;
$$;

-- Server (service role) → list everything that has at least one kind on.
create or replace function public.push_active()
returns setof public.push_subscriptions
language sql
security definer
set search_path = public
as $$
  select * from public.push_subscriptions where sunday or nightly;
$$;

create or replace function public.push_mark_sent(p_endpoint text, p_kind text, p_date date)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_kind = 'sunday' then
    update public.push_subscriptions set last_sent_sunday = p_date where endpoint = p_endpoint;
  elsif p_kind = 'nightly' then
    update public.push_subscriptions set last_sent_nightly = p_date where endpoint = p_endpoint;
  end if;
end;
$$;

revoke all on function public.push_upsert(text, text, text, boolean, boolean, int, text) from public;
revoke all on function public.push_remove(text) from public;
revoke all on function public.push_active() from public;
revoke all on function public.push_mark_sent(text, text, date) from public;
grant execute on function public.push_upsert(text, text, text, boolean, boolean, int, text) to anon, authenticated;
grant execute on function public.push_remove(text) to anon, authenticated;
grant execute on function public.push_active() to service_role;
grant execute on function public.push_mark_sent(text, text, date) to service_role;
