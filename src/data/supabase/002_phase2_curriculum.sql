-- AGA Phase 2 — curriculum routing + domain tiers (run after 001_initial_schema.sql).
-- Supabase SQL Editor → paste → Run once.

-- ── Per-domain placement tier (independent ELA / Math routing) ───────────
create table if not exists public.student_domain_tiers (
  student_user_id uuid not null references public.profiles (id) on delete cascade,
  domain text not null check (domain in ('ela', 'math')),
  tier text not null check (tier in ('emerging', 'on_track', 'stretch')),
  percent int not null default 0 check (percent >= 0 and percent <= 100),
  placement_result_id uuid references public.placement_results (id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (student_user_id, domain)
);

create index if not exists student_domain_tiers_student_idx
  on public.student_domain_tiers (student_user_id);

-- ── Cached mission / module pointer (Mission Engine output) ───────────────
create table if not exists public.student_learning_path (
  student_user_id uuid primary key references public.profiles (id) on delete cascade,
  active_module_id text not null default 'mod_01',
  recommended_world_slug text not null default 'fossil-frontier',
  focus_domain text not null default 'ela' check (focus_domain in ('ela', 'math')),
  next_skill_ids jsonb not null default '[]'::jsonb,
  overall_tier text not null default 'on_track' check (overall_tier in ('emerging', 'on_track', 'stretch')),
  updated_at timestamptz not null default now()
);

-- ── RLS ───────────────────────────────────────────────────────────────────
alter table public.student_domain_tiers enable row level security;
alter table public.student_learning_path enable row level security;

create policy "student_domain_tiers_select_own"
  on public.student_domain_tiers for select
  using (auth.uid() = student_user_id);

create policy "student_domain_tiers_select_parent_linked"
  on public.student_domain_tiers for select
  using (
    exists (
      select 1 from public.student_profiles sp
      where sp.user_id = student_domain_tiers.student_user_id
        and sp.parent_user_id = auth.uid()
        and sp.parent_approved_at is not null
    )
  );

create policy "student_domain_tiers_write_student"
  on public.student_domain_tiers for insert
  with check (
    auth.uid() = student_user_id
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'student')
  );

create policy "student_domain_tiers_update_student"
  on public.student_domain_tiers for update
  using (
    auth.uid() = student_user_id
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'student')
  );

create policy "student_learning_path_select_own"
  on public.student_learning_path for select
  using (auth.uid() = student_user_id);

create policy "student_learning_path_select_parent_linked"
  on public.student_learning_path for select
  using (
    exists (
      select 1 from public.student_profiles sp
      where sp.user_id = student_learning_path.student_user_id
        and sp.parent_user_id = auth.uid()
        and sp.parent_approved_at is not null
    )
  );

create policy "student_learning_path_insert_student"
  on public.student_learning_path for insert
  with check (
    auth.uid() = student_user_id
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'student')
  );

create policy "student_learning_path_update_student"
  on public.student_learning_path for update
  using (
    auth.uid() = student_user_id
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'student')
  );
