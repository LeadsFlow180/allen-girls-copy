# Supabase setup (Phase 1 — accounts + placement save)

## 1. Create a project

1. Go to [supabase.com](https://supabase.com) and create a project.
2. In **Project Settings → API**, copy:
   - **Project URL**
   - **anon public** key

## 2. Add env vars

In the project root, copy `.env.example` to `.env.local` (if you have not already) and add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Restart `npm run dev` after saving.

## 3. Run the SQL

1. In Supabase: **SQL Editor → New query**.
2. Paste the full contents of `001_initial_schema.sql`.
3. Run it once. If you need to reset, drop the objects in reverse order (only in a dev project).

## 4. Auth URLs (local dev)

**Authentication → URL configuration**

- **Site URL:** `http://localhost:3000`
- **Redirect URLs:** add `http://localhost:3000/auth/callback`

For quick local testing you can turn **off** “Confirm email” under **Authentication → Providers → Email** so sign-up logs in immediately.

## 5. What this unlocks in the app

- `/account/signup` — student, parent, or teacher (role saved on the profile).
- `/account/login` — email + password (one login per person).
- **Guardian family flow (Phase 11):**
  - `/parent/children` — list linked learners.
  - `/parent/children/new` — guardian creates a **pre-verified** child account (requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`).
  - Self-enrolled students get an **approval code**; guardians enter it at `/account/approve-learner`.
  - Unverified students are redirected to `/account/pending-approval` and cannot use `/learn` or `/rewards` until approved.
  - Each child’s slides, quests, placement, wallet, and butterflies are stored under **their own** `auth.uid()` (parents read via dashboard APIs).
- Signed-in **students** who finish **Placement** also save a row in `placement_results` (localStorage still works for everyone).

## 5b. Phase 11 — Family profiles (run `014_parent_family_profiles.sql`)

After phase 1, run **`src/data/supabase/014_parent_family_profiles.sql`** once.

Adds `guardian_created` on `student_profiles` and RLS so parents can read/update linked children’s display names.

**Env:** add `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API → service_role) for `POST /api/parent/children` and `DELETE /api/parent/children/[userId]`.

**Remove a learner:** On `/parent/children`, use **Remove profile** on a child card. This deletes their auth account and all linked rows (playback `details`, quiz submissions, wallet, placement, missions, etc.). Guest-only rows from before sign-in are not removed automatically — they are orphaned UUIDs with no login.

## 5c. Phase 12 — Parent dashboard full history (run `015_parent_dashboard_read.sql`)

Run **`src/data/supabase/015_parent_dashboard_read.sql`** so guardians can read each child's slide playback, quizzes, and quest claims via RLS (the dashboard API also uses the service role when available).

`/parent/dashboard` now shows per child: slides, quizzes, quests claimed, missions/skills, streak, and checkpoints.

## 6. Phase 2 — curriculum routing (run `002_phase2_curriculum.sql`)

After `001_initial_schema.sql`, run **`src/data/supabase/002_phase2_curriculum.sql`** once in the SQL editor.

This adds:

- **`student_domain_tiers`** — ELA and Math tiers separately (from the Mission Ready scan).
- **`student_learning_path`** — recommended first world, focus domain, and next skill IDs from the global module graph.

Then when a student finishes placement while signed in, the app upserts these tables. **`/learn/path`** shows their personalized route. **`GET /api/student/learning-path`** returns the same data as JSON.

## 7. Phase 3 — S.P.A.R.K. runtime

No new SQL needed for this phase.

New app pieces:

- `src/lib/ai/spark.ts` — central S.P.A.R.K. engine with tone modes + safety fallback.
- `src/app/api/spark/message/route.ts` — reusable endpoint for guided S.P.A.R.K. messages.
- `src/lib/ai/boredom.ts` — starter boredom/engagement signal classifier.

Placement debrief and learning-path recap now use the shared S.P.A.R.K. engine instead of separate prompt logic.

## 8. Phase 4 — Gates + checkpoints (run `003_phase4_gates.sql`)

Run **`src/data/supabase/003_phase4_gates.sql`** after phases 1 and 2.

This adds:

- `mission_checkpoints` table for re-entry resume points.
- RLS for student self-access + linked parent read access.

New endpoints and UI:

- `POST /api/gates/evaluate` — crisis/discovery gate evaluation runtime.
- `GET/POST /api/mission/checkpoint` — save and read checkpoints.
- `/learn/gates` — demo page to run gate flow and create checkpoint rows.

## 9. Phase 5 — Rewards + Points Economy (run `004_phase5_rewards.sql`)

Run **`src/data/supabase/004_phase5_rewards.sql`** after phases 1–4.

This adds:

- `points_wallet` — one row per student, current balance + lifetime earned.
- `point_transactions` — full ledger of every earn and spend event.
- `reward_items` — catalogue of 16 items across 5 tiers (auto-seeded).
- `inventory` — items each student owns.
- `butterfly_sanctuary` — species earned per domain+tier milestone.
- `passport_stamps` — skill mastery record.

New endpoints and UI:

- `GET /api/rewards/points` — balance + recent transactions.
- `POST /api/rewards/points` — award points (server-to-server).
- `GET /api/rewards/store` — item catalogue with affordability flags.
- `POST /api/rewards/redeem` — spend points, add item to inventory.
- `GET /api/rewards/sanctuary` — butterfly collection + passport stamps.
- `/rewards` — full reward store with tier filters and buy buttons.
- `/rewards/sanctuary` — butterfly collection display.

Points are awarded automatically:
- Completing placement → 19 pts + butterfly species per domain.
- Passing a crisis gate → 13 pts.
- Passing a discovery gate → 19 pts.

## 10. Phase 6 — Parent & Teacher Dashboards (run `005_phase6_teacher_links.sql`)

Run **`src/data/supabase/005_phase6_teacher_links.sql`** after phases 1–5.

This adds:

- `teacher_profiles` — teacher invite code + classroom name (auto-created when a teacher signs up).
- `teacher_students` — links between teachers and their students.
- RPC `link_student_to_teacher(p_code)` — teacher enters a student's approval code to link them.
- Additional RLS policies so teachers can read tiers, learning paths, and wallets for their linked students.
- Additional RLS policies so parents can read learning paths and wallets for their linked children.

New endpoints:

- `GET /api/parent/dashboard` — full child data (placement, tiers, path, points, butterflies, activity).
- `GET /api/teacher/dashboard` — classroom summary with per-student tier breakdown and class averages.
- `POST /api/teacher/link-student` — teacher adds a student by code.

New pages:

- `/parent/dashboard` — rich parent dashboard showing each child's skills, points, path, and recent activity.
- `/teacher/dashboard` — classroom view with a sortable student table and class-wide stats.
- `/teacher/link-student` — simple form to add a student by their approval code.

## 11. Phase 7 — Adventure Worlds + Game Layer (run `006_phase7_missions.sql`)

Run **`src/data/supabase/006_phase7_missions.sql`** after phases 1–6.

This adds:

- `skill_completions` — one row per skill a student passes (with attempts, score, points).
- `module_completions` — one row per full module completion per world.
- `daily_streaks` — tracks current + longest streak per student.

New mission content and APIs:

- `src/data/lms/mission-content.ts` — all 5 Module 1 skill steps with questions, multiple-choice options, and world-skinned variants for 7 worlds.
- `POST /api/mission/complete` — saves skill pass, awards points, handles streak, marks module done.
- `GET /api/mission/streak` — returns current streak + module completion count (for dashboard HUD).

New pages:

- `/learn/module/[moduleId]?world=[slug]` — full mission runner: S.P.A.R.K. briefing, passages, MC + open-response questions, gate evaluation, points display, and a mission complete screen.
- Learn dashboard HUD now shows live points, streak, and module count for signed-in students.

## 12. Phase 8 + 9 — Language Courses + Curriculum

1. Run **`src/data/supabase/007_phase8_language_courses.sql`** to create and seed:
   - `learning_languages`
   - `language_courses`

2. Run **`src/data/supabase/008_phase9_language_curriculum.sql`** to create curriculum tables:
   - `learning_sections`
   - `learning_units`
   - `learning_steps`
   - `learning_questions`
   - `learning_question_options`

3. Seed real starter curriculum content (8 sections x 10 units x 5 steps):

```bash
# Use service role key for write permissions during seeding
NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed:curriculum
```

Optional overrides:
- `SEED_LANGUAGE_CODE` (default `es`)
- `SEED_COURSE_TITLE` (default `Spanish`)

Examples for other languages:

```bash
# French
SEED_LANGUAGE_CODE=fr SEED_COURSE_TITLE=French npm run seed:curriculum

# Arabic
SEED_LANGUAGE_CODE=ar SEED_COURSE_TITLE=Arabic npm run seed:curriculum

# Urdu
SEED_LANGUAGE_CODE=ur SEED_COURSE_TITLE=Urdu npm run seed:curriculum

# German
SEED_LANGUAGE_CODE=de SEED_COURSE_TITLE=German npm run seed:curriculum

# Italian
SEED_LANGUAGE_CODE=it SEED_COURSE_TITLE=Italian npm run seed:curriculum

# Portuguese
SEED_LANGUAGE_CODE=pt SEED_COURSE_TITLE=Portuguese npm run seed:curriculum
```

## 13. Phase 10 — Curriculum Review Workflow + Curated Pack

1. Run **`src/data/supabase/009_phase10_curriculum_review_workflow.sql`** to add content governance metadata to `learning_questions`:
   - `content_source`
   - `quality_status` (`draft`, `reviewed`, `approved`, `rejected`)
   - `review_notes`
   - `reviewed_by`
   - `reviewed_at`

2. Seed a higher-quality Section 1 Spanish starter pack:

```bash
NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed:curriculum:curated:section1
```

This command refreshes Section 1 content in-place and tags inserted questions with:
- `content_source = curated.section1.v1`
- `quality_status = reviewed`

## 14. Learn daily quests (optional cloud sync)

**Not required to use quests.** Progress and claims are stored in the browser (`learn.questDayStore`, `learn.localWallet`) and wired to `/api/learn/playback-progress` + achievements stats.

Run **`src/data/supabase/013_learn_daily_quests.sql`** only when you want quest claim state synced across devices for guests or signed-in learners.

