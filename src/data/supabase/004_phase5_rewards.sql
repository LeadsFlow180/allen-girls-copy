-- AGA Phase 5 — Rewards + Points Economy.
-- Run after 001, 002, 003.
-- Supabase SQL Editor → paste full contents → Run.

-- ── Points wallet (one row per student) ─────────────────────────────────
create table if not exists public.points_wallet (
  student_user_id uuid primary key references public.profiles (id) on delete cascade,
  balance int not null default 0 check (balance >= 0),
  lifetime_earned int not null default 0,
  updated_at timestamptz not null default now()
);

-- ── Individual point transactions (full ledger) ──────────────────────────
create table if not exists public.point_transactions (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references public.profiles (id) on delete cascade,
  amount int not null,            -- positive = earn, negative = spend
  event_type text not null,       -- 'gate_pass','first_time','daily_login','streak','clean_run','redeem', etc.
  reference_id text,              -- mission_id, item_id, etc.
  created_at timestamptz not null default now()
);

create index if not exists pt_student_created_idx
  on public.point_transactions (student_user_id, created_at desc);

-- ── Reward item catalogue (seeded below) ────────────────────────────────
create table if not exists public.reward_items (
  id text primary key,            -- e.g. 'color_palette_sunset'
  label text not null,
  description text not null default '',
  category text not null check (category in ('cosmetic','collection','story','exploration','special')),
  tier int not null check (tier between 1 and 5),
  price int not null check (price > 0),
  purchasable bool not null default true,
  created_at timestamptz not null default now()
);

-- ── Player inventory (items owned) ──────────────────────────────────────
create table if not exists public.inventory (
  student_user_id uuid not null references public.profiles (id) on delete cascade,
  item_id text not null references public.reward_items (id) on delete cascade,
  acquired_at timestamptz not null default now(),
  primary key (student_user_id, item_id)
);

-- ── Butterfly sanctuary (one species per mastered skill/domain) ──────────
create table if not exists public.butterfly_sanctuary (
  student_user_id uuid not null references public.profiles (id) on delete cascade,
  species_key text not null,       -- e.g. 'ela_on_track', 'math_stretch'
  label text not null,
  earned_at timestamptz not null default now(),
  primary key (student_user_id, species_key)
);

-- ── Skill passport stamps ────────────────────────────────────────────────
create table if not exists public.passport_stamps (
  student_user_id uuid not null references public.profiles (id) on delete cascade,
  skill_id text not null,
  domain text not null,
  tier text not null,
  earned_at timestamptz not null default now(),
  primary key (student_user_id, skill_id)
);

-- ── RLS ──────────────────────────────────────────────────────────────────
alter table public.points_wallet enable row level security;
alter table public.point_transactions enable row level security;
alter table public.reward_items enable row level security;
alter table public.inventory enable row level security;
alter table public.butterfly_sanctuary enable row level security;
alter table public.passport_stamps enable row level security;

-- Wallet
drop policy if exists "wallet_select_own" on public.points_wallet;
create policy "wallet_select_own"
  on public.points_wallet for select using (auth.uid() = student_user_id);
drop policy if exists "wallet_insert_own" on public.points_wallet;
create policy "wallet_insert_own"
  on public.points_wallet for insert
  with check (auth.uid() = student_user_id and exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'student'));
drop policy if exists "wallet_update_own" on public.points_wallet;
create policy "wallet_update_own"
  on public.points_wallet for update using (auth.uid() = student_user_id);

-- Transactions
drop policy if exists "pt_select_own" on public.point_transactions;
create policy "pt_select_own"
  on public.point_transactions for select using (auth.uid() = student_user_id);
drop policy if exists "pt_insert_own" on public.point_transactions;
create policy "pt_insert_own"
  on public.point_transactions for insert
  with check (auth.uid() = student_user_id and exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'student'));

-- Reward items: anyone can read
drop policy if exists "reward_items_select_all" on public.reward_items;
create policy "reward_items_select_all"
  on public.reward_items for select using (true);

-- Inventory
drop policy if exists "inventory_select_own" on public.inventory;
create policy "inventory_select_own"
  on public.inventory for select using (auth.uid() = student_user_id);
drop policy if exists "inventory_insert_own" on public.inventory;
create policy "inventory_insert_own"
  on public.inventory for insert
  with check (auth.uid() = student_user_id and exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'student'));

-- Butterfly
drop policy if exists "butterfly_select_own" on public.butterfly_sanctuary;
create policy "butterfly_select_own"
  on public.butterfly_sanctuary for select using (auth.uid() = student_user_id);
