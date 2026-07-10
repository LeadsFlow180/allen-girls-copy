import { z } from "zod";

import { DEFAULT_LEARN_CLASSROOM_ID } from "@/lib/learn/constants";

const quizResultSchema = z.object({
  questionId: z.union([z.string(), z.number()]),
  status: z.enum(["correct", "incorrect"]),
  earned: z.number().optional(),
  aiComment: z.string().optional(),
});

export const aiSchoolQuizSchema = z.object({
  sceneId: z.string().min(1),
  classroomId: z.string().min(1).default(DEFAULT_LEARN_CLASSROOM_ID),
  score: z.number(),
  totalPoints: z.number(),
  percent: z.number(),
  correctCount: z.number().int().min(0),
  incorrectCount: z.number().int().min(0),
  questionCount: z.number().int().min(1),
  submittedAt: z.string().min(1),
  results: z.array(quizResultSchema).optional(),
  answers: z.record(z.string(), z.unknown()).optional(),
});

export type AiSchoolQuizPayload = z.infer<typeof aiSchoolQuizSchema>;
