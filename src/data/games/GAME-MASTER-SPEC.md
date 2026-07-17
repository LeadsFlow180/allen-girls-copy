# AGA Game Master Spec (Canonical)

**Status: authoritative.** Every game on the Game Zone page — current, wrapped, or future —
must follow this document. It defines how games score, how they ask academic questions,
how points work, and how performance data flows to the parent and teacher dashboards.

Companion spec: `src/data/lms/curriculum/PROGRESSION-SPEC.md` (mastery model, bands,
skill IDs). This doc does not repeat that model; it plugs games INTO it.

---

## 1. The two classes of games

Every game in the catalog is exactly one of these. This is the first field a developer
checks and the first thing the platform needs to know.

| | `academic` | `arcade` |
|---|---|---|
| Purpose | Practice a real curriculum skill inside play | Pure fun / brain break |
| Asks curriculum questions | **Yes** (required) | No |
| Earns store-redeemable points (points wallet) | **Yes** — from answering questions | **No** |
| In-game coins | Optional, and they convert to nothing | Yes — "fun coins," score only, reset per session, never enter the wallet or store |
| Writes performance data for dashboards | **Yes** (sessions + question attempts) | Sessions only (playtime, for screen-time visibility) |
| Needs a `skill_ids` list in the catalog | **Yes** | No |

**Rule: coins in an `arcade` game are decoration.** They may show a score, unlock a hat
inside that game, whatever — but they never touch `points_wallet`, never appear in the
store, and never affect mastery. This is how we keep "playing a lot" from ever looking
like "learning a lot."

---

## 2. Catalog contract (every game registers here)

`src/data/games/catalog.ts` is the single registry. Each entry must carry:

```ts
type GameClass = "academic" | "arcade";
type IntegrationMode = "overlay" | "native"; // see §3
type WrongAnswerPolicy = "soft" | "gate";    // see §4

type GameCatalogEntry = {
  slug: string;                 // stable ID, used in all data rows
  title: string;
  gameClass: GameClass;
  integration: IntegrationMode; // academic games only
  wrongAnswerPolicy: WrongAnswerPolicy; // academic games only; per-game choice
  /** Curriculum skills this game practices (PROGRESSION-SPEC skill IDs, e.g. "SK-M3-101"). */
  skillIds: string[];           // required non-empty for academic; [] for arcade
  gradeLevels: number[];        // e.g. [3, 4]
  subjects: Array<"ela" | "math">;
  /** How often the game surfaces a question (academic only). */
  questionCadence: {
    kind: "per_checkpoint" | "per_minutes" | "per_level";
    value: number;              // e.g. every 1 checkpoint, every 3 minutes, every 1 level
  };
  embedUrl?: string;            // for iframe/Unity games
};
```

The Game Zone page shows the class visually (e.g. an "Academic" badge with the subject,
vs a plain "Arcade" badge) so kids, parents, and teachers can tell them apart at a glance.

---

## 3. Two integration modes (how questions get into a game)

We support **both**, so any game can join the pipeline regardless of how it was built.

### Mode A — `overlay` (universal, works with ANY game)
The platform owns the questions. The game is paused (iframe covered) at the cadence set
in the catalog, and the standard **Question Overlay** appears on top:

