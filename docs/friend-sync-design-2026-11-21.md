# Stats-only friend-sync: schema design

Task 41 / step 25 of the 50-step plan: "Design the stats-only friend-sync
schema." Written before any table or RPC function exists (task 42 builds
those). As with `docs/DISCOVERY.md`, findings are labelled **OBSERVED**
(read directly from this repository), **ASSUMPTION** (a conservative default
I'm proceeding on, stated so it can be corrected), or **OPEN QUESTION**
(something that changes the design and that only the founder can answer).

This is the first feature in the product that moves data between two
people's devices. Everything else Supabase currently holds (`supabase/schema.sql`)
is either anonymous aggregate counts, or one device's own record keyed by its
own one-way hash — nothing one person stores is ever readable by anyone else.
Friend-sync breaks that pattern on purpose, so the design leans hard on "as
little as possible, revocable any time" rather than reusing patterns from the
rest of the schema wholesale.

---

## 1. What "stats-only" has to mean here

**OBSERVED**, from the product's own existing rules, all of which this design
treats as hard constraints, not style preferences:

- `lib/behaviour-profile.ts` and its test (`trait-never-mentions-smoking-amount`
  in `scripts/test-companion.ts`) establish that the product already refuses
  to say anything about how MUCH someone smokes, even to themselves, in the
  one place closest to a "summary of you." Friend-sync inherits the same
  floor: if the app won't tell the user that number in its own voice, it
  never sends it to another device either.
- `lib/companion.ts`'s HP comment (the task 68 rescale note) frames total HP
  explicitly as "something to show someone else" — i.e. the founder has
  already named total HP as the one number this product considers safe and
  intended to leave the device. That's the anchor for what's in scope below.
- Project instructions: "Keep the experience understandable... Do not create
  manipulative urgency, addictive engagement loops." A friend's dashboard is
  an easy place for an unintended leaderboard/pressure dynamic to creep in
  (see §4).

**What is shared** (a snapshot of `lib/companion.ts`'s `Companion`, already
computed entirely from non-sensitive aggregates):

| Field | Source | Why it's safe |
|---|---|---|
| Display name | a NEW field the user types specifically for sharing (see §2) | Never the profile's own `name` or `companionName` by default — see open question 1. |
| Companion species + stage | `profile.companionSpecies`, `stageFor(level)` | Cosmetic; reveals nothing about behaviour. |
| Level + level name | `levelFor`, `displayLevelName` | What task 68's comment calls out as the one number meant to be shown. |
| Total HP | `hpFor(...).hp` | Same. |
| Longest streak | `streaksFor(...).longest` | Already shown to the user themselves; doesn't reveal any single night's outcome, just a count. |

**What is never shared, under any setting**: individual nights (`smoked`,
`mood`, `triggers`, `note`, `goalDone`), the per-stat HP breakdown (awareness/
mindfulness/consistency/resilience/self-understanding — task 39's "this week"
row), the recurring-theme callout, the goal text, bedtime, `interferesWith`,
`smokeTime`, `frequency`, `triedCuttingDown`, or the *current* streak (only
longest — current-streak pressure between friends is exactly the kind of
engagement loop the project instructions rule out; see §4). None of these
leave `statsFor`'s five numbers rolled up into the one HP figure and the
level/stage derived from it — which is the entire point of task 68's "one
number instead of five bars... a single value" design already being reused
here, not a new boundary invented for this feature.

---

## 2. Identity: a new, separate opt-in name — not the existing profile name

**ASSUMPTION.** `profile.name` is "who the mirror is talking to" (`lib/profile.ts`'s
own words) — written assuming only the user and Fix ever see it. Reusing it
for friend-sync would silently widen its audience the moment someone turns
sharing on, with no separate decision point. This design adds a distinct
`profile.shareName` (client-side, same profile object, new optional field)
that starts empty and is only ever asked for at the moment someone taps
"get a share link" (task 43) — a second, explicit "this is what friends will
see you as" prompt, not an inherited default. If left blank, the share flow
can't complete (no anonymous-but-still-identifiable half-state).

**OPEN QUESTION 1**: should `shareName` be allowed to equal `profile.name`
if the user explicitly types the same thing? (Almost certainly yes — the
point is consent, not forced difference — but worth confirming nobody wants
a harder separation, e.g. for people sharing a device.)

---

## 3. Schema

Following `supabase/schema.sql`'s established conventions exactly: RLS
enabled on every table, no direct policies, every table reachable only
through `security definer` functions, every function `revoke all from
public` then `grant execute` to the narrowest role that needs it, and the
same one-way `device_ref` (from `lib/quota.ts`'s `deviceRef()`) used
everywhere else in this schema as the only form of device identity — no new
identity system.

```sql
-- One row per device that has EVER turned sharing on. The code is what a
-- friend types/opens to connect; rotating it (re-running the function)
-- invalidates the old one, because it's a primary key on `code`, not on
-- `device_ref` -- the old row is replaced, not kept.
create table if not exists public.friend_codes (
  device_ref text primary key references ??? -- see open question 2
  code text not null unique check (char_length(code) = 8),
  share_name text not null check (char_length(share_name) between 1 and 24),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The actual connections. Always written as a PAIR (both directions) in the
-- same function call, so "my friends" is always a plain select on one's own
-- device_ref -- no join, no direction-handling bug waiting to happen.
create table if not exists public.friend_links (
  owner_ref text not null,
  friend_ref text not null,
  created_at timestamptz not null default now(),
  primary key (owner_ref, friend_ref),
  check (owner_ref <> friend_ref)
);

-- What a device publishes about itself for friends to read. Pushed up by
-- the owning device (on save, or on app open -- see open question 3), never
-- computed by Supabase from anything else: Supabase never sees a single
-- night's entry, so it structurally cannot leak one, even by mistake.
create table if not exists public.friend_stats (
  device_ref text primary key,
  share_name text not null check (char_length(share_name) between 1 and 24),
  species text not null check (char_length(species) <= 16),
  level int not null check (level between 1 and 10),
  level_name text not null check (char_length(level_name) <= 40),
  total_hp int not null check (total_hp >= 0),
  longest_streak int not null check (longest_streak >= 0),
  updated_at timestamptz not null default now()
);
```

Functions (shapes, not final SQL — signatures only, matching the
`p_`-prefixed-argument convention already used throughout `schema.sql`):

- `friend_code_create(p_device_ref, p_share_name) returns text` — creates
  or rotates this device's code; old code (if any) stops working the moment
  a new one is issued (DELETE-then-INSERT inside the function, same
  transaction).
- `friend_code_disable(p_device_ref) returns void` — the actual "turn
  sharing off" control from task 47. Sets `active = false`; the code stops
  resolving for new connections but existing `friend_links` rows are
  untouched (turning sharing off doesn't quietly unfriend people -- see open
  question 4).
- `friend_connect(p_device_ref, p_code) returns json` — looks up the code,
  confirms `active`, inserts both `(p_device_ref, friend_ref)` and
  `(friend_ref, p_device_ref)` into `friend_links`, returns the new friend's
  current `friend_stats` row (or an error shape if the code is inactive/
  unknown — never which one, to avoid confirming "that code used to exist").
- `friend_unlink(p_device_ref, p_friend_ref) returns void` — removes just the
  one connection, both directions, no matter which side calls it. This is
  the "remove one friend" control, the granular counterpart to
  `friend_code_disable`'s "stop ALL future connections."
- `friend_stats_push(p_device_ref, p_share_name, p_species, p_level,
  p_level_name, p_total_hp, p_longest_streak) returns void` — upsert, called
  by the owning device only.
- `friends_list(p_device_ref) returns setof friend_stats` — join
  `friend_links where owner_ref = p_device_ref` against `friend_stats`.

All seven follow the existing file's pattern: `security definer`,
`set search_path = public`, in-body validation (length/range checks,
clamping) so a stolen anon key can't write garbage, then
`revoke all ... from public; grant execute ... to anon`.

**OPEN QUESTION 2**: `device_ref` isn't a foreign key to anything today — no
table of "devices" exists; `entitlements`, `trials`, etc. are each keyed by
it independently with no referential integrity between them. Friend-sync
could follow that same pattern (no FK, `device_ref` is just a hash both
sides happen to agree on) or this could be the moment to add a minimal
`public.devices (device_ref primary key)` table everything else gets
backfilled to reference, for actual integrity. I've left the schema above
without a real FK (`references ???` is a placeholder, not working SQL) to
flag this rather than silently pick one — it's a schema-wide decision, not
just a friend-sync one.

**OPEN QUESTION 3**: "pushed on save, or on app open" above is a real
open choice with a privacy trade-off either way: pushing on every save
keeps a friend's view fresher but means a stats upload happens every single
night, whether or not anyone's looking; pushing only on app open (or only
when the friends list/settings page is visited) means fewer, more
deliberate network calls but a friend could see a stale number for a while.
I'd default to "on app open, at most once per day" (matches the existing
`quota_usage` table's own "rows older than 2 days are deleted automatically"
philosophy of not keeping more than is needed) unless the founder wants
closer-to-live.

