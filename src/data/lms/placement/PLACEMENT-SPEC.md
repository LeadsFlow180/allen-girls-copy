# AGA Placement Redesign Spec — "Signal Clarity Scan v2" (Canonical)

**Status: authoritative design spec.** Supersedes the 50-question fixed placement.
Owner-approved direction (2026-07-17). Build only what this document describes — nothing more (YAGNI).

Companion specs:
- `src/data/lms/curriculum/PROGRESSION-SPEC.md` — bands, mastery model, `student_skill_mastery`.
- `src/data/games/GAME-MASTER-SPEC.md` — how gameplay feeds the same mastery pipeline.
- Canon: `05_Education/Assessment.md`, `AGA-CUR-001_Master_Curriculum_Registry.md`.

---

## 1. Why we are changing it

The old placement asked **50 questions**. Two problems:

1. **Too long** — kids lose interest before the end, so the last answers are noisy anyway.
2. **It was built for a question we no longer ask.** The old goal was "is this child advanced
   enough to jump a grade?" We have since decided: **grade is fixed; we add challenge WITHIN
   the grade** (Emerging → On Track → Stretch per skill). So placement no longer needs to be a
   high-stakes, grade-deciding exam.

**The key realization:** we now have a mastery engine (`src/lib/lms/mastery/engine.ts`) that
adjusts every child's per-skill band automatically from real gameplay and missions. So placement's
only job is a **rough starting guess**. The system self-corrects within a few play sessions.

> Analogy: you don't need a perfect shoe measurement if the shoes re-fit themselves after a few
> days of walking. Placement just gets the child "close enough to start."

---

## 2. What placement must output (the whole point)

Placement produces a **starting band per cluster**, not a grade and not a per-skill score.

```text
For this student (grade already known):
  MATH-CALC  → on_track
  MATH-FRAC  → emerging
  MATH-GEO   → on_track
  ELA-LANG   → stretch
  ELA-READ   → on_track
```

Each cluster result seeds the `current_band` of that cluster's skills in
`student_skill_mastery` (see §7), written at **low confidence** (interaction_count reflects only
placement). Gameplay then refines it. Nothing about placement is permanent.

**Bands are per-cluster, never a single global label for the child** (PROGRESSION-SPEC §4).

---

## 3. The five clusters (one combined scan)

One assessment, ELA + Math together (owner decision). Five strands:

