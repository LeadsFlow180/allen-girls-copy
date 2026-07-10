-- AGA Phase 1 — run this in Supabase SQL Editor (Dashboard → SQL → New query).
-- Creates profiles, student_profiles (COPPA-style approval), placement_results, and RLS.

-- ── Roles ─────────────────────────────────────────────────────────────
create type public.user_role as enum ('student', 'parent', 'teacher');

-- ── Profiles (1:1 with auth.users) ────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);

-- ── Student extension (approval + link to parent) ───────────────────────
create table public.student_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  parent_user_id uuid references public.profiles (id) on delete set null,
  parent_approved_at timestamptz,
  approval_code text not null unique,
  created_at timestamptz not null default now()
);

create index student_profiles_parent_idx on public.student_profiles (parent_user_id);

-- ── Placement results (synced from app after assessment) ────────────────
create table public.placement_results (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references public.profiles (id) on delete cascade,
  completed_at timestamptz not null default now(),
  display_name text not null,
  score jsonb not null,
  version int not null default 1
);

create index placement_results_student_completed_idx
  on public.placement_results (student_user_id, completed_at desc);

-- ── New user → profile (+ student row if student) ───────────────────────
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
  values (new.id, r, dn);

  if r = 'student' then
    code := upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    insert into public.student_profiles (user_id, parent_approved_at, approval_code)
    values (new.id, null, code);
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Parent approves learner by code (COPPA-style) ───────────────────────
create or replace function public.approve_learner_by_code(p_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_parent_id uuid;
  v_student_id uuid;
  normalized text;
begin
  v_parent_id := auth.uid();
  if v_parent_id is null then
    return json_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  if not exists (
    select 1 from public.profiles p where p.id = v_parent_id and p.role = 'parent'
  ) then
    return json_build_object('ok', false, 'error', 'not_parent');
  end if;

  normalized := upper(replace(trim(p_code), ' ', ''));

  update public.student_profiles sp
  set
    parent_user_id = v_parent_id,
    parent_approved_at = now()
  where sp.approval_code = normalized
    and sp.parent_approved_at is null
  returning sp.user_id into v_student_id;

  if v_student_id is null then
    return json_build_object('ok', false, 'error', 'invalid_or_used_code');
  end if;

  return json_build_object('ok', true, 'student_user_id', v_student_id);
end;
$$;

grant execute on function public.approve_learner_by_code(text) to authenticated;

-- ── RLS ─────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.student_profiles enable row level security;
alter table public.placement_results enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "student_profiles_select_own_or_child"
  on public.student_profiles for select
  using (
    auth.uid() = user_id
    or auth.uid() = parent_user_id
  );

create policy "placement_insert_own_student"
  on public.placement_results for insert
  with check (
    auth.uid() = student_user_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'student'
    )
  );

create policy "placement_select_own"
  on public.placement_results for select
  using (auth.uid() = student_user_id);

-- Parents can read placements for approved linked children
create policy "placement_select_parent_linked"
  on public.placement_results for select
  using (
    exists (
      select 1
      from public.student_profiles sp
      where sp.user_id = placement_results.student_user_id
        and sp.parent_user_id = auth.uid()
        and sp.parent_approved_at is not null
    )
  );