**OPEN QUESTION 4**: should disabling sharing (`friend_code_disable`) also
offer "and remove everyone who's currently connected," or leave existing
connections alone until individually unfriended (as drafted above)? Task 47
says "a way to revoke/turn off sharing anytime" — read narrowly, that's
about stopping *new* connections, which is what's drafted. A broader reading
would nuke existing links too. Worth a one-line decision rather than a
guess, since it's hard to undo convincingly either way (if the default
guess is wrong, someone either loses a connection they wanted to keep, or
keeps one they thought they'd just cut off).

---

## 4. Shape of the friends-list UI this schema is built for (task 45 preview)

Not this task's job to design the screen, but worth naming so the schema
isn't accidentally built for a different shape of feature than what gets
asked for next: a plain list, one row per friend — name, species/portrait,
level, total HP, longest streak. Deliberately **not** sorted by total HP by
default, and no numeric rank/position shown (#1, #2, ...) — a flat list a
person can glance at, not a leaderboard. That's a direct reading of the
project's "no manipulative urgency, no addictive engagement loops" rule:
ranking turns "a stats-only number to compare with a friend" (task 68's own
framing) into a competition the product's own principles rule out. If the
founder wants ranking/leaderboard framing after all, that's a product
decision to make explicitly, not a default this design should assume.

---

## 5. What task 42 should NOT do yet

Build the tables and functions above (or the founder's corrected version of
them) in `supabase/schema.sql`, update `README.md`'s schema table, and add
the matching `lib/friends.ts` wrapper (mirroring `lib/quota.ts`'s `rpc()`
helper) — but should **not** wire any UI to it yet; tasks 43-45 do that
once the schema is live. Task 46 ("privacy-test the sync path") should run
with real `friend_connect`/`friend_unlink` calls once 42-45 exist, not be
folded into 42 as an afterthought.
