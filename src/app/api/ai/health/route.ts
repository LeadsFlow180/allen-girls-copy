import { NextResponse } from "next/server";
import {
  DEFAULT_CLAUDE_MODEL,
  isAnthropicConfigured,
} from "@/lib/ai/claude";

/**
 * GET /api/ai/health
 * Confirms env is set. Does not call the Anthropic API (no token spend).
 * Use from server-side or fetch from an admin-only UI later.
 */
export async function GET() {
  const configured = isAnthropicConfigured();

  return NextResponse.json({
    ok: true,
    anthropicConfigured: configured,
    defaultModel: DEFAULT_CLAUDE_MODEL,
    hint: configured
      ? "Key is loaded. Use createSimpleMessage() from server code only."
      : "Set ANTHROPIC_API_KEY in .env.local and restart next dev.",
  });
}
