-- AGA Phase 7 — Mission completions + skill mastery.
-- Run after 001–005.
-- Supabase SQL Editor → paste → Run.

-- ── Skill-level completions (one row per student+skill attempt that passed) ──
create table if not exists public.skill_completions (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references public.profiles (id) on delete cascade,
  module_id text not null,
  skill_id text not null,
  world_slug text not null,
  subject_category text not null,   -- 'ELA','STEM','SEL','Culture','Life_Skills'
  gate_type text not null,          -- 'crisis' | 'discovery'
  attempts int not null default 1,
  score int not null default 0,     -- 0–100
  points_awarded int not null default 0,
  completed_at timestamptz not null default now()
);

create index if not exists sc_student_module_idx
  on public.skill_completions (student_user_id, module_id);

create index if not exists sc_student_skill_idx
  on public.skill_completions (student_user_id, skill_id);

-- ── Module-level completions (all skills in module done) ─────────────────────
create table if not exists public.module_completions (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references public.profiles (id) on delete cascade,
  module_id text not null,
  world_slug text not null,
  total_points int not null default 0,
  skills_count int not null default 0,
  completed_at timestamptz not null default now(),
  unique (student_user_id, module_id, world_slug)
);

create index if not exists mc_student_idx
  on public.module_completions (student_user_id);

-- ── Daily streak tracker ──────────────────────────────────────────────────────
create table if not exists public.daily_streaks (
  student_user_id uuid primary key references public.profiles (id) on delete cascade,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_active_date date,
  updated_at timestamptz not null default now()
);

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table public.skill_completions   enable row level security;
alter table public.module_completions  enable row level security;
alter table public.daily_streaks       enable row level security;

-- Students
create policy "sc_select_own"
  on public.skill_completions for select using (auth.uid() = student_user_id);
create policy "sc_insert_own"
  on public.skill_completions for insert
  with check (auth.uid() = student_user_id and exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'student'));

create policy "mc_select_own"
  on public.module_completions for select using (auth.uid() = student_user_id);
create policy "mc_insert_own"
  on public.module_completions for insert
  with check (auth.uid() = student_user_id and exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'student'));
create policy "mc_update_own"
  on public.module_completions for update using (auth.uid() = student_user_id);

create policy "streak_select_own"
  on public.daily_streaks for select using (auth.uid() = student_user_id);
create policy "streak_upsert_own"
  on public.daily_streaks for insert
  with check (auth.uid() = student_user_id and exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'student'));
create policy "streak_update_own"
  on public.daily_streaks for update using (auth.uid() = student_user_id);

-- Parents can read child skill/module completions + streak
create policy "sc_select_parent"
  on public.skill_completions for select using (
    exists (select 1 from public.student_profiles sp
      where sp.user_id = skill_completions.student_user_id
        and sp.parent_user_id = auth.uid()
        and sp.parent_approved_at is not null));

create policy "mc_select_parent"
  on public.module_completions for select using (
    exists (select 1 from public.student_profiles sp
      where sp.user_id = module_completions.student_user_id
        and sp.parent_user_id = auth.uid()
        and sp.parent_approved_at is not null));

create policy "streak_select_parent"
  on public.daily_streaks for select using (
    exists (select 1 from public.student_profiles sp
      where sp.user_id = daily_streaks.student_user_id
        and sp.parent_user_id = auth.uid()
        and sp.parent_approved_at is not null));

-- Teachers can read skill/module completions for linked students
create policy "sc_select_teacher"
  on public.skill_completions for select using (
    exists (select 1 from public.teacher_students ts
      where ts.student_user_id = skill_completions.student_user_id
        and ts.teacher_user_id = auth.uid()));

create policy "mc_select_teacher"
  on public.module_completions for select using (
    exists (select 1 from public.teacher_students ts
      where ts.student_user_id = module_completions.student_user_id
        and ts.teacher_user_id = auth.uid()));
