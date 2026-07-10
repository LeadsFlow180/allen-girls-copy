import { NextRequest, NextResponse } from "next/server";
import { pickRecommendedWorld } from "@/data/lms/mission-engine";
import type { PlacementTier } from "@/data/lms/placement/types";
import { generateSparkMessage } from "@/lib/ai/spark";

/**
 * POST /api/placement/debrief
 *
 * Body: { name, elaPercent, mathPercent, overallPercent, tier }
 * Returns: { debrief: string, missionTitle: string, missionSlug: string, missionEmoji: string }
 *
 * Called by the placement results page. Runs server-side only (never exposes API key to client).
 * COPPA note: only the student's chosen display name (nickname) is passed — never a real name,
 * school, or location.
 */

export interface DebriefRequest {
  name: string;
  elaPercent: number;
  mathPercent: number;
  overallPercent: number;
  tier: "emerging" | "on_track" | "stretch";
}

export interface DebriefResponse {
  debrief: string;
  missionTitle: string;
  missionSlug: string;
  missionEmoji: string;
}

function fallbackDebrief(name: string, tier: DebriefRequest["tier"], pick: { name: string; emoji: string }): string {
  const byTier: Record<PlacementTier, string> = {
    emerging:
      `${name}, scan complete. Your recruit systems are online and ready for focused mission training.\n\n` +
      `Your signal shows strong potential, and S.P.A.R.K. has mapped your next growth targets. We build power one mission at a time.\n\n` +
      `First assignment: ${pick.name} ${pick.emoji}. This world is the right launch point for your current mission profile. Let us move, recruit.`,
    on_track:
      `${name}, scan complete. Your mission systems are stable and responding with strong control.\n\n` +
      `S.P.A.R.K. confirms you are handling core challenges well. Next step: sharpen strategy and speed under pressure.\n\n` +
      `First assignment: ${pick.name} ${pick.emoji}. This world fits your current mission profile and keeps your momentum high. Mission starts now.`,
    stretch:
      `${name}, scan complete. Your signal reads high and your recruit systems are operating at advanced capacity.\n\n` +
      `S.P.A.R.K. confirms you are ready for deeper challenge missions with layered thinking and precision.\n\n` +
      `First assignment: ${pick.name} ${pick.emoji}. This world matches your current mission profile and pushes your skills forward. Time to lead from the front.`,
  };

  return byTier[tier];
}

export async function POST(req: NextRequest) {
  let body: DebriefRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, elaPercent, mathPercent, overallPercent, tier } = body;

  const pick = pickRecommendedWorld(tier, name);

  const elaStrength = elaPercent >= 70 ? "strong" : elaPercent >= 45 ? "solid" : "developing";
  const mathStrength = mathPercent >= 70 ? "strong" : mathPercent >= 45 ? "solid" : "developing";

  const userPrompt = `
Student name (nickname only): ${name}
Reading & Language signal: ${elaStrength} (${elaPercent}%)
Math signal: ${mathStrength} (${mathPercent}%)
Overall signal: ${overallPercent}%
Tier: ${tier}
Recommended first world: ${pick.name}

Write S.P.A.R.K.'s debrief. Rules:
- Exactly 3 short paragraphs.
- Paragraph 1: Address ${name} directly. Confirm the scan is complete. Reference their reading/language signal (use "${elaStrength}" naturally).
- Paragraph 2: Reference their math signal (use "${mathStrength}" naturally). One specific encouragement tied to their weaker area without calling it weak.
- Paragraph 3: Assign their first mission: "${pick.name}" (${pick.emoji}). Frame it as the perfect starting world for their skill level. End with one punchy line that gets them excited to start.
- Never mention percentages or number scores.
- Never use the word "test", "grade", "score", or "level".
- Max 120 words total.
- Write in plain text only — no markdown, no bullet points.
`.trim();

  const debrief = await generateSparkMessage({
    nickname: name,
    mode: "reward",
    missionTitle: pick.name,
    worldTitle: pick.name,
    learnerSignals: [
      `reading_${elaStrength}`,
      `math_${mathStrength}`,
      `tier_${tier}`,
    ],
    instruction: userPrompt,
    maxWords: 120,
  });

  return NextResponse.json({
    debrief: debrief || fallbackDebrief(name, tier, pick),
    missionTitle: pick.name,
    missionSlug: pick.slug,
    missionEmoji: pick.emoji,
  } satisfies DebriefResponse);
}