drop policy if exists "butterfly_insert_own" on public.butterfly_sanctuary;
create policy "butterfly_insert_own"
  on public.butterfly_sanctuary for insert
  with check (auth.uid() = student_user_id and exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'student'));

-- Parent read access for sanctuary + stamps
drop policy if exists "butterfly_select_parent" on public.butterfly_sanctuary;
create policy "butterfly_select_parent"
  on public.butterfly_sanctuary for select using (
    exists (select 1 from public.student_profiles sp
      where sp.user_id = butterfly_sanctuary.student_user_id
        and sp.parent_user_id = auth.uid()
        and sp.parent_approved_at is not null));

-- Passport
drop policy if exists "passport_select_own" on public.passport_stamps;
create policy "passport_select_own"
  on public.passport_stamps for select using (auth.uid() = student_user_id);
drop policy if exists "passport_insert_own" on public.passport_stamps;
create policy "passport_insert_own"
  on public.passport_stamps for insert
  with check (auth.uid() = student_user_id and exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'student'));
drop policy if exists "passport_select_parent" on public.passport_stamps;
create policy "passport_select_parent"
  on public.passport_stamps for select using (
    exists (select 1 from public.student_profiles sp
      where sp.user_id = passport_stamps.student_user_id
        and sp.parent_user_id = auth.uid()
        and sp.parent_approved_at is not null));

-- ── Seed reward catalogue ────────────────────────────────────────────────
-- Tier 1: 50–120 pts
insert into public.reward_items (id, label, description, category, tier, price) values
  ('palette_sunset',    'Sunset Palette',       'Warm orange + pink color theme.',            'cosmetic',    1, 60),
  ('palette_ocean',     'Ocean Palette',         'Deep blue + teal color theme.',              'cosmetic',    1, 60),
  ('frame_stars',       'Star Frame',            'Shimmering star avatar frame.',              'cosmetic',    1, 75),
  ('card_fossil',       'Fossil Card',           'Collectible fossil discovery card.',         'collection',  1, 90),
  ('spark_idle_dance',  'S.P.A.R.K. Dance',      'S.P.A.R.K. idle animation: robot dance.',   'special',     1, 110)
on conflict (id) do nothing;

-- Tier 2: 150–300 pts
insert into public.reward_items (id, label, description, category, tier, price) values
  ('outfit_explorer',   'Explorer Outfit',       'Adventure gear for your avatar.',            'cosmetic',    2, 175),
  ('outfit_scientist',  'Lab Coat',              'Science lab outfit for your avatar.',        'cosmetic',    2, 175),
  ('story_chapter_1',   'Story: Chapter 1',      'Unlock the first hidden story chapter.',     'story',       2, 200),
  ('card_set_ocean',    'Ocean Card Set',        'Set of 3 ocean exploration cards.',          'collection',  2, 250)
on conflict (id) do nothing;

-- Tier 3: 400–800 pts
insert into public.reward_items (id, label, description, category, tier, price) values
  ('outfit_mission',    'Mission Commander',     'Elite mission commander outfit.',            'cosmetic',    3, 450),
  ('spark_fx_lightning','S.P.A.R.K. Lightning',  'S.P.A.R.K. lightning effect animation.',    'special',     3, 500),
  ('card_set_dino',     'Dino Card Set',         'Rare dinosaur era collectible set.',         'collection',  3, 600)
on conflict (id) do nothing;

-- Tier 4: 600–1200 pts (exploration)
insert into public.reward_items (id, label, description, category, tier, price) values
  ('zone_secret_lab',   'Secret Lab Zone',       'Unlock the hidden lab area.',                'exploration', 4, 700),
  ('zone_bonus_cave',   'Bonus Cave',            'Bonus challenge cave zone.',                 'exploration', 4, 900),
  ('lore_deep_1',       'Deep Lore Vol. 1',      'Hidden background story of the sisters.',    'story',       4, 1000)
on conflict (id) do nothing;

-- Tier 5: 1500–3000 pts (legendary)
insert into public.reward_items (id, label, description, category, tier, price) values
  ('story_arc_origins', 'Origins Story Arc',     'Full secret origin story — all chapters.',   'story',       5, 1500),
  ('sanctuary_habitat', 'Sanctuary Habitat',     'New garden habitat for your butterflies.',   'exploration', 5, 2000),
  ('explorer_mode',     'Explorer Mode',         'Unlock alternate discovery-first mission paths.','exploration',5,2500)
on conflict (id) do nothing;