1. Overlay asks the mastery engine for the next question: student → grade → skill
   (from the game's `skillIds`) → current band (Emerging / On Track / Stretch) → pull
   from the **content bank** (never AI-generated live — per PROGRESSION-SPEC).
2. Student answers (attempt levels + hints exactly as PROGRESSION-SPEC defines).
3. Overlay records the attempt (see §6), awards points (see §5), shows S.P.A.R.K.'s
   one-line feedback, and resumes the game.

Use this for wrapped third-party/Unity games and as the default for anything new.

### Mode B — `native` (custom-built games)
The question moment happens inside the game world (answer to raise the bridge). The game
still must NOT invent questions or scoring. It talks to the platform through the
**Game Bridge** postMessage API and the platform serves the same content-bank questions:

```text
game  → platform : { type: "aga:ready" }
game  → platform : { type: "aga:request_question" }
platform → game  : { type: "aga:question", payload: { id, prompt, choices[], ... } }
game  → platform : { type: "aga:answer", payload: { questionId, choiceIndex, attempt, hintLevel } }
platform → game  : { type: "aga:result", payload: { correct, pointsAwarded, sparkLine } }
game  → platform : { type: "aga:checkpoint" | "aga:level_complete" | "aga:session_heartbeat" }
```

Key rule for both modes: **the game never grades and never awards points.** The platform
(server) does. Games are the stage; the mastery engine is the judge.

---

## 4. Wrong-answer policy (per game)

Each academic game declares one policy in the catalog:

- **`soft`** — play continues either way. Correct = full points + power-up moment.
  Wrong = no points, gentle S.P.A.R.K. hint, the game goes on. (Default; fits the
  no-punishment philosophy. Use for fast games like runners.)
- **`gate`** — the moment blocks until answered correctly, with the standard 3-attempt
  hint ladder from PROGRESSION-SPEC (independent → light hint → strong scaffold). The
  student is never stuck forever: after attempt 3 the answer is shown/taught and play
  resumes. (Use for puzzle/adventure games where a pause feels natural.)

Either way, every attempt is recorded with its attempt number and hint level — that is
what feeds the Independence score in the Mastery Confidence model.

---

## 5. Points math (one wallet, academics only)

- Game questions pay into the **same** `points_wallet` used by missions and gates,
  through the same server engine (`src/lib/rewards/points-engine.ts`) with new event
  types: `game_question_correct`, `game_session_complete`.
- **Rate: games pay less than missions** so games supplement lessons, never replace them.
  Mission rates are easy 13 / medium 19 / hard 25. Game rates:

| Band of the question | Correct on attempt 1 | Correct after hint | Correct after scaffold |
|---|---|---|---|
| Emerging | 8 | 5 | 3 |
| On Track | 12 | 8 | 4 |
| Stretch | 16 | 10 | 5 |

- Small completion bonus: +5 for finishing a game session that included ≥ 3 answered
  questions (encourages finishing, not grinding).
- Daily cap: game-sourced points count toward the wallet up to **60 points/day**;
  past the cap, questions still record mastery evidence but pay 0 (anti-farming).
- **Playtime pays nothing. Arcade fun-coins pay nothing.** Only academics pay.
- All awards happen server-side after validating the attempt row — the client (game)
  can never mint points.

---

## 6. Performance data pipeline (games → dashboards)

Games write into the SAME mastery pipeline PROGRESSION-SPEC defines, plus one
game-specific table. Nothing bypasses it.

```text
Question answered in game
        ↓
skill_attempts row (source = "game", game_slug, mission-equivalent context)
        ↓
student_skill_mastery recalculated (accuracy / independence / consistency / retention)
        ↓
points engine (wallet + transaction row)
        ↓
Parent & teacher dashboards read the same tables they already read
```

Because game attempts land in `skill_attempts` with `source = 'game'`, dashboards can
show both the blended mastery picture AND a games-only view ("12 questions answered in
Skid Runner this week, 83% correct, mostly independent").

---

## 7. Database plan (migration `024_game_engine.sql`)

Builds the two tables PROGRESSION-SPEC already calls for (they don't exist yet) plus a
game session table. Sketch — exact SQL written at build time:

```sql
-- 7.1 Every scored interaction, from ANY source (games, missions, gateways, reviews)
create table skill_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles(id),
  skill_id text not null,                  -- e.g. 'SK-M3-101'
  question_id text not null,               -- content-bank ID
  question_band text not null,             -- emerging | on_track | stretch
  correct boolean not null,
  attempt_number smallint not null,        -- 1..3
  hint_level smallint not null default 0,  -- 0 none, 1 light, 2 scaffold
  response_ms integer,
  question_type text,                      -- calculation | word_problem | reasoning | ...
  source text not null,                    -- 'game' | 'mission' | 'gateway' | 'review'
  game_slug text,                          -- set when source = 'game'
  created_at timestamptz not null default now()
);

-- 7.2 Rolling mastery state per student per skill (PROGRESSION-SPEC §13)
create table student_skill_mastery (
  student_id uuid not null references profiles(id),
  skill_id text not null,
  current_band text not null default 'emerging',
  status text not null default 'not_started',
  mastery_score numeric(5,2) not null default 0,
  accuracy_score numeric(5,2) not null default 0,
  independence_score numeric(5,2) not null default 0,
  consistency_score numeric(5,2) not null default 0,
  retention_score numeric(5,2) not null default 0,
  interaction_count integer not null default 0,
  last_practiced_at timestamptz,
  next_review_at timestamptz,
  primary key (student_id, skill_id)
);

-- 7.3 Game sessions (both classes; arcade rows have zero question columns filled)
create table game_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles(id),
  game_slug text not null,
  game_class text not null,                -- 'academic' | 'arcade'
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer,
  questions_asked smallint not null default 0,
  questions_correct smallint not null default 0,
  points_awarded integer not null default 0,
  fun_coins integer not null default 0     -- arcade decoration; never converts
);
```

RLS mirrors existing tables: students write their own rows via server routes; parents
and linked teachers read their children's rows (same policy patterns as
`skill_completions`).

New API routes: `POST /api/games/session/start`, `POST /api/games/attempt`,
`POST /api/games/session/complete` (server validates, records, awards).

---

## 8. Dashboard additions (parent + teacher)

- New "Games" card: per game — time played, questions asked/correct, points earned,
  strongest and weakest skill touched.
- Arcade games appear only as playtime (screen-time honesty for parents).
- Teacher dashboard gets the same per-skill view so game evidence supports (never
  replaces) mission evidence in mastery.

---

## 9. Rules for adding or swapping ANY future game (checklist)

1. Register it in `catalog.ts` with class, mode, policy, `skillIds`, cadence.
2. `academic` games: verify each `skillId` exists in the curriculum registry.
3. Never author questions inside the game — content bank only.
4. Never grade or award points client-side — server routes only.
5. `arcade` games: confirm no path from fun-coins to wallet/store.
6. Ship with at least Emerging/On Track/Stretch question pools available for its skills.
7. Test the parent dashboard shows the session after one play.

---

## 10. What exists today vs what this spec adds

| Piece | Today | This spec |
|---|---|---|
| Game Zone games | Entertainment only, no data | Classified `academic`/`arcade`, wired to pipeline |
| Points wallet | Missions/gates/placement only | + game question events (lower rates, daily cap) |
| `skill_attempts` / `student_skill_mastery` | Designed in PROGRESSION-SPEC, not built | Built in migration 024; games are first writers |
| Dashboards | No game visibility | Games card + per-skill game evidence |
