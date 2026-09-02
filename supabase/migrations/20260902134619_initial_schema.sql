-- ============================================================================
-- Gym Zone — initial schema (v1)
--
-- This is the FIRST version, which is why it lives here as a single file.
-- Per CLAUDE.md, every change after this one goes through
-- `supabase migration new`, not an edit to this file.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- Vocabularies
--
-- Postgres enums rather than text + CHECK. They mirror the TypeScript unions
-- in lib/types/exercise.ts exactly, so an invalid value is rejected at the
-- database as well as at the type level.
--
-- Tradeoff: ADDING a value later is easy (ALTER TYPE ... ADD VALUE, no table
-- rewrite). REMOVING or renaming one is not. Fine for vocabularies that only
-- ever grow — if these start churning, a lookup table is the better shape.
-- ---------------------------------------------------------------------------

create type muscle_group as enum ('chest', 'back', 'shoulders', 'arms', 'legs', 'core');
create type equipment    as enum ('barbell', 'dumbbell', 'machine', 'cable', 'bodyweight');


-- ---------------------------------------------------------------------------
-- profiles — one row per user, mirroring auth.users
--
-- Supabase owns auth.users and we don't touch it. This table is where our own
-- per-user columns live, keyed by the same id so joins are trivial.
-- ---------------------------------------------------------------------------

create table profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at   timestamptz not null default now()
);


-- ---------------------------------------------------------------------------
-- exercises — the shared catalogue
--
-- NOT user-owned. One global library every user reads from; nobody writes to
-- it from the browser. Seeded by us, edited through the Supabase dashboard or
-- a service-role script.
-- ---------------------------------------------------------------------------

create table exercises (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  muscle_group muscle_group not null,
  equipment    equipment not null,
  video_url    text,
  created_at   timestamptz not null default now()
);

-- Matches the library page's filters: WHERE muscle_group = $1 AND equipment = $2
create index exercises_muscle_group_idx on exercises (muscle_group);
create index exercises_equipment_idx    on exercises (equipment);


-- ---------------------------------------------------------------------------
-- workout_plans — a training program belonging to one user
-- ---------------------------------------------------------------------------

create table workout_plans (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles (id) on delete cascade,
  name       text not null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

create index workout_plans_user_id_idx on workout_plans (user_id);


-- ---------------------------------------------------------------------------
-- plan_days — one row per day of the week in a plan
--
-- ⚠️ This table is NOT in the CLAUDE.md table list. Added deliberately.
--
-- Why it has to exist: the Today screen distinguishes "rest day" from "no plan
-- at all" — two states that look identical (no exercises) and need opposite
-- UI. If a rest day were simply the absence of rows, those two states would be
-- indistinguishable in the database, and the union type in lib/types/workout.ts
-- could never be populated correctly.
--
-- A rest day is therefore a real row with is_rest_day = true.
-- ---------------------------------------------------------------------------

create table plan_days (
  id          uuid primary key default gen_random_uuid(),
  plan_id     uuid not null references workout_plans (id) on delete cascade,
  -- 0 = Sunday … 6 = Saturday, matching JavaScript's Date.getDay().
  day_of_week smallint not null check (day_of_week between 0 and 6),
  -- e.g. 'Push Day'. Null on rest days, where there is nothing to name.
  title       text,
  is_rest_day boolean not null default false,

  unique (plan_id, day_of_week)
);

create index plan_days_plan_id_idx on plan_days (plan_id);


-- ---------------------------------------------------------------------------
-- plan_exercises — the prescription: what to do, how much
--
-- Deliberately separate from `exercises`. A catalogue entry is a thing that
-- exists; a plan exercise is an instruction to do it for 4 sets of 8. Same
-- split as Exercise vs PlannedExercise in the TypeScript types.
-- ---------------------------------------------------------------------------

create table plan_exercises (
  id               uuid primary key default gen_random_uuid(),
  plan_day_id      uuid not null references plan_days (id) on delete cascade,

  -- RESTRICT, not CASCADE: deleting a catalogue exercise must not silently
  -- tear rows out of people's plans. It should fail loudly instead.
  exercise_id      uuid not null references exercises (id) on delete restrict,

  -- Explicit ordering. Row order in Postgres is not guaranteed, so the
  -- sequence the user sees has to be stored, not inferred.
  position         smallint not null,

  target_sets      smallint not null check (target_sets > 0),
  target_reps      smallint not null check (target_reps > 0),
  -- Null means bodyweight — deliberately not 0, which would mean "0 kg".
  target_weight_kg numeric(5, 2) check (target_weight_kg is null or target_weight_kg >= 0),

  unique (plan_day_id, position)
);

create index plan_exercises_plan_day_id_idx on plan_exercises (plan_day_id);
create index plan_exercises_exercise_id_idx on plan_exercises (exercise_id);


-- ---------------------------------------------------------------------------
-- daily_checkins — the checkbox + notes feature, one row per user per day
-- ---------------------------------------------------------------------------

create table daily_checkins (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles (id) on delete cascade,
  checkin_date date not null,

  -- Stored, not derived from "all exercises ticked". Finishing your workout
  -- and ticking every box are different facts — you skip the last exercise
  -- because the rack is busy and you are still done for the day.
  session_done boolean not null default false,
  notes        text,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  -- One check-in per user per day. This is what makes an upsert safe.
  unique (user_id, checkin_date)
);

create index daily_checkins_user_date_idx on daily_checkins (user_id, checkin_date desc);


-- ---------------------------------------------------------------------------
-- workout_logs — what actually happened, set by set
--
-- Points at `exercises`, NOT at `plan_exercises`. A log is a fact about the
-- past; a plan is an intention about the future. Tying them together would
-- mean editing next week's plan rewrites last week's history — and you could
-- never log an exercise that wasn't in the plan.
-- ---------------------------------------------------------------------------

create table workout_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles (id) on delete cascade,
  exercise_id  uuid not null references exercises (id) on delete restrict,
  performed_on date not null,

  set_number   smallint not null check (set_number > 0),
  reps         smallint not null check (reps >= 0),
  weight_kg    numeric(5, 2) check (weight_kg is null or weight_kg >= 0),

  created_at   timestamptz not null default now(),

  unique (user_id, exercise_id, performed_on, set_number)
);

