-- Graded quiz submissions from AI School (status: "quiz") — does NOT complete ladder missions.
-- Run in Supabase SQL Editor after 010/011.

create table if not exists public.learn_quiz_submissions (
  id uuid primary key default gen_random_uuid(),
  guest_session_id uuid,
  learner_id uuid references auth.users (id) on delete cascade,
  classroom_id text not null,
  scene_id text,
  ladder_step text,
  scene_index int,
  section_id int,
  unit_index int,
  quiz jsonb not null,
  submitted_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint learn_quiz_submissions_owner_check check (
    (learner_id is not null and guest_session_id is null)
    or (learner_id is null and guest_session_id is not null)
  )
);

create index if not exists learn_quiz_submissions_guest_classroom_idx
  on public.learn_quiz_submissions (guest_session_id, classroom_id, submitted_at desc)
  where guest_session_id is not null;

create index if not exists learn_quiz_submissions_learner_classroom_idx
  on public.learn_quiz_submissions (learner_id, classroom_id, submitted_at desc)
  where learner_id is not null;

alter table public.learn_quiz_submissions enable row level security;

notify pgrst, 'reload schema';
