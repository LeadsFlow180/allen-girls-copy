import { generateSparkMessage } from "@/lib/ai/spark";

export type GateType = "crisis" | "discovery";

export type GateInput = {
  gateType: GateType;
  prompt: string;
  answer: string;
  expectedKeywords?: string[];
  attemptCount: number;
  nickname: string;
};

export type GateResult = {
  gateType: GateType;
  passed: boolean;
  score: number;
  feedback: string;
  sparkMode: "crisis" | "discovery" | "protective" | "reward";
  latencyMs: number;
  usedFallbackPath: boolean;
};

function keywordScore(answer: string, keywords: string[]): number {
  if (!keywords.length) return 0;
  const a = answer.toLowerCase();
  let hits = 0;
  for (const k of keywords) {
    if (a.includes(k.toLowerCase())) hits += 1;
  }
  return Math.round((hits / keywords.length) * 100);
}

function crisisEvaluate(input: GateInput): GateResult {
  const started = Date.now();
  const score = keywordScore(input.answer, input.expectedKeywords ?? []);
  const passed = score >= 70;
  return {
    gateType: "crisis",
    passed,
    score,
    feedback: passed
      ? "Fast response confirmed. Crisis gate passed."
      : "Not enough signal yet. Focus on the key mission terms and try again.",
    sparkMode: passed ? "reward" : "crisis",
    latencyMs: Date.now() - started,
    usedFallbackPath: false,
  };
}

async function discoveryEvaluate(input: GateInput): Promise<GateResult> {
  const started = Date.now();
  const keywords = input.expectedKeywords ?? [];
  const localScore = keywordScore(input.answer, keywords);
  const localPassed = localScore >= 60;

  const aiText = await generateSparkMessage({
    nickname: input.nickname,
    mode: localPassed ? "discovery" : input.attemptCount >= 3 ? "protective" : "discovery",
    learnerSignals: [`attempt_${input.attemptCount}`, `local_${localScore}`],
    instruction:
      "Evaluate the student's reasoning response in one short paragraph. If weak, give one concrete improvement step.",
    maxWords: 60,
  });

  return {
    gateType: "discovery",
    passed: localPassed,
    score: localScore,
    feedback: aiText,
    sparkMode: localPassed ? "reward" : input.attemptCount >= 3 ? "protective" : "discovery",
    latencyMs: Date.now() - started,
    usedFallbackPath: false,
  };
}

/**
 * Phase 4 gate engine:
 * - Crisis gate: local + immediate, no dependency on AI.
 * - Discovery gate: AI-supported, but always has local scoring fallback.
 */
export async function evaluateGate(input: GateInput): Promise<GateResult> {
  if (input.gateType === "crisis") {
    return crisisEvaluate(input);
  }

  const start = Date.now();
  try {
    const result = await Promise.race([
      discoveryEvaluate(input),
      new Promise<GateResult>((resolve) =>
        setTimeout(() => {
          const score = keywordScore(input.answer, input.expectedKeywords ?? []);
          resolve({
            gateType: "discovery",
            passed: score >= 60,
            score,
            feedback:
              "S.P.A.R.K. is still analyzing deeper reasoning. Local result is ready now; full narrative feedback can continue in the background.",
            sparkMode: score >= 60 ? "reward" : "discovery",
            latencyMs: Date.now() - start,
            usedFallbackPath: true,
          });
        }, 1500),
      ),
    ]);
    return result;
  } catch {
    const score = keywordScore(input.answer, input.expectedKeywords ?? []);
    return {
      gateType: "discovery",
      passed: score >= 60,
      score,
      feedback: "Fallback path used. Continue mission flow with local validation.",
      sparkMode: score >= 60 ? "reward" : "discovery",
      latencyMs: Date.now() - start,
      usedFallbackPath: true,
    };
  }
}
