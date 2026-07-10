import { createSimpleMessage, isAnthropicConfigured } from "@/lib/ai/claude";

export type SparkMode =
  | "intro"
  | "practice"
  | "crisis"
  | "discovery"
  | "protective"
  | "reward"
  | "bored"
  | "reentry";

export type SparkContext = {
  nickname: string;
  mode: SparkMode;
  missionTitle?: string;
  worldTitle?: string;
  learnerSignals?: string[];
  instruction?: string;
  maxWords?: number;
};

const TONE_RULES: Record<SparkMode, string> = {
  intro: "wonder + curiosity",
  practice: "encouraging coach",
  crisis: "minimal words, calm presence",
  discovery: "curious guide",
  protective: "supportive, reassuring, never shaming",
  reward: "proud mentor, celebratory but grounded",
  bored: "playful challenger",
  reentry: "calm recap and clear next step",
};

const FALLBACK_BY_MODE: Record<SparkMode, string> = {
  intro: "Recruit systems online. S.P.A.R.K. is ready to begin your first mission.",
  practice: "Nice work, recruit. One step at a time and your systems keep getting stronger.",
  crisis: "Focus. Breathe. You have this.",
  discovery: "Interesting signal detected. Let us inspect the clue together.",
  protective: "No stress, recruit. We learn from every attempt, and we keep moving forward.",
  reward: "Mission data confirmed. Strong work, recruit. Your next challenge is ready.",
  bored: "Signal reads high. Initiating advanced challenge mode.",
  reentry: "Welcome back, recruit. S.P.A.R.K. has your last checkpoint loaded and ready.",
};

function cleanNickname(nickname: string): string {
  const t = nickname.trim().replace(/\s+/g, " ").slice(0, 32);
  return t || "Recruit";
}

function stripUnsafe(text: string): string {
  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const banned = /(where do you live|what school|last name|phone number|address|tell me about your family)/i;
  const filtered = lines.filter((l) => !banned.test(l));

  return filtered.join("\n").slice(0, 800);
}

function systemPrompt(mode: SparkMode): string {
  return [
    "You are S.P.A.R.K., the child-safe mission guide for Allen Girls Adventures.",
    "Tone must match: " + TONE_RULES[mode] + ".",
    "Never shame, mock, rush, overwhelm, or manipulate.",
    "Never ask for personal info. Never open free chat.",
    "Use short, clear sentences suitable for children.",
    "Mission framing only. No grades, no comparisons.",
  ].join(" ");
}

function userPrompt(ctx: SparkContext): string {
  const maxWords = ctx.maxWords ?? 90;
  const signals = ctx.learnerSignals?.length ? ctx.learnerSignals.join(", ") : "none";

  return [
    `Nickname: ${cleanNickname(ctx.nickname)}`,
    `Mode: ${ctx.mode}`,
    `Mission: ${ctx.missionTitle ?? "not provided"}`,
    `World: ${ctx.worldTitle ?? "not provided"}`,
    `Signals: ${signals}`,
    `Instruction: ${ctx.instruction ?? "Give a short mission message."}`,
    `Output rules: plain text only, max ${maxWords} words, no markdown bullets.`,
  ].join("\n");
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("spark_timeout")), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function generateSparkMessage(ctx: SparkContext): Promise<string> {
  const nickname = cleanNickname(ctx.nickname);
  const fallback = `${nickname}, ${FALLBACK_BY_MODE[ctx.mode]}`;

  if (!isAnthropicConfigured()) return fallback;

  try {
    const ai = await withTimeout(
      createSimpleMessage({
        system: systemPrompt(ctx.mode),
        userText: userPrompt({ ...ctx, nickname }),
        maxTokens: 220,
      }),
      2500,
    );

    const text = stripUnsafe(ai.text || "");
    return text || fallback;
  } catch {
    return fallback;
  }
}
