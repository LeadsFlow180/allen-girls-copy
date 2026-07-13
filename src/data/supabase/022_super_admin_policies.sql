-- Phase 21b — Super Admin library policies (run AFTER 021_super_admin_role.sql committed).
-- Run in Supabase SQL Editor as a separate query.
--
-- Then promote your account (replace with your auth user id):
--   update public.profiles set role = 'super_admin' where id = 'YOUR-USER-UUID';

-- ── Library stories: super admin only (teachers lose write/read-draft) ──
drop policy if exists library_stories_teacher_read on public.library_stories;
drop policy if exists library_stories_teacher_insert on public.library_stories;
drop policy if exists library_stories_teacher_update on public.library_stories;
drop policy if exists library_stories_teacher_delete on public.library_stories;

drop policy if exists library_stories_super_admin_read on public.library_stories;
create policy library_stories_super_admin_read
  on public.library_stories
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super_admin'
    )
  );

drop policy if exists library_stories_super_admin_insert on public.library_stories;
create policy library_stories_super_admin_insert
  on public.library_stories
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super_admin'
    )
  );

drop policy if exists library_stories_super_admin_update on public.library_stories;
create policy library_stories_super_admin_update
  on public.library_stories
  for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super_admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super_admin'
    )
  );

drop policy if exists library_stories_super_admin_delete on public.library_stories;
create policy library_stories_super_admin_delete
  on public.library_stories
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super_admin'
    )
  );

-- ── Storage: library assets super admin only ─────────────────────────────
drop policy if exists library_assets_teacher_insert on storage.objects;
drop policy if exists library_assets_teacher_update on storage.objects;
drop policy if exists library_assets_teacher_delete on storage.objects;

drop policy if exists library_assets_super_admin_insert on storage.objects;
create policy library_assets_super_admin_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'library-assets'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super_admin'
    )
  );

drop policy if exists library_assets_super_admin_update on storage.objects;
create policy library_assets_super_admin_update
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'library-assets'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super_admin'
    )
  );

drop policy if exists library_assets_super_admin_delete on storage.objects;
create policy library_assets_super_admin_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'library-assets'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'super_admin'
    )
  );

notify pgrst, 'reload schema';

Create Chapters by AI
Upload Books as a pdf then show them as the books flipable.
