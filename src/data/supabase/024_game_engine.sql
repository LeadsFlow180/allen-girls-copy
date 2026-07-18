-- AGA Migration 024 — Game Engine (GAME-MASTER-SPEC §7 + PROGRESSION-SPEC §11).
-- Run after 001–023. Supabase SQL Editor → paste → Run.
--
-- Adds the three tables that connect games to the mastery + points pipeline:
--   skill_attempts          — every scored question, from ANY source
--   student_skill_mastery   — rolling mastery state per student per skill
--   game_sessions           — one row per game play session

-- ── 1. skill_attempts ─────────────────────────────────────────────────────────
create table if not exists public.skill_attempts (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references public.profiles (id) on delete cascade,
  skill_id text not null,                   -- canonical skill ID, e.g. 'SK-M3-101'
  question_id text not null,                -- content-bank ID
  question_band text not null,              -- 'emerging' | 'on_track' | 'stretch'
  correct boolean not null,
  attempt_number smallint not null default 1,  -- 1..3
  hint_level smallint not null default 0,      -- 0 none, 1 light, 2 scaffold
  response_ms integer,
  question_type text,                       -- 'calculation' | 'word_problem' | 'reasoning'
  source text not null,                     -- 'game' | 'mission' | 'gateway' | 'review'
  game_slug text,                           -- set when source = 'game'
  session_id uuid,                          -- game_sessions.id when source = 'game'
  created_at timestamptz not null default now()
);

create index if not exists sa_student_skill_idx
  on public.skill_attempts (student_user_id, skill_id, created_at desc);

create index if not exists sa_student_source_idx
  on public.skill_attempts (student_user_id, source, created_at desc);

-- ── 2. student_skill_mastery ──────────────────────────────────────────────────
create table if not exists public.student_skill_mastery (
  student_user_id uuid not null references public.profiles (id) on delete cascade,
  skill_id text not null,
  current_band text not null default 'emerging',   -- 'emerging' | 'on_track' | 'stretch'
  status text not null default 'not_started',
    -- 'not_started' | 'emerging' | 'on_track' | 'stretch'
    -- | 'mastery_candidate' | 'mastered' | 'review_due'
  mastery_score numeric(5,2) not null default 0,
  accuracy_score numeric(5,2) not null default 0,
  independence_score numeric(5,2) not null default 0,
  consistency_score numeric(5,2) not null default 0,
  retention_score numeric(5,2) not null default 0,
  interaction_count integer not null default 0,
  last_practiced_at timestamptz,
  next_review_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (student_user_id, skill_id)
);

-- ── 3. game_sessions ──────────────────────────────────────────────────────────
create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references public.profiles (id) on delete cascade,
  game_slug text not null,
  game_class text not null,                 -- 'academic' | 'arcade'
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer,
  questions_asked smallint not null default 0,
  questions_correct smallint not null default 0,
  points_awarded integer not null default 0,
  fun_coins integer not null default 0      -- arcade decoration; never converts
);

create index if not exists gs_student_idx
  on public.game_sessions (student_user_id, started_at desc);

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table public.skill_attempts        enable row level security;
alter table public.student_skill_mastery enable row level security;
alter table public.game_sessions         enable row level security;

-- Students: read + write their own rows
create policy "sa_select_own"
  on public.skill_attempts for select using (auth.uid() = student_user_id);
create policy "sa_insert_own"
  on public.skill_attempts for insert
  with check (auth.uid() = student_user_id and exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'student'));

create policy "ssm_select_own"
  on public.student_skill_mastery for select using (auth.uid() = student_user_id);
create policy "ssm_insert_own"
  on public.student_skill_mastery for insert
  with check (auth.uid() = student_user_id and exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'student'));
create policy "ssm_update_own"
  on public.student_skill_mastery for update using (auth.uid() = student_user_id);

create policy "gs_select_own"
  on public.game_sessions for select using (auth.uid() = student_user_id);
create policy "gs_insert_own"
  on public.game_sessions for insert
  with check (auth.uid() = student_user_id and exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'student'));
create policy "gs_update_own"
  on public.game_sessions for update using (auth.uid() = student_user_id);

-- Parents: read linked children's rows
create policy "sa_select_parent"
  on public.skill_attempts for select using (
    exists (select 1 from public.student_profiles sp
      where sp.user_id = skill_attempts.student_user_id
        and sp.parent_user_id = auth.uid()
        and sp.parent_approved_at is not null));

create policy "ssm_select_parent"
  on public.student_skill_mastery for select using (
    exists (select 1 from public.student_profiles sp
      where sp.user_id = student_skill_mastery.student_user_id
        and sp.parent_user_id = auth.uid()
        and sp.parent_approved_at is not null));

create policy "gs_select_parent"
  on public.game_sessions for select using (
    exists (select 1 from public.student_profiles sp
      where sp.user_id = game_sessions.student_user_id
        and sp.parent_user_id = auth.uid()
        and sp.parent_approved_at is not null));

-- Teachers: read linked students' rows
create policy "sa_select_teacher"
  on public.skill_attempts for select using (
    exists (select 1 from public.teacher_students ts
      where ts.student_user_id = skill_attempts.student_user_id
        and ts.teacher_user_id = auth.uid()));

create policy "ssm_select_teacher"
  on public.student_skill_mastery for select using (
    exists (select 1 from public.teacher_students ts
      where ts.student_user_id = student_skill_mastery.student_user_id
        and ts.teacher_user_id = auth.uid()));

create policy "gs_select_teacher"
  on public.game_sessions for select using (
    exists (select 1 from public.teacher_students ts
      where ts.student_user_id = game_sessions.student_user_id
        and ts.teacher_user_id = auth.uid()));
