-- AGA Phase 10 — curriculum review workflow metadata.
-- Run after 008_phase9_language_curriculum.sql.

alter table public.learning_questions
  add column if not exists content_source text not null default 'seeded',
  add column if not exists quality_status text not null default 'draft',
  add column if not exists review_notes text,
  add column if not exists reviewed_by uuid references auth.users (id),
  add column if not exists reviewed_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'learning_questions_quality_status_check'
  ) then
    alter table public.learning_questions
      add constraint learning_questions_quality_status_check
      check (quality_status in ('draft', 'reviewed', 'approved', 'rejected'));
  end if;
end $$;

create index if not exists learning_questions_quality_status_idx
  on public.learning_questions (quality_status);

create index if not exists learning_questions_content_source_idx
  on public.learning_questions (content_source);
