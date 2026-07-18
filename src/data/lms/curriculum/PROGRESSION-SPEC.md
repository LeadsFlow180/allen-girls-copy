# AGA Progression, Mastery & Content Spec (Canonical)

Status: **AUTHORITATIVE** design spec. Owner-authored. Game/progression logic must
follow this document. Where older notes describe a "10 modules per grade" progression
or global single-band labels, **this spec supersedes them.**

Last updated: 2026-07-16

---

## 0. Why this exists

AGA is a **supplementary / reinforcement** platform, not a grade-replacement school.
So the guiding rule is:

> **Grade determines the standard. Placement determines the depth of the challenge.**

We do **not** auto-promote an advanced 3rd grader into 4th-grade content just because
they mastered 3rd-grade skills. That would create a hidden curriculum jump — a child
can be mathematically strong but never have been *taught* the next concept. Instead we
increase **cognitive complexity within the current grade standard.**

---

## 1. The three bands (content variants inside one grade)

Within each grade, every skill has three versions of the **same** standard:

| Band         | Purpose              | What changes                                                     |
| ------------ | -------------------- | --------------------------------------------------------------- |
| **Emerging** | Support / access     | Smaller numbers, simpler text, fewer steps, visual models, hints |
| **On Track** | Grade-level practice | Standard grade-level complexity                                  |
| **Stretch**  | Deeper application   | More reasoning, multiple steps, less scaffolding, richer problems |

**Critical:** *Stretch is NOT "next grade."* It is **greater cognitive complexity within
the current grade standard.**

### Example — Grade 3 multiplication

- **Emerging:** "Natalia has 4 bags with 3 crystals in each. How many crystals?" (array/visual, answer choices)
- **On Track:** "The girls collect 7 crystal containers. Each holds 8 crystals. How many crystals?"
- **Stretch:** "The girls need 56 crystals to power a portal. They have 5 containers with 8 crystals each. How many more do they need?" (choose operation → multiply → interpret → subtract → understand context)
- **Stretch+ (reasoning):** "Maya says 6 groups of 7 is greater than 8 groups of 5. Is she correct? Explain how you know."

### Difficulty levers (all stay inside the grade standard)

- number size within the grade standard
- number of steps
- known vs. unknown placement
- irrelevant information
- representation: equation → table → diagram → word problem
- explaining or comparing strategies
- error analysis
- finding multiple solutions
- applying a concept in an unfamiliar situation

---

## 2. Separate academic difficulty from world selection

The **world = story/game environment.** The **band = content variant inside the mission.**

```text
Student
   ↓
Grade 3
   ↓
Skill: Multiplication
   ↓
Mission: Restore the Crystal Generator
   ↓
Difficulty Variant
   ├── Emerging
   ├── On Track
   └── Stretch
```

Three children can stand in the **exact same room**, see the same characters, fight the
same enemy, repair the same generator, and earn the same story progression. **Only the
question payload changes.**

> ⚠️ Current-code gap: today `pickRecommendedWorld(tier, name)` in
> `src/data/lms/mission-engine.ts` derives the *world* from the placement tier — world and
> difficulty are the same knob. This spec splits them: world = presentation, band = content.

Build **one Grade curriculum + three pre-authored challenge variants per skill** — NOT three
separate curricula per grade. Reusable assets (world, characters, animation, story, game
mechanics, S.P.A.R.K. dialogue, Crisis/Discovery Gates) stay shared; only the educational
payload branches.

> **4 grade curricula × 3 difficulty treatments — NOT 12 separate curricula.**
> More precisely: 4 curricula, each skill containing Support/Core/Stretch task pools.

---

## 3. Content bank, NOT live AI question generation

Do **not** have generative AI creating questions while the child plays. Reasons:

1. Loss of precise curriculum control.
2. Inconsistent difficulty.
3. Nearly impossible to test every possible AI-generated question.
4. (Also cost, but the three above matter more.)

For Grades 3–6 we need predictable, standards-aligned content. Use a **content bank**:

```json
{
  "skill_id": "SK-M3-101",
  "grade": 3,
  "standard": "M3.1 — Build Equal Groups",
  "mission_id": "crystal-generator",
  "variants": {
    "emerging":  ["question_001", "question_002", "question_003"],
    "on_track":  ["question_101", "question_102", "question_103"],
    "stretch":   ["question_201", "question_202", "question_203"]
  }
}
```

