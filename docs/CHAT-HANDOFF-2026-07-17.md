# Chat Handoff — July 17, 2026

Read this first in a new chat. It summarizes what was done today, where everything
lives, and what to do next. The owner is a non-programmer; the AI agent leads all
coding work with the owner's design/functionality input.

---

## 1. Git / GitHub — repo is now live and pushed

- The local folder was a ZIP download with no git history. It was initialized,
  connected to **https://github.com/LeadsFlow180/allen-girls-copy.git**, and the
  work was stacked on top of the existing remote history (no force-push).
- Commit `85c4720` pushed 223 files: cadet intro video flow, placement
  command-deck redesign, PROGRESSION-SPEC.md, student ID work, and more.
- Commit identity used (git had none configured): `LeadsFlow180
  <LeadsFlow180@users.noreply.github.com>`. Set a real name/email if preferred.
- Pushes from this machine sometimes drop mid-transfer. Fix that worked:
  `git -c http.postBuffer=524288000 -c http.version=HTTP/1.1 push`.

## 2. Environment file — `.env.local` (gitignored, machine-only)

- One clean `.env.local` exists at the repo root with every env var the app reads,
  grouped in 5 sections with "get key here" links. Duplicate keys were removed.
- FILLED: OpenAI, Gemini, Supabase URL + anon key + service-role key,
  OpenMAIC (localhost dev values), AI School redirect (localhost dev values),
  and the cadet intro video URL.
- BLANK: `ANTHROPIC_API_KEY` (Claude features off until added).
- Security note: the OpenAI/Gemini/Supabase service-role keys were pasted into a
  chat once; rotating them in each dashboard someday is a reasonable precaution.
- Remember: when deploying (e.g. Vercel), these same env vars must be added to the
  host — `.env.local` never leaves this machine.

## 3. Cadet intro video — hosted on Supabase Storage (done)

- Original file: 104 MB (over Supabase free-tier 50 MB file limit). Compressed with
  ffmpeg to **30.6 MB** (same 1450×1080, H.264, faststart) at
  `public/videos/aga-cadet-intro-2026-web.mp4` (gitignored).
- Uploaded to a new **public `videos` bucket** in the Supabase project. Live URL
  (verified HTTP 200):
  `https://zfaxurgxtvigfiavsdiw.supabase.co/storage/v1/object/public/videos/aga-cadet-intro-2026.mp4`
- `NEXT_PUBLIC_CADET_INTRO_VIDEO_URL` in `.env.local` points to that URL, so the
  app streams from Supabase instead of the local file
  (`src/lib/media/cdn-video.ts` → `getCadetIntroVideoSrc()`).

## 4. First-time cadet flow (built in a prior session, verified today)

- `/worlds` galaxy map: first globe click → intro video (`CadetIntroOverlay`) →
  fade to black → placement assessment ("Signal Clarity Scan") → world.
- Progress tracked in localStorage via `src/lib/onboarding/cadet-progress.ts`;
  checkmark pills ("Intro video", "Signal Clarity Scan") show on `/worlds`.
- NEW today: a **"↻ Replay intro (dev)"** button on `/worlds`
  (`src/app/worlds/page.tsx`) — dev-mode only, clears both flags and reloads so the
  first-time flow can be re-tested. Never shows in production.
- Dev server: `npm run dev` → http://localhost:3000. If it acts up: kill node
  processes, delete `.next/dev/lock`, restart.

## 5. Game Master Spec — NEW canonical document

**`src/data/games/GAME-MASTER-SPEC.md`** — every game must follow it. Written after
a codebase audit found the Game Zone completely disconnected from points, academics,
and dashboards. Owner's decisions baked in:

- **Two game classes**: `academic` (asks curriculum questions, earns real
  store-redeemable points) vs `arcade` (pure fun; "fun coins" allowed but they NEVER
  convert to the wallet, store, or mastery data). Catalog badge distinguishes them.
- **Both integration modes**: universal question **overlay** (works over any
  iframe/Unity game) + **native** Game Bridge postMessage API for custom games.
  Games never grade or award points client-side — the server does.
- **Wrong-answer policy is per game**: `soft` (play continues, S.P.A.R.K. hint) or
  `gate` (3-attempt hint ladder, then teach and resume).
- **Mixed fleet**: some current arcade games get wrapped, others replaced; the spec
  covers both, with a checklist (spec §9) for every future game.
- **Points**: one shared wallet; game questions pay less than missions
  (8–16 by band/attempt vs mission 13/19/25); 60 pts/day cap from games;
  playtime and fun-coins pay zero.
- **Data pipeline**: game answers → `skill_attempts` (source='game') →
  `student_skill_mastery` recalc → points engine → the same tables the parent and
  teacher dashboards already read. Includes DB plan (spec §7) for migration
  `024_game_engine.sql`: `skill_attempts`, `student_skill_mastery`, `game_sessions`
  + routes `POST /api/games/session/start|attempt|session/complete`.

Companion doc: `src/data/lms/curriculum/PROGRESSION-SPEC.md` (mastery model: bands
Emerging/On Track/Stretch/Mastered, Mastery Confidence Score 45/25/20/10, content
bank not live AI, per-skill mastery, gateway challenges). The two tables it needs
do NOT exist in Supabase yet — migration 024 is the next build.

## 6. Current codebase state (from today's audit)

- Game Zone (`/games`): 5 Unity iframe games + 2 color labs, entertainment only,
  no data written anywhere yet.
- Points engine works (Supabase `points_wallet` + `point_transactions`) but only
  missions/gates/placement pay into it.
- Parent dashboard reads 14+ tables; teacher dashboard is thinner; neither sees
  games yet.
- Supabase migrations exist through `023_student_numbers.sql`.

## 7. Next steps (in recommended order)

1. **Build migration `024_game_engine.sql`** (tables in spec §7) + RLS policies.
2. **Build the 3 `/api/games/*` routes** (server-side validation + points award).
3. **Build the Question Overlay component** and wrap ONE existing game
   (Skid Runner suggested) as the working example.
4. **Add the "Games" card** to parent + teacher dashboards.
5. Author starter content-bank question pools (Grade 3 multiplication is the teed-up
   pilot slice per PROGRESSION-SPEC) with Emerging/On Track/Stretch variants.
6. Tag every game in `src/data/games/catalog.ts` with the new fields from spec §2.
7. When deploying: add all `.env.local` vars to the host; the intro video URL is
   already production-ready on Supabase.
8. Commit + push today's uncommitted work (replay button, game spec, this handoff).

## 8. Standing owner preferences (apply to all future work)

- Agent leads and executes; never tell the owner to do coding tasks alone.
- Simple, jargon-free explanations; be terse; give the answer first.
- All content inside `src/` where applicable; never overwrite existing code without
  asking; never commit secrets; big videos live on CDN/storage, never in git.
- "Trinket" is banned platform-wide — always "The Astral Realm Stone".
- No-punishment learning philosophy: difficulty bands are hidden from kids;
  wrong answers teach, never shame.
