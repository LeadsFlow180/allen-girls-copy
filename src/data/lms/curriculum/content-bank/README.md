# Content Bank — how the question shelves work

This folder is the **pre-authored question pool**. No AI writes or picks questions
at runtime (PROGRESSION-SPEC §3). Games and placement just look up questions by
their canonical skill ID.

## The pieces

| File | What it is |
|------|------------|
| `skills-registry.ts` | The master list of skill IDs (copied from AGA-CUR-001). **Source of truth.** |
| `types.ts` | The shape of a question (`BankQuestion`) and a pool (`SkillQuestionPool`). |
| `_helpers.ts` | `emptyPool("SK-M3-201")` = a ready-to-fill empty shelf for that skill. |
| `grade-3/math/*.ts` | One file per **module** (5 skills each). Grade 3 math. |
| `grade-3/ela/*.ts` | One file per **module** (5 skills each). Grade 3 ELA. |
| `index.ts` | Registers every shelf + the lookup functions. |

> Each skill still gets its own pool object ("shelf") — they're just grouped 5
> per file by module so we have 10 tidy files instead of 50 loose ones.

## How to add questions to a skill

1. Open the module file, e.g. `grade-3/math/m3-2-place-value.ts`.
2. Find the skill's `emptyPool("SK-M3-201")` and give it questions. Easiest:

```ts
import type { BankQuestion, SkillQuestionPool } from "../../types";
import { emptyPool } from "../../_helpers";

const SK_M3_201_QUESTIONS: BankQuestion[] = [
  {
    id: "sk-m3-201-e-001",       // unique id: skill + band + number
    skillId: "SK-M3-201",
    band: "emerging",            // "emerging" | "on_track" | "stretch"
    questionType: "calculation", // "calculation" | "word_problem" | "reasoning"
    prompt: "How many tens are in 340?",
    choices: ["3", "34", "4", "340"],
    correctIndex: 1,             // 0-based index of the right choice
    hintLight: "Look at the digit in the tens place... and the hundreds too.",
    hintScaffold: "340 = 3 hundreds + 4 tens. But 3 hundreds is also 30 tens.",
    teach: "340 has 34 tens: 30 tens (from 300) + 4 tens (from 40).",
  },
  // ...aim for ~6 per band (emerging / on_track / stretch)
];

export const M3_2_POOLS: SkillQuestionPool[] = [
  { ...emptyPool("SK-M3-201"), questions: SK_M3_201_QUESTIONS },
  emptyPool("SK-M3-202"),
  emptyPool("SK-M3-203"),
  emptyPool("SK-M3-204"),
  emptyPool("SK-M3-205"),
];
```

That's it — `index.ts` already imports the whole module, so new questions go live
automatically. See `grade-3/math/m3-1-operations.ts` for a full filled example.

## Rules of thumb

- **Never invent a skill ID.** It must exist in `skills-registry.ts`. `emptyPool`
  throws if it doesn't, on purpose.
- **~6 questions per band** per skill is a good starter target.
- The **correct answer + hints stay on the server** — API routes strip them before
  sending a question to the browser (`toClientQuestion`).
- Writing (`E3.3`) and Speaking (`E3.5`) are open-response and graded later by the
  AI evidence path (PLACEMENT-SPEC §13), not multiple choice.

## Check coverage

`contentBankCoverage()` in `index.ts` reports which shelves are still empty and
flags any ID mismatch against the registry.