Runtime selection is pure lookup — no AI inference:

```text
Who is playing? → What grade? → What skill is this mission practicing?
→ What is the student's current band for this skill? → Load matching question set.
```

**AI's only future role:** interpreting open-ended work (writing, explanations, oral
responses) to *feed evidence* to the mastery engine. **AI is never the mastery engine.**

The game engine stays identical across bands. A bridge mission always runs:

```text
Question appears → Correct answer → Stone rises into bridge → Character advances
```

Only the question bank swaps:

```javascript
loadMission({ missionId: "jade_bridge_01", skillId: "G3-MATH-04", difficulty: studentBand });
```

---

## 4. No permanent global band — track mastery per skill

A child is **never** globally labeled "Emerging" or "Stretch." Bands are per-skill:

```text
Student: 001   Grade: 3
Multiplication      → Stretch
Division            → On Track
Fractions           → Emerging
Reading vocabulary  → On Track
Reading inference   → Stretch
Grammar             → Emerging
```

Placement gives an **initial estimate**; afterward the platform maintains a lightweight
mastery profile **by skill (or skill cluster).**

> ⚠️ Current-code gap: today `PlacementTier` is one value applied per *domain* (ELA / math)
> and there is no per-skill mastery table. This spec introduces `student_skill_mastery`.

The `001` student number has nothing to do with this. **UUID remains the relational key.**

---

## 5. Four internal states (band is scaffolding, not intelligence)

```text
Emerging → On Track → Stretch → Mastered
```

- **Emerging** — developing the skill; more scaffolding.
- **On Track** — handles expected grade-level application.
- **Stretch** — handles deeper, less-scaffolded applications of the *same* standard.
- **Mastered** — a **curriculum state** (not a question difficulty). Enough evidence the
  child understands and retains the skill → move to the next connected skill.

```text
SK-M3-101 mastered → move to next connected skill → SK-M3-102
```

**Terminology:** prefer `support / core / stretch` OR `emerging / on_track / stretch`.
Do **not** use "underperforming / on task / advanced." The band selects the **appropriate
level of scaffolding for one skill** — it is not a judgment of the child.

---

## 6. Three distinct kinds of advancement

**A. Difficulty advancement (within one skill):** Emerging → On Track → Stretch.

**B. Curriculum advancement (once a skill is mastered):**

```text
Skill 1 → Skill 2 → Skill 3 → Module Gateway → Next Module
```

Follows the curriculum hierarchy:
`Standard → Skill → Prerequisite → Misconception → Mission Objective → Interaction →
Evidence of Mastery → Spiral Review`.

**C. Grade advancement (later phase, not MVP):** A 3rd grader who masters Grade 3 is NOT
thrown into random Grade 4 material. Offer an **optional bridge pathway**:

```text
Grade 3 mastery → Grade 3 enrichment/Stretch → Grade 3–4 Bridge Missions
→ selected Grade 4 prerequisite concepts
```

**MVP:** keep the child inside their assigned grade; Stretch provides enrichment.

---

## 7. Mastery Confidence Score (0–100, hidden per skill)

Not "8/10 = mastered." Measure four things:

```text
Mastery Score =
  Accuracy      × 0.45
+ Independence  × 0.25
+ Consistency   × 0.20
+ Retention     × 0.10
```

`M = (A × .45) + (I × .25) + (C × .20) + (R × .10)`, all normalized to 0–100.

### 7.1 Accuracy — recency-weighted rolling window

Use the most recent ~10 scored interactions, weighting newer ones more heavily so early
struggle isn't a permanent penalty.

```text
Oldest ←                                        → Newest
 5%  5%  7%  7%  8%  10%  12%  13%  15%  18%
```

Example: `W W W R R R R R R R` — a flat lifetime average says 70%, but the child clearly
learned it. Recency weighting recognizes that.

### 7.2 Independence — how much help was needed

AGA already defines three attempt levels (Assessment spec):
Attempt 1 → independent; Attempt 2 → constructive hint; Attempt 3 → stronger scaffolding.

| Outcome                        | Independence credit |
| ------------------------------ | ------------------: |
| Correct on Attempt 1           |                 100 |
| Correct after light hint       |                  70 |
| Correct after strong scaffold  |                  40 |
| System demonstrates solution   |                  10 |
| No successful completion       |                   0 |

A child at 90% *independent* ≠ a child at 90% *after heavy scaffolding*. Different score.

