-- AGA Phase 9 — language curriculum + quiz content schema.
-- Run after 007_phase8_language_courses.sql.

create table if not exists public.learning_sections (
  id bigserial primary key,
  language_course_id bigint not null references public.language_courses (id) on delete cascade,
  slug text not null,
  title text not null,
  description text not null,
  sort_order int not null default 1,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  unique (language_course_id, slug)
);

create table if not exists public.learning_units (
  id bigserial primary key,
  learning_section_id bigint not null references public.learning_sections (id) on delete cascade,
  slug text not null,
  title text not null,
  description text not null,
  reward_xp int not null default 10,
  sort_order int not null default 1,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  unique (learning_section_id, slug)
);

create table if not exists public.learning_steps (
  id bigserial primary key,
  learning_unit_id bigint not null references public.learning_units (id) on delete cascade,
  slug text not null,
  kind text not null check (kind in ('start', 'lesson', 'chest', 'practice', 'review')),
  title text not null,
  description text not null,
  sort_order int not null default 1,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  unique (learning_unit_id, slug),
  unique (learning_unit_id, kind)
);

create table if not exists public.learning_questions (
  id bigserial primary key,
  learning_step_id bigint not null references public.learning_steps (id) on delete cascade,
  slug text not null,
  question_type text not null default 'multiple_choice',
  from_language text not null default 'en',
  to_language text not null default 'es',
  prompt text not null,
  explanation text not null,
  tts_text text,
  tts_lang text,
  sort_order int not null default 1,
  created_at timestamptz not null default now(),
  unique (learning_step_id, slug)
);

create table if not exists public.learning_question_options (
  id bigserial primary key,
  learning_question_id bigint not null references public.learning_questions (id) on delete cascade,
  option_key text not null,
  answer_text text not null,
  image_src text,
  is_correct boolean not null default false,
  sort_order int not null default 1,
  created_at timestamptz not null default now(),
  unique (learning_question_id, option_key)
);

create index if not exists learning_sections_course_sort_idx
  on public.learning_sections (language_course_id, sort_order);

create index if not exists learning_units_section_sort_idx
  on public.learning_units (learning_section_id, sort_order);

create index if not exists learning_steps_unit_sort_idx
  on public.learning_steps (learning_unit_id, sort_order);

create index if not exists learning_questions_step_sort_idx
  on public.learning_questions (learning_step_id, sort_order);

create index if not exists learning_question_options_question_sort_idx
  on public.learning_question_options (learning_question_id, sort_order);

alter table public.learning_sections enable row level security;
alter table public.learning_units enable row level security;
alter table public.learning_steps enable row level security;
alter table public.learning_questions enable row level security;
alter table public.learning_question_options enable row level security;

drop policy if exists "learning_sections_read_all" on public.learning_sections;
create policy "learning_sections_read_all"
  on public.learning_sections for select
  using (is_published = true);

drop policy if exists "learning_units_read_all" on public.learning_units;
create policy "learning_units_read_all"
  on public.learning_units for select
  using (is_published = true);

drop policy if exists "learning_steps_read_all" on public.learning_steps;
create policy "learning_steps_read_all"
  on public.learning_steps for select
  using (is_published = true);

drop policy if exists "learning_questions_read_all" on public.learning_questions;
create policy "learning_questions_read_all"
  on public.learning_questions for select
  using (true);

drop policy if exists "learning_question_options_read_all" on public.learning_question_options;
create policy "learning_question_options_read_all"
  on public.learning_question_options for select
  using (true);
