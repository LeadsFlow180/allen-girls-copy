-- AGA Phase 8 — language courses catalog (run after 001_initial_schema.sql).
-- Supabase SQL Editor -> paste -> Run once.

create table if not exists public.learning_languages (
  id bigserial primary key,
  code text not null unique,
  name text not null,
  country_code text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.language_courses (
  id bigserial primary key,
  language_id bigint not null references public.learning_languages (id) on delete cascade,
  title text not null,
  level text not null default 'A1',
  learners_label text not null default '0',
  sort_order int not null default 100,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  unique (language_id, title)
);

create index if not exists learning_languages_code_idx
  on public.learning_languages (code);

create index if not exists language_courses_language_sort_idx
  on public.language_courses (language_id, sort_order);

alter table public.learning_languages enable row level security;
alter table public.language_courses enable row level security;

drop policy if exists "learning_languages_read_all" on public.learning_languages;
create policy "learning_languages_read_all"
  on public.learning_languages for select
  using (true);

drop policy if exists "language_courses_read_all" on public.language_courses;
create policy "language_courses_read_all"
  on public.language_courses for select
  using (true);

insert into public.learning_languages (code, name, country_code) values
  ('es', 'Spanish', 'ES'),
  ('fr', 'French', 'FR'),
  ('ja', 'Japanese', 'JP'),
  ('de', 'German', 'DE'),
  ('ko', 'Korean', 'KR'),
  ('it', 'Italian', 'IT'),
  ('pt', 'Portuguese', 'BR'),
  ('ru', 'Russian', 'RU'),
  ('tr', 'Turkish', 'TR'),
  ('nl', 'Dutch', 'NL'),
  ('sv', 'Swedish', 'SE'),
  ('pl', 'Polish', 'PL'),
  ('zh', 'Chinese', 'CN'),
  ('ar', 'Arabic', 'SA'),
  ('hi', 'Hindi', 'IN'),
  ('ur', 'Urdu', 'PK'),
  ('en', 'English', 'GB')
on conflict (code) do update set
  name = excluded.name,
  country_code = excluded.country_code,
  is_active = true;

insert into public.language_courses (language_id, title, level, learners_label, sort_order)
select ll.id, ll.name, 'A1', x.learners_label, x.sort_order
from public.learning_languages ll
join (
  values
    ('es', '48.8M', 1),
    ('fr', '27.2M', 2),
    ('ja', '24.4M', 3),
    ('de', '19M', 4),
    ('ko', '17.8M', 5),
    ('it', '13.4M', 6),
    ('pt', '20.3M', 7),
    ('ru', '16.1M', 8),
    ('tr', '10.4M', 9),
    ('nl', '9.2M', 10),
    ('sv', '8.3M', 11),
    ('pl', '7.5M', 12),
    ('zh', '11.8M', 13),
    ('ar', '9.9M', 14),
    ('hi', '11.7M', 15),
    ('ur', '5.2M', 16),
    ('en', '42.4M', 17)
) as x(code, learners_label, sort_order) on x.code = ll.code
on conflict (language_id, title) do update set
  learners_label = excluded.learners_label,
  sort_order = excluded.sort_order,
  is_published = true;