### 7.3 Consistency — protect against lucky streaks

A skill cannot become Mastered without:

```text
≥ 8 scored interactions
AND ≥ 2 separate mission segments
AND ≥ 2 different question formats
```

- Math formats: calculation / word problem / reasoning-application.
- ELA formats: literal comprehension / inference / application to new text.

**Trigger vs. proof:** *5 consecutive correct* → **trigger a mastery evaluation.** It does
**NOT** automatically equal mastery. (This reinterprets the old "5 correct = tier upgrade" note.)

### 7.4 Retention — did it stick

After mastery, quietly resurface the skill on a spaced schedule:

```text
Day 0  → Skill mastered
Day 3  → Quick spiral review
Day 10 → Embedded mission question
Day 30 → Long-term check
```

It shouldn't feel like a test — the skill reappears naturally in a new world/context
(e.g. multiplication mastered in Aqua Azul reappears in Fossil Frontier dinosaur nests).
That is evidence of **transfer + retention.**

> **MVP note:** do NOT build Half-Life Regression or Redis-based mastery decay yet. Start
> with scheduled review intervals: a single `next_review_at` / `review_due_at` column.

---

## 8. Promotion thresholds (starting values)

**Emerging → On Track**
```text
Mastery Confidence ≥ 60
Accuracy ≥ 65%
≥ 6 scored interactions
≥ 50% completed without heavy scaffolding
```

**On Track → Stretch**
```text
Mastery Confidence ≥ 78
Recent accuracy ≥ 80%
≥ 8 scored interactions
≥ 70% independent
Success across 2 mission segments
```

**Stretch → Mastery Candidate**
```text
Mastery Confidence ≥ 85
Recent accuracy ≥ 85%
Independent accuracy ≥ 80%
≥ 10 scored interactions
Success across 3 question/application types
No repeated misconception flag
→ sets mastery_candidate = true  (NOT permanently mastered yet)
```

Recalculate the band **after a mission or lesson**, not after every single question — smoother
experience, simpler engine.

---

## 9. Gateway Challenges = the validation layer

```text
Complete skills within Module
→ each skill reaches Mastery Candidate
→ Module Mastery Confidence ≥ 82–85%
→ Gateway Challenge unlocked
→ student completes mixed application challenge
→ Module validated
→ Next Module
```

The Gateway **deliberately mixes previously learned skills** and does not tell the child
which skill is being tested — closer to real mastery.

### Gateways are NOT pass/fail punishment

If the child misses the benchmark they **lose no progress.** The system finds weak nodes
and sends only those back for targeted work:

```text
Gateway attempt → identify weak nodes
  Multiplication 91% | Division 88% | Word Problems 64% | Fractions 81%
→ return ONLY to Word Problems → targeted adventure → Gateway retry
```

Narratively: *"S.P.A.R.K. detected an unstable signal in the navigation matrix"* → one
targeted reinforcement mission. Never *"YOU FAILED MODULE THREE."* No tiny educational
Hunger Games.

---

## 10. Curriculum graph decides what's next (prerequisite / dependency graph)

Skill IDs (e.g. `SK-M3-401`, `SK-M4-204`, `SK-LV-505`) carry prerequisite relationships:

```text
        SK-M3-A
       /       \
 SK-M3-B      SK-M3-C
       \       /
        SK-M3-D
```

When a skill is mastered, the engine queries for the next skill that:
1. belongs to the student's grade,
2. has all prerequisites satisfied,
3. is not yet mastered,
4. fits the active curriculum sequence.

> ✅ Foundation already exists: `CurriculumSkill.prereq_skill_ids` and
> `CurriculumModule.sequence_order` in `src/data/lms/curriculum/types.ts`. No AI needed.

---

## 11. Database shape (no AI calls required)

```text
students
  id UUID
  student_number      -- 001 (display only, decoupled)
  grade_level         -- 3

skills
  skill_id
  grade_level
  subject
  standard_id
  module_id
  sequence

skill_prerequisites
  skill_id
  prerequisite_skill_id

student_skill_mastery
  student_id
  skill_id
  current_band
  mastery_score
  accuracy_score
  independence_score
  consistency_score
  retention_score
  interaction_count
  independent_correct_count
  hint_correct_count
  scaffold_correct_count
  last_practiced_at
  next_review_at
  status            -- not_started | emerging | on_track | stretch
                    -- | mastery_candidate | mastered | review_due

skill_attempts
  student_id
  skill_id
  question_id
  correct
  attempt_number
  hint_level
  response_time
  question_type
  mission_id
  timestamp
```