| Strand ID   | Covers | Seeds these skill families (per the student's grade) |
|-------------|--------|------------------------------------------------------|
| `MATH-CALC` | Multiplication/division, place value, +/− | M_.1 + M_.2 (e.g. `SK-M3-101..105`, `SK-M3-201..205`) |
| `MATH-FRAC` | Fractions (+ decimals in G5+) | M_.3 (e.g. `SK-M3-301..305`) |
| `MATH-GEO`  | Measurement, data, geometry | M_.4 + M_.5 (e.g. `SK-M3-401..405`, `SK-M3-501..505`) |
| `ELA-LANG`  | Grammar, vocabulary, figurative language | E_.4 (e.g. `SK-E3-401..405`) |
| `ELA-READ`  | Reading comprehension (lit + info) | E_.1 + E_.2 (e.g. `SK-E3-101..105`, `SK-E3-201..205`) |

The exact skill IDs come from `AGA-CUR-001_Master_Curriculum_Registry.md` for the student's grade
(3–6). The cluster→skill map lives in code as one lookup table; runtime picks the grade's row.

---

## 4. The adaptive model — "one branch deep" (deliberately simple)

**No IRT, no item-response theory, no complex adaptive engine (YAGNI).** Each strand uses a tiny
staircase:

### Math strands (`MATH-CALC`, `MATH-FRAC`, `MATH-GEO`)
1. Ask the **core** (On Track) question for the strand.
2. One adaptive follow-up:
   - Core **correct** → ask the **stretch** question. Right = `stretch`, wrong = `on_track`.
   - Core **wrong** → ask the **emerging** (easier) question. Right = `emerging`, wrong = `emerging` (with a note to start gently).

So each math strand is **2 questions** → a band. Three strands = **6 math questions**.

### `ELA-LANG`
1. Core grammar question, then core vocabulary question (2 core — language is broad).
2. If both correct → one **stretch** question (right = `stretch`).
   If one wrong → one **emerging** question (right = `on_track`, wrong = `emerging`).

**3 questions.**

### `ELA-READ` (natural difficulty staircase via passages)
Passages are already tiered: A (Gr 2–3) < B (Gr 3–4) < C (Gr 4–5) < D (Gr 5–6).
1. Start at **Passage B** question (grade-level anchor).
2. Correct → **Passage C** question. Correct again → `stretch`. Wrong at C → `on_track`.
3. Wrong at B → **Passage A** question. Right = `on_track`, wrong = `emerging`.

**2–3 questions** (one long passage read at a time; cap at 3).

### Totals
A child answers **~11–14 questions** (was 50). Target time **6–8 minutes**.
Pool of tagged questions needed: **~16–18** (drawn almost entirely from the existing 50).

---

## 5. Question metadata (small addition to the existing bank)

Add three optional fields to `PlacementItem` in `src/data/lms/placement/items.ts`. **Do not rewrite
the questions** — just tag the ones the scan uses:

```ts
type PlacementStrand = "MATH-CALC" | "MATH-FRAC" | "MATH-GEO" | "ELA-LANG" | "ELA-READ";
type PlacementBand = "emerging" | "core" | "stretch";

// added to PlacementItem:
strand?: PlacementStrand;   // which strand this item belongs to
band?: PlacementBand;       // difficulty role in the staircase
gradeBand?: number[];       // e.g. [2,3] for Passage A — informational, optional
```

Items without these fields are simply not used by the v2 scan (kept for reference / future pools).

### Gap to fill (small): "emerging" items
The current bank is really two levels (core `q1`/`q2` + `stretch`). It has few genuinely **easier**
questions for the "core wrong → ask emerging" branch. Action: author **one emerging item per math
strand** (3 total) and reuse Passage A as the emerging reading item. That's the only new content
this redesign requires. (YAGNI: three questions, not a new bank.)

---

## 6. Starter set — concrete item mapping (from the existing 50)

This is the v2 pool. IDs reference current `items.ts`; new items marked **(author)**.

**MATH-CALC** — core `math-no-g1-q1` · stretch `math-no-g1-stretch` · emerging **(author)** `math-calc-emerging`
**MATH-FRAC** — core `math-fd-g1-q1` · stretch `math-fd-g1-stretch` · emerging **(author)** `math-frac-emerging`
**MATH-GEO** — core `math-gd-g1-q1` · stretch `math-gd-g1-stretch` · emerging `math-geo-q1` (existing, easier)
**ELA-LANG** — core `ela-sc-g1-q1` (grammar) + `ela-sc-g2-q1` (vocab) · stretch `ela-sc-g3-stretch` · emerging `ela-sc-g3-q1`
**ELA-READ** — Passage B `ela-si-pB-q2` · Passage C `ela-si-pC-q1` · Passage D `ela-si-pD-q2` · Passage A `ela-si-pA-q1`

Everything else in the 50-item bank is retired from the live scan (kept in the file as an archive
for future question pools — not deleted).

---

## 7. Where the result lands (connects to what we already built)

```text
Scan finishes
   ↓
For each strand → resulting band
   ↓
Upsert student_skill_mastery rows for that strand's skill IDs:
   current_band = strand band, status = band, interaction_count = small (placement only)
   ↓
Mastery engine takes over from here (games + missions refine the band)
```

- Also keep writing the existing `placement_results` + `student_domain_tiers` rows so the current
  parent/teacher dashboards keep working during the transition.
- `student_skill_mastery` is created by **migration 024** (**applied** in Supabase).

---

## 8. Save & resume (owner requirement)

One assessment, but the child can stop and come back later.

- **Progress state:** answered item IDs + each strand's running result + current position.
- **Where:** localStorage for instant resume (guests) **and** a cloud row for signed-in students so
  it survives a device switch. Reuse the existing placement save path (`/api/placement/save`) with a
  `status: "in_progress" | "complete"` and a small `progress` JSON blob — **no new table** (YAGNI).
- **Resume UX:** on reopening the scan, "Welcome back, cadet — resuming your Signal Clarity Scan."
- Bands are only written to `student_skill_mastery` when `status` becomes `complete`.

---

## 9. Child-facing framing (Assessment.md rules)

- Called the **Signal Clarity Scan**, never "test." Terms: scan / mission energy / "needs more data"
  (never "wrong" or "score").
- **No-shame:** no red X shaming, no "you failed," no peer comparison, no visible band label. The
  child never sees "Emerging/Stretch." S.P.A.R.K. narrates neutrally ("Signal's a little fuzzy —
  got what I need, let's move on.").
- Attempt scaffolding from Assessment.md applies to *practice*, not the scan: the scan takes the
  first answer and moves on (it's a quick calibration, not a teaching moment).

---

## 10. YAGNI boundaries — what we deliberately do NOT build now

- ❌ No IRT / statistical adaptive engine — the one-branch staircase is enough.
- ❌ No per-skill placement for all 78 modules — cluster-level starting bands only.
- ❌ No separate ELA-day / Math-day split — one combined scan (owner decision).
- ❌ No new database table — reuse `placement_results` (+ `student_skill_mastery` from 024).
- ❌ No large new question bank — author exactly **3** emerging math items; reuse the rest.
- ❌ No grade-promotion logic — grade is fixed; Stretch is the enrichment path.
- ❌ No AI-generated placement questions — content bank only (PROGRESSION-SPEC §3).

---

## 11. Build order (when approved)

1. Add `strand` / `band` / `gradeBand` tags to the ~15 chosen items in `items.ts`.
2. Author the 3 emerging math items.
3. Add the cluster→skillIds lookup (per grade 3–6) in `src/data/lms/placement/`.
4. Build the staircase runner (pure function: answers in → per-strand bands out). No AI.
5. Wire finish → upsert `student_skill_mastery` (+ keep existing `placement_results` writes).
6. Save/resume via `/api/placement/save` with `status` + `progress`.
7. Update the scan UI copy/length; show a short 5-strand progress indicator, not "Q 1 of 50."

---

## 12. Owner-confirmed decisions (locked 2026-07-17)

1. **Grade source: the account profile.** The child's grade comes from their account/profile at scan
   time — no "what grade are you in?" prompt. The scan seeds the skill IDs for that grade (3–6).
2. **Reading load: 2–3 passage reads are OK.** `ELA-READ` may run up to 3 questions (cap at 3).
3. **Retake policy: guardian-triggered re-scan is allowed.** A parent/teacher can re-run the scan
   later. It is **not** child-initiated. Gameplay still does all the ongoing adjustment in between.

---

## 13. AI grading — the ONLY place AI touches assessment ("Nova Star report" masking)

This locks in the future written/spoken grading path so it is designed correctly from day one.
**Not built now** (YAGNI) — but every scaffold below assumes these rules.

- **What AI does:** for open-ended answers (a kid's typed paragraph, later a spoken answer), a model
  *reads the response and reports evidence* (e.g. "used 2 text details, on-topic, clear main idea")
  to the mastery engine. That's it.
- **What AI never does:** it never writes questions, never picks the next question, and **never sets
  the band.** Per PROGRESSION-SPEC §3: *"AI is never the mastery engine."* The mastery engine
  (`src/lib/lms/mastery/engine.ts`) still owns the band math; AI only supplies one input signal.
- **Latency masking (owner requirement, matches Curriculum Registry §6.2 "Front-End Quiet"):** the
  wait while the model reads the paper is hidden in-world. Framing: **S.P.A.R.K. transmits the
  child's report to Nova Star Command HQ and awaits a response.** The child keeps playing a short
  in-world beat (feeding hatchlings / aligning antennas), then a "transmission ping" delivers the
  feedback when the evaluation returns (<15s target). No "Grading… please wait" screen ever.
- **Scope of AI grading:** open-response items only. All multiple-choice content-bank questions are
  graded instantly server-side with no AI (see the content bank). Placement itself stays 100%
  multiple-choice / tap-to-answer, so **the v2 scan uses no AI at all.**
