-- Phase 11 — Guardian-managed family profiles
-- Parents can create pre-approved child accounts; self-enrolled students stay pending until code approval.

alter table public.student_profiles
  add column if not exists guardian_created boolean not null default false;

comment on column public.student_profiles.guardian_created is
  'True when the parent created this learner account (auto-approved). False for self sign-up.';

-- Parents may update display_name on linked approved children
drop policy if exists "profiles_update_parent_child" on public.profiles;
create policy "profiles_update_parent_child"
  on public.profiles for update
  using (
    exists (
      select 1
      from public.student_profiles sp
      where sp.user_id = profiles.id
        and sp.parent_user_id = auth.uid()
        and sp.parent_approved_at is not null
    )
  )
  with check (
    exists (
      select 1
      from public.student_profiles sp
      where sp.user_id = profiles.id
        and sp.parent_user_id = auth.uid()
        and sp.parent_approved_at is not null
    )
  );

-- Parents can read basic profile fields for all their children (including pending code approval)
drop policy if exists "profiles_select_parent_children" on public.profiles;
create policy "profiles_select_parent_children"
  on public.profiles for select
  using (
    auth.uid() = id
    or exists (
      select 1
      from public.student_profiles sp
      where sp.user_id = profiles.id
        and sp.parent_user_id = auth.uid()
    )
  );
