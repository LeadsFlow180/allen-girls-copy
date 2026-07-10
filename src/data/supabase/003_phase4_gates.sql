-- AGA Phase 4 — gate + checkpoint persistence.
-- Run after 001 + 002.

create table if not exists public.mission_checkpoints (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references public.profiles (id) on delete cascade,
  mission_id text not null,
  checkpoint_type text not null
    check (checkpoint_type in ('guided_practice_start', 'gate_start', 'gate_complete', 'pre_gateway')),
  gate_type text
    check (gate_type in ('crisis', 'discovery')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists mission_checkpoints_student_mission_idx
  on public.mission_checkpoints (student_user_id, mission_id, created_at desc);

alter table public.mission_checkpoints enable row level security;

create policy "mission_checkpoints_select_own"
  on public.mission_checkpoints for select
  using (auth.uid() = student_user_id);

create policy "mission_checkpoints_insert_own"
  on public.mission_checkpoints for insert
  with check (
    auth.uid() = student_user_id
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'student')
  );

-- Parents can read linked student checkpoints
create policy "mission_checkpoints_select_parent_linked"
  on public.mission_checkpoints for select
  using (
    exists (
      select 1 from public.student_profiles sp
      where sp.user_id = mission_checkpoints.student_user_id
        and sp.parent_user_id = auth.uid()
        and sp.parent_approved_at is not null
    )
  );
