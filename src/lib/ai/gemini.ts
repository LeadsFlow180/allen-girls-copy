/** Default text model — override with GEMINI_MODEL in .env.local */
export const DEFAULT_GEMINI_MODEL =
  process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";

/** Cover art model — override with GEMINI_IMAGE_MODEL */
export const DEFAULT_GEMINI_IMAGE_MODEL =
  process.env.GEMINI_IMAGE_MODEL?.trim() || "gemini-2.5-flash-image";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

function getGeminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to .env.local and restart the dev server.",
    );
  }
  return key;
}

type GeminiGenerateResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        inlineData?: { mimeType?: string; data?: string };
      }>;
    };
    finishReason?: string;
  }>;
  error?: { message?: string };
};

async function callGeminiGenerate(
  model: string,
  body: Record<string, unknown>,
): Promise<GeminiGenerateResponse> {
  const key = getGeminiApiKey();
  const url = `${GEMINI_API_BASE}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as GeminiGenerateResponse;

  if (!response.ok) {
    const message = payload.error?.message ?? `Gemini request failed (${response.status})`;
    console.error("[Gemini]", message);
    throw new Error(message);
  }

  return payload;
}

export type GeminiJsonGenerateParams = {
  system: string;
  userText: string;
  jsonSchema: Record<string, unknown>;
  maxOutputTokens?: number;
  temperature?: number;
  model?: string;
};

export async function generateGeminiJson<T>(
  params: GeminiJsonGenerateParams,
): Promise<{ data: T; model: string; rawText: string }> {
  const {
    system,
    userText,
    jsonSchema,
    maxOutputTokens = 16384,
    temperature = 0.85,
    model = DEFAULT_GEMINI_MODEL,
  } = params;

  const payload = await callGeminiGenerate(model, {
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: userText }] }],
    generationConfig: {
      temperature,
      maxOutputTokens,
      responseMimeType: "application/json",
      responseSchema: jsonSchema,
    },
  });

  const rawText = payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
  if (!rawText) {
    throw new Error("Gemini returned an empty response.");
  }

  let data: T;
  try {
    data = JSON.parse(rawText) as T;
  } catch {
    console.error("[Gemini] Invalid JSON:", rawText.slice(0, 400));
    throw new Error("Gemini returned invalid JSON.");
  }

  return { data, model, rawText };
}

export type GeminiCoverImage = {
  base64: string;
  mimeType: string;
};

export async function generateGeminiCoverImage(prompt: string): Promise<GeminiCoverImage> {
  const model = DEFAULT_GEMINI_IMAGE_MODEL;
  const payload = await callGeminiGenerate(model, {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.9,
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: { aspectRatio: "3:2" },
    },
  });

  const parts = payload.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      return {
        base64: part.inlineData.data,
        mimeType: part.inlineData.mimeType ?? "image/png",
      };
    }
  }

  throw new Error("Gemini did not return a cover image.");
}
