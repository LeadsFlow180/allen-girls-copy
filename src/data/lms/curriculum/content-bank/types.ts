/**
 * Content bank types — PROGRESSION-SPEC §3.
 * Questions are pre-authored per skill per band. Never AI-generated at runtime.
 * The correct answer + hints live ONLY on the server (API routes strip them
 * before sending a question to the browser).
 */

export type Band = "emerging" | "on_track" | "stretch";

export type QuestionType = "calculation" | "word_problem" | "reasoning";

export type BankQuestion = {
  /** Stable ID, e.g. "g3-mult-e-001" — stored in skill_attempts rows */
  id: string;
  skillId: string;
  band: Band;
  questionType: QuestionType;
  prompt: string;
  choices: string[];
  /** Index into choices — server-side only */
  correctIndex: number;
  /** Attempt 2 hint (light nudge) */
  hintLight: string;
  /** Attempt 3 hint (strong scaffold) */
  hintScaffold: string;
  /** Shown after attempt 3 fails — teach the answer, no shame */
  teach: string;
};

export type SkillQuestionPool = {
  skillId: string;
  grade: number;
  subject: "math" | "ela";
  standard: string;
  title: string;
  questions: BankQuestion[];
};

/** Client-safe question shape (no answer, no hints until earned) */
export type ClientQuestion = {
  id: string;
  skillId: string;
  band: Band;
  questionType: QuestionType;
  prompt: string;
  choices: string[];
};

export function toClientQuestion(q: BankQuestion): ClientQuestion {
  return {
    id: q.id,
    skillId: q.skillId,
    band: q.band,
    questionType: q.questionType,
    prompt: q.prompt,
    choices: q.choices,
  };
}
