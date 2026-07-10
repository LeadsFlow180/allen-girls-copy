-- AGA Phase 6 — Teacher profiles + teacher-student links.
-- Run after 001_initial_schema.sql.
-- Supabase SQL Editor → paste full contents → Run.

-- ── Teacher profile (invite code, classroom name) ───────────────────────
create table if not exists public.teacher_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  classroom_name text not null default '',
  invite_code text not null unique,
  created_at timestamptz not null default now()
);

-- ── Teacher ↔ Student link ───────────────────────────────────────────────
create table if not exists public.teacher_students (
  teacher_user_id uuid not null references public.profiles (id) on delete cascade,
  student_user_id uuid not null references public.profiles (id) on delete cascade,
  linked_at timestamptz not null default now(),
  primary key (teacher_user_id, student_user_id)
);

create index if not exists ts_teacher_idx on public.teacher_students (teacher_user_id);
create index if not exists ts_student_idx on public.teacher_students (student_user_id);

-- ── Auto-create teacher_profile when a teacher account is created ────────
-- Updated handle_new_user to also insert teacher row
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.user_role;
  dn text; 
  code text;
begin
  r := coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role);
  dn := left(trim(coalesce(new.raw_user_meta_data->>'display_name', '')), 80);
  if dn = '' then
    dn := split_part(new.email, '@', 1);
  end if;

  insert into public.profiles (id, role, display_name)
  values (new.id, r, dn)
  on conflict (id) do nothing;

  if r = 'student' then
    code := upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    insert into public.student_profiles (user_id, parent_approved_at, approval_code)
    values (new.id, null, code)
    on conflict (user_id) do nothing;
  end if;

  if r = 'teacher' then
    code := 'T-' || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 7));
    insert into public.teacher_profiles (user_id, classroom_name, invite_code)
    values (new.id, '', code)
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

-- ── Backfill: give existing teacher accounts a teacher_profile row ────────
insert into public.teacher_profiles (user_id, classroom_name, invite_code)
select
  p.id,
  '',
  'T-' || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 7))
from public.profiles p
where p.role = 'teacher'
  and not exists (select 1 from public.teacher_profiles tp where tp.user_id = p.id)
on conflict (user_id) do nothing;

-- ── RPC: teacher links a student using student's approval code ────────────
create or replace function public.link_student_to_teacher(p_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_teacher_id uuid;
  v_student_id uuid;
  normalized text;
begin
  v_teacher_id := auth.uid();
  if v_teacher_id is null then
    return json_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  if not exists (
    select 1 from public.profiles p where p.id = v_teacher_id and p.role = 'teacher'
  ) then
    return json_build_object('ok', false, 'error', 'not_teacher');
  end if;

  normalized := upper(replace(trim(p_code), ' ', ''));

  select sp.user_id into v_student_id
  from public.student_profiles sp
  where sp.approval_code = normalized
  limit 1;

  if v_student_id is null then
    return json_build_object('ok', false, 'error', 'invalid_code');
  end if;

  insert into public.teacher_students (teacher_user_id, student_user_id)
  values (v_teacher_id, v_student_id)
  on conflict do nothing;

  return json_build_object('ok', true, 'student_user_id', v_student_id);
end;
$$;

grant execute on function public.link_student_to_teacher(text) to authenticated;

-- ── RLS ──────────────────────────────────────────────────────────────────
alter table public.teacher_profiles enable row level security;
alter table public.teacher_students enable row level security;

-- Teacher sees own profile
create policy "teacher_profile_select_own"
  on public.teacher_profiles for select using (auth.uid() = user_id);

create policy "teacher_profile_update_own"
  on public.teacher_profiles for update using (auth.uid() = user_id);

-- teacher_students: teacher sees their own links
create policy "ts_select_teacher"
  on public.teacher_students for select using (auth.uid() = teacher_user_id);

-- Students can see which teacher they are linked to
create policy "ts_select_student"
  on public.teacher_students for select using (auth.uid() = student_user_id);

-- ── Grant parents read access to domain tiers for their children ──────────
-- (this policy may already exist from phase 2; adding defensively)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'student_domain_tiers'
      and policyname = 'sdt_select_parent'
  ) then
    execute $policy$
      create policy "sdt_select_parent"
        on public.student_domain_tiers for select
        using (
          exists (
            select 1 from public.student_profiles sp
            where sp.user_id = student_domain_tiers.student_user_id
              and sp.parent_user_id = auth.uid()
              and sp.parent_approved_at is not null
          )
        )
    $policy$;
  end if;
end $$;

-- Teachers can read domain tiers for linked students
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'student_domain_tiers'
      and policyname = 'sdt_select_teacher'
  ) then
    execute $policy$
      create policy "sdt_select_teacher"
        on public.student_domain_tiers for select
        using (
          exists (
            select 1 from public.teacher_students ts
            where ts.student_user_id = student_domain_tiers.student_user_id
              and ts.teacher_user_id = auth.uid()
          )
        )
    $policy$;
  end if;
end $$;

-- Teachers can read learning paths for linked students
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'student_learning_path'
      and policyname = 'slp_select_teacher'
  ) then
    execute $policy$
      create policy "slp_select_teacher"
        on public.student_learning_path for select
        using (
          exists (
            select 1 from public.teacher_students ts
            where ts.student_user_id = student_learning_path.student_user_id
              and ts.teacher_user_id = auth.uid()
          )
        )
    $policy$;
  end if;
end $$;

-- Teachers can read points wallets for linked students
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'points_wallet'
      and policyname = 'wallet_select_teacher'
  ) then
    execute $policy$
      create policy "wallet_select_teacher"
        on public.points_wallet for select
        using (
          exists (
            select 1 from public.teacher_students ts
            where ts.student_user_id = points_wallet.student_user_id
              and ts.teacher_user_id = auth.uid()
          )
        )
    $policy$;
  end if;
end $$;

-- Parents can read learning paths for their children
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'student_learning_path'
      and policyname = 'slp_select_parent'
  ) then
    execute $policy$
      create policy "slp_select_parent"
        on public.student_learning_path for select
        using (
          exists (
            select 1 from public.student_profiles sp
            where sp.user_id = student_learning_path.student_user_id
              and sp.parent_user_id = auth.uid()
              and sp.parent_approved_at is not null
          )
        )
    $policy$;
  end if;
end $$;

-- Parents can read points wallets for their children
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'points_wallet'
      and policyname = 'wallet_select_parent'
  ) then
    execute $policy$
      create policy "wallet_select_parent"
        on public.points_wallet for select
        using (
          exists (
            select 1 from public.student_profiles sp
            where sp.user_id = points_wallet.student_user_id
              and sp.parent_user_id = auth.uid()
              and sp.parent_approved_at is not null
          )
        )
    $policy$;
  end if;
end $$;
