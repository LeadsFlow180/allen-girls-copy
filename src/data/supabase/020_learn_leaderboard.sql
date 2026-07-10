-- Leaderboard: public read of student display names for ranked list (API uses service role;
-- this policy allows future client reads if needed).
-- Run after 001_initial_schema.sql and 010_learn_playback_progress.sql.

drop policy if exists "profiles_select_students_leaderboard" on public.profiles;
create policy "profiles_select_students_leaderboard"
  on public.profiles for select
  using (
    auth.uid() is not null
    and role = 'student'::public.user_role
  );

notify pgrst, 'reload schema';
