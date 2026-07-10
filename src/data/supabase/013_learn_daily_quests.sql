-- Optional: persist learn quest claim state across devices (guest + signed-in).
-- The app works without this migration using localStorage (`learn.questDayStore`).
-- Run in Supabase SQL editor when you want cloud sync.

create table if not exists public.learn_quest_progress (
  id bigint generated always as identity primary key,
  learner_id uuid references auth.users (id) on delete cascade,
  guest_session_id text,
  classroom_id text not null default 'l4gHC6hvRo',
  quest_date date not null default (timezone('utc', now()))::date,
  week_key date not null,
  month_key text not null,
  baselines jsonb not null default '{}'::jsonb,
  week_baselines jsonb not null default '{}'::jsonb,
  month_baselines jsonb not null default '{}'::jsonb,
  claimed jsonb not null default '{"daily":[],"weekly":[],"monthly":[]}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint learn_quest_progress_owner_check check (
    learner_id is not null or guest_session_id is not null
  )
);

create unique index if not exists learn_quest_progress_guest_day_uidx
  on public.learn_quest_progress (guest_session_id, classroom_id, quest_date)
  where guest_session_id is not null;

create unique index if not exists learn_quest_progress_learner_day_uidx
  on public.learn_quest_progress (learner_id, classroom_id, quest_date)
  where learner_id is not null;

alter table public.learn_quest_progress enable row level security;

drop policy if exists "learn_quest_guest_select" on public.learn_quest_progress;
create policy "learn_quest_guest_select"
  on public.learn_quest_progress for select
  using (guest_session_id is not null);

drop policy if exists "learn_quest_guest_upsert" on public.learn_quest_progress;
create policy "learn_quest_guest_upsert"
  on public.learn_quest_progress for insert
  with check (guest_session_id is not null);

drop policy if exists "learn_quest_guest_update" on public.learn_quest_progress;
create policy "learn_quest_guest_update"
  on public.learn_quest_progress for update
  using (guest_session_id is not null);

drop policy if exists "learn_quest_learner_select" on public.learn_quest_progress;
create policy "learn_quest_learner_select"
  on public.learn_quest_progress for select
  using (auth.uid() = learner_id);

drop policy if exists "learn_quest_learner_upsert" on public.learn_quest_progress;
create policy "learn_quest_learner_upsert"
  on public.learn_quest_progress for insert
  with check (auth.uid() = learner_id);

drop policy if exists "learn_quest_learner_update" on public.learn_quest_progress;
create policy "learn_quest_learner_update"
  on public.learn_quest_progress for update
  using (auth.uid() = learner_id);
