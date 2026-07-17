-- Permanent sequential student IDs.
-- Existing students are numbered oldest-first. New students receive the next
-- number atomically from Postgres, so simultaneous signups cannot collide.

create sequence if not exists public.student_number_seq
  as bigint
  start with 1
  increment by 1
  minvalue 1
  no cycle;

alter table public.student_profiles
  add column if not exists student_number bigint;

with numbered as (
  select
    user_id,
    row_number() over (order by created_at asc, user_id asc) as number
  from public.student_profiles
)
update public.student_profiles as student
set student_number = numbered.number
from numbered
where student.user_id = numbered.user_id
  and student.student_number is null;

do $$
declare
  highest_number bigint;
begin
  select max(student_number)
  into highest_number
  from public.student_profiles;

  if highest_number is null then
    perform setval('public.student_number_seq', 1, false);
  else
    perform setval('public.student_number_seq', highest_number, true);
  end if;
end;
$$;

alter table public.student_profiles
  alter column student_number
  set default nextval('public.student_number_seq');

alter table public.student_profiles
  alter column student_number set not null;

create unique index if not exists student_profiles_student_number_uq
  on public.student_profiles (student_number);

create or replace function public.prevent_student_number_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.student_number is distinct from new.student_number then
    raise exception 'Student numbers cannot be changed';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_student_number_change
  on public.student_profiles;

create trigger prevent_student_number_change
before update of student_number on public.student_profiles
for each row
execute function public.prevent_student_number_change();

