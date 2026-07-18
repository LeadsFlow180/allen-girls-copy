/**
 * Grade 3 · Module E3.1 — Reading Literature
 * Gateway GW-E3-RL. Skills SK-E3-101 … SK-E3-105 (AGA-CUR-001 §2).
 * Empty shelves — push BankQuestions into each pool's `questions` when authoring.
 * These are multiple-choice, passage-based reading items (placement strand ELA-READ).
 */
import type { SkillQuestionPool } from "../../types";
import { emptyPool } from "../../_helpers";

export const E3_1_POOLS: SkillQuestionPool[] = [
  emptyPool("SK-E3-101"),
  emptyPool("SK-E3-102"),
  emptyPool("SK-E3-103"),
  emptyPool("SK-E3-104"),
  emptyPool("SK-E3-105"),
];
