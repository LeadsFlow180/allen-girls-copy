-- Learn playback progress (guest + signed-in) — written by POST /api/learn/content
-- Run in Supabase SQL Editor after prior phase migrations.

create table if not exists public.learn_playback_progress (
  learner_id uuid references auth.users (id) on delete cascade,
  guest_session_id uuid,
  classroom_id text not null,
  current_scene_id text,
  scene_index int not null default 0,
  action_index int not null default 0,
  consumed_discussions jsonb not null default '[]'::jsonb,
  playback_completed boolean not null default false,
  status text not null check (status in ('progress', 'complete')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learn_playback_progress_owner_shape check (
    (
      learner_id is not null
      and guest_session_id is null
    )
    or (
      learner_id is null
      and guest_session_id is not null
    )
  )
);

create unique index if not exists learn_playback_progress_guest_classroom_uq
  on public.learn_playback_progress (guest_session_id, classroom_id)
  where guest_session_id is not null;

create unique index if not exists learn_playback_progress_learner_classroom_uq
  on public.learn_playback_progress (learner_id, classroom_id)
  where learner_id is not null;

create index if not exists learn_playback_progress_classroom_idx
  on public.learn_playback_progress (classroom_id);

alter table public.learn_playback_progress enable row level security;

-- No public policies: API uses SUPABASE_SERVICE_ROLE_KEY after HMAC verification.
