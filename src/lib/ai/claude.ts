import Anthropic from "@anthropic-ai/sdk";

/** Default model — override with CLAUDE_MODEL in .env.local */
export const DEFAULT_CLAUDE_MODEL =
  process.env.CLAUDE_MODEL?.trim() || "claude-sonnet-4-20250514";

let client: Anthropic | null = null;

export function isAnthropicConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

/**
 * Server-only Anthropic client. Never import this from Client Components.
 * All Claude calls should go through helpers here (LMS architecture rule).
 */
export function getAnthropicClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local and restart the dev server."
    );
  }
  if (!client) {
    client = new Anthropic({ apiKey: key });
  }
  return client;
}

export type SimpleClaudeMessageParams = {
  /** User-visible prompt (already safe for your use case). */
  userText: string;
  /** Optional system instructions (S.P.A.R.K. persona, bounded RAG rules, etc.) */
  system?: string;
  maxTokens?: number;
  model?: string;
};

/**
 * Single-turn chat completion. Wraps SDK in try/catch — does not log child PII.
 * For child profiles: never pass real names, schools, or locations in prompts (COPPA).
 */
export async function createSimpleMessage(
  params: SimpleClaudeMessageParams
): Promise<{ text: string; model: string; stopReason: string | null }> {
  const { userText, system, maxTokens = 1024, model = DEFAULT_CLAUDE_MODEL } = params;

  try {
    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      ...(system ? { system } : {}),
      messages: [{ role: "user", content: userText }],
    });

    const block = response.content[0];
    const text =
      block?.type === "text" ? block.text : "";

    return {
      text,
      model: response.model,
      stopReason: response.stop_reason,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Claude request failed";
    console.error("[Claude]", message);
    throw err;
  }
}
