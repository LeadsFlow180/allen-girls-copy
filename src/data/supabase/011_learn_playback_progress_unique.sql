-- Fix POST /api/learn/content upsert (Postgres 42P10): ON CONFLICT needs matching unique indexes.
-- Run once in Supabase SQL Editor, then reload API schema (see NOTIFY below).

-- Guest embed: one row per guest session + classroom
create unique index if not exists learn_playback_progress_guest_classroom_uq
  on public.learn_playback_progress (guest_session_id, classroom_id)
  where guest_session_id is not null;

-- Signed-in learner: one row per learner + classroom
create unique index if not exists learn_playback_progress_learner_classroom_uq
  on public.learn_playback_progress (learner_id, classroom_id)
  where learner_id is not null;

-- Legacy PK on (owner_id, classroom_id) is not used by the API upsert — drop if present
alter table public.learn_playback_progress
  drop constraint if exists learn_playback_progress_pkey;

-- Refresh PostgREST schema cache so new indexes are visible to Supabase client
notify pgrst, 'reload schema';
