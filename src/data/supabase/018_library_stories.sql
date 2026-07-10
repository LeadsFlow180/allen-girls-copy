-- AGA Phase 18 — Library stories (shared teacher-managed catalog + public read).
-- Stories are NOT per-teacher: every teacher role can create, edit, and delete any row.
-- Run after 017_learn_playback_cloud_columns.sql.
-- Supabase SQL Editor → paste full contents → Run.

-- ── Library stories ─────────────────────────────────────────────────────
create table if not exists public.library_stories (
  id text primary key,
  wing text not null check (wing in ('allen_girls', 'licensed')),
  title text not null,
  author text not null default 'Allen Girls Adventures',
  synopsis text not null default '',
  age_band text not null default 'Ages 8–11',
  format text not null default 'text' check (format in ('text', 'pdf')),
  tier text not null default 'standard' check (tier in ('standard', 'vip')),
  chapters jsonb not null default '[]'::jsonb,
  cover_url text,
  pdf_url text,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists library_stories_wing_idx on public.library_stories (wing);
create index if not exists library_stories_published_idx on public.library_stories (is_published);
create index if not exists library_stories_sort_idx on public.library_stories (sort_order, title);

alter table public.library_stories enable row level security;

-- Published stories are readable by anyone (anon + authenticated).
drop policy if exists library_stories_public_read on public.library_stories;
create policy library_stories_public_read
  on public.library_stories
  for select
  using (is_published = true);

-- Teachers can read all stories (including drafts).
drop policy if exists library_stories_teacher_read on public.library_stories;
create policy library_stories_teacher_read
  on public.library_stories
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'teacher'
    )
  );

-- Teachers can insert / update / delete.
drop policy if exists library_stories_teacher_insert on public.library_stories;
create policy library_stories_teacher_insert
  on public.library_stories
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'teacher'
    )
  );

drop policy if exists library_stories_teacher_update on public.library_stories;
create policy library_stories_teacher_update
  on public.library_stories
  for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'teacher'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'teacher'
    )
  );

drop policy if exists library_stories_teacher_delete on public.library_stories;
create policy library_stories_teacher_delete
  on public.library_stories
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'teacher'
    )
  );

-- ── Storage bucket for covers + PDFs ─────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'library-assets',
  'library-assets',
  true,
  15728640,
  array['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read for library assets.
drop policy if exists library_assets_public_read on storage.objects;
create policy library_assets_public_read
  on storage.objects
  for select
  using (bucket_id = 'library-assets');

-- Teachers upload / replace / remove assets (API may also use service role).
drop policy if exists library_assets_teacher_insert on storage.objects;
create policy library_assets_teacher_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'library-assets'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'teacher'
    )
  );

drop policy if exists library_assets_teacher_update on storage.objects;
create policy library_assets_teacher_update
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'library-assets'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'teacher'
    )
  );

drop policy if exists library_assets_teacher_delete on storage.objects;
create policy library_assets_teacher_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'library-assets'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'teacher'
    )
  );
