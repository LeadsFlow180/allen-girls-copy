-- Cloud columns used by /api/learn/content upsert and /api/learn/playback-progress GET.
-- Run in Supabase SQL Editor if Explore shows 0% but parent dashboard has slide data.

alter table public.learn_playback_progress
  add column if not exists details jsonb not null default '{}'::jsonb;

alter table public.learn_playback_progress
  add column if not exists quiz jsonb;

alter table public.learn_playback_progress
  add column if not exists db_section_id int;

alter table public.learn_playback_progress
  add column if not exists db_unit_id int;

alter table public.learn_playback_progress
  add column if not exists last_played_at timestamptz;

drop policy if exists "learn_playback_select_learner" on public.learn_playback_progress;
create policy "learn_playback_select_learner"
  on public.learn_playback_progress for select
  using (auth.uid() = learner_id);

drop policy if exists "learn_quiz_select_learner" on public.learn_quiz_submissions;
create policy "learn_quiz_select_learner"
  on public.learn_quiz_submissions for select
  using (auth.uid() = learner_id);

notify pgrst, 'reload schema';