---

## 12. Progression algorithm (pseudocode)

```text
AFTER each scored interaction:
 1. Save attempt.
 2. Recalculate recent weighted accuracy.
 3. Calculate independence (Attempt 1 = full credit; hints/scaffold lower it).
 4. Calculate consistency (across sessions and formats).
 5. Calculate retention (include scheduled spiral-review results).
 6. mastery_score = accuracy*.45 + independence*.25 + consistency*.20 + retention*.10
 7. Evaluate band rules.
 8. IF 5 consecutive correct → run tier-evaluation check.
 9. IF mastery_candidate → add skill to Gateway eligibility.
10. IF module mastery ≥ threshold → unlock Gateway.
11. IF Gateway validated → mark eligible skills MASTERED; unlock next node/module.
12. Schedule spiral reviews.
```

Runs in milliseconds. No LLM. No expensive AI.

---

## 13. Child-facing vs. internal labels

Internally: `difficulty_band = emerging`. The child never sees "easy." Options:

- Show neutral names: `Cadet Mission / Explorer Mission / Master Mission`, or
- **Do not expose the band at all** (preferred) — let S.P.A.R.K. quietly adjust.

Supports the no-punishment philosophy.

---

## 14. Complete AGA learning loop

```text
SIGNAL CLARITY SCAN (initial skill estimates)
        ▼
GRADE-LEVEL CURRICULUM GRAPH
        ▼
ACTIVE SKILL ── Emerging → On Track → Stretch
        ▼
MASTERY CANDIDATE
        ▼
MODULE GATEWAY CHALLENGE
   ├── Needs Reinforcement → Targeted Mission → (retry)
   └── Validated → MASTERED → NEXT SKILL/MODULE
        ▼
SPIRAL REVIEW
   ├── Retained → Stay Mastered
   └── Needs Refresh → Micro-Mission
```

**Bottom line:** scaffolding decreases → cognitive complexity increases → mastery is
validated → next curriculum skill unlocks → completed skills periodically return for
retention → after grade-level mastery, optional enrichment/bridge content becomes available.
Almost all of it is deterministic rules over stored interaction data — sophisticated without
being AI-expensive.

---

## 15. Open item — curriculum module count (needs owner confirmation)

The owner referenced two conflicting sources:

- **Master Curriculum Registry** — Grade 3: 20 modules / 100 lessons; Grade 4: 19/95;
  Grade 5: 19/95; Grade 6: 20/100. (Owner says this wins on conflict.)
- **Progression, Reward and Reporting Spec** — "Modules 1 through 10 per grade," with rank
  thresholds at Modules 1–2, 3–5, 6–8, and all 10.

> ⚠️ **Neither document currently exists as a file in this repository.** A whole-repo and
> past-chat search found only the Master Canon PDF plus the code in
> `src/data/lms/curriculum/` (only `mod_01` seeded so far) and rewards in
> `src/data/supabase/004_phase5_rewards.sql`. **This spec adopts the 19–20-module registry
> as authoritative** and treats any 10-module / rank-by-module-band scheme as superseded.
> If the two source docs live outside this repo, add them (or their numbers) here and we
> reconcile the reward-rank thresholds against the 19–20-module structure.

---

## 16. How this maps to existing code (implementation targets)

| Concept in this spec            | Where it lands in the repo                                             |
| ------------------------------- | --------------------------------------------------------------------- |
| Split world from difficulty     | `src/data/lms/mission-engine.ts` (`pickRecommendedWorld`, world opts)  |
| Per-skill bands + 4 states      | new `student_skill_mastery` table (new Supabase migration)            |
| Attempt logging                 | new `skill_attempts` table (new Supabase migration)                  |
| Prerequisite graph              | already scaffolded in `src/data/lms/curriculum/types.ts`             |
| Content bank per skill/variant  | new content-bank files under `src/data/lms/curriculum/`             |
| Mastery Confidence calc         | new `src/lib/lms/mastery/` module                                    |
| Gateway validation              | new `src/lib/lms/gateway/` module                                   |
| Student number stays decoupled  | already done — migration `023_student_numbers.sql`                  |

Pilot slice (grade + skill) to be chosen before building.
