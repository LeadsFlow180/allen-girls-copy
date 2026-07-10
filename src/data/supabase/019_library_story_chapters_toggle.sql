-- AGA Phase 19 — Optional chapters for library stories.
-- When use_chapters is false, prose lives in `body` and `chapters` stays empty.
-- Run after 018_library_stories.sql.

alter table public.library_stories
  add column if not exists use_chapters boolean not null default true,
  add column if not exists body text not null default '';
