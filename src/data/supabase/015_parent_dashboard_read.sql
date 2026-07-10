-- Parent read access for learn playback + quizzes + quest cloud sync
--
-- Run in this order (skip any you already applied):
--   010_learn_playback_progress.sql
--   012_learn_quiz_submissions.sql
--   013_learn_daily_quests.sql   <-- creates learn_quest_progress (optional but needed for quest policy below)
--   014_parent_family_profiles.sql
--   015_parent_dashboard_read.sql  (this file)

drop policy if exists "learn_playback_select_parent" on public.learn_playback_progress;
create policy "learn_playback_select_parent"
  on public.learn_playback_progress for select
  using (
    exists (
      select 1
      from public.student_profiles sp
      where sp.user_id = learn_playback_progress.learner_id
        and sp.parent_user_id = auth.uid()
        and sp.parent_approved_at is not null
    )
  );

drop policy if exists "learn_quiz_select_parent" on public.learn_quiz_submissions;
create policy "learn_quiz_select_parent"
  on public.learn_quiz_submissions for select
  using (
    exists (
      select 1
      from public.student_profiles sp
      where sp.user_id = learn_quiz_submissions.learner_id
        and sp.parent_user_id = auth.uid()
        and sp.parent_approved_at is not null
    )
  );

-- Quest policy only when learn_quest_progress exists (migration 013)
do $quest_policy$
begin
  if to_regclass('public.learn_quest_progress') is null then
    raise notice 'Skipped learn_quest_parent_select: run 013_learn_daily_quests.sql first.';
    return;
  end if;

  drop policy if exists "learn_quest_parent_select" on public.learn_quest_progress;
  create policy "learn_quest_parent_select"
    on public.learn_quest_progress for select
    using (
      exists (
        select 1
        from public.student_profiles sp
        where sp.user_id = learn_quest_progress.learner_id
          and sp.parent_user_id = auth.uid()
          and sp.parent_approved_at is not null
      )
    );
end $quest_policy$;

notify pgrst, 'reload schema';