create index workout_logs_user_date_idx on workout_logs (user_id, performed_on desc);


-- ---------------------------------------------------------------------------
-- Auto-create a profile row when someone signs up
--
-- Without this, every new user has an auth.users row but no profiles row, and
-- every foreign key pointing at profiles fails on their first write.
-- SECURITY DEFINER because the trigger runs before the new user has any
-- privileges of their own.
-- ---------------------------------------------------------------------------

create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();


-- ============================================================================
-- ROW LEVEL SECURITY
--
-- Mandatory, per CLAUDE.md. Supabase exposes every table to the browser
-- through PostgREST, so a table without RLS is a public table.
--
-- RLS is deny-by-default: once enabled, anything without a matching policy is
-- refused. Same principle as the git rule in CLAUDE.md — allow named
-- exceptions rather than trying to list everything forbidden.
-- ============================================================================

alter table profiles       enable row level security;
alter table exercises      enable row level security;
alter table workout_plans  enable row level security;
alter table plan_days      enable row level security;
alter table plan_exercises enable row level security;
alter table daily_checkins enable row level security;
alter table workout_logs   enable row level security;


-- profiles — you may read and edit only your own row. No INSERT policy: rows
-- are created by the trigger above, never by the client.
create policy "profiles: read own"
  on profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "profiles: update own"
  on profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));


-- exercises — shared reference data. Everyone signed in can read it; nobody
-- can write it. The absence of INSERT/UPDATE/DELETE policies is the denial.
create policy "exercises: read all"
  on exercises for select to authenticated
  using (true);


-- workout_plans — owned directly via user_id.
create policy "workout_plans: own rows"
  on workout_plans for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));


-- plan_days and plan_exercises have no user_id of their own. Ownership is
-- reached by walking up the foreign keys — so the check is an EXISTS against
-- the parent rather than a column comparison.
create policy "plan_days: via owning plan"
  on plan_days for all to authenticated
  using (exists (
    select 1 from workout_plans p
    where p.id = plan_days.plan_id and p.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from workout_plans p
    where p.id = plan_days.plan_id and p.user_id = (select auth.uid())
  ));

create policy "plan_exercises: via owning plan"
  on plan_exercises for all to authenticated
  using (exists (
    select 1 from plan_days d
    join workout_plans p on p.id = d.plan_id
    where d.id = plan_exercises.plan_day_id and p.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from plan_days d
    join workout_plans p on p.id = d.plan_id
    where d.id = plan_exercises.plan_day_id and p.user_id = (select auth.uid())
  ));


-- daily_checkins and workout_logs — owned directly via user_id.
create policy "daily_checkins: own rows"
  on daily_checkins for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "workout_logs: own rows"
  on workout_logs for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
