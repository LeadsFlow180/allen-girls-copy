import { z } from "zod";

const envSchema = z.object({
  OPENMAIC_BASE_URL: z.string().url(),
  OPENMAIC_SERVICE_TOKEN: z.string().min(12),
  OPENMAIC_TIMEOUT_MS: z.coerce.number().int().min(1000).max(120000).default(30000),
});

function getVoiceEnv() {
  const parsed = envSchema.safeParse({
    OPENMAIC_BASE_URL: process.env.OPENMAIC_BASE_URL,
    OPENMAIC_SERVICE_TOKEN: process.env.OPENMAIC_SERVICE_TOKEN,
    OPENMAIC_TIMEOUT_MS: process.env.OPENMAIC_TIMEOUT_MS ?? "30000",
  });

  if (!parsed.success) {
    throw new Error("voice_env_invalid");
  }

  return parsed.data;
}

export class OpenMaicProxyError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "OpenMaicProxyError";
    this.status = status;
    this.code = code;
  }
}

export async function postToOpenMaic<TRequest, TResponse>(
  path: string,
  body: TRequest
): Promise<TResponse> {
  const env = getVoiceEnv();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.OPENMAIC_TIMEOUT_MS);

  const url = `${env.OPENMAIC_BASE_URL.replace(/\/$/, "")}${path}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-service-token": env.OPENMAIC_SERVICE_TOKEN,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });

    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const message =
        typeof data === "object" &&
        data !== null &&
        "error" in data &&
        typeof (data as { error: unknown }).error === "string"
          ? (data as { error: string }).error
          : "openmaic_request_failed";

      throw new OpenMaicProxyError(message, response.status, "openmaic_non_2xx");
    }

    return data as TResponse;
  } catch (error) {
    if (error instanceof OpenMaicProxyError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new OpenMaicProxyError("openmaic_timeout", 504, "openmaic_timeout");
    }

    throw new OpenMaicProxyError("openmaic_unreachable", 502, "openmaic_unreachable");
  } finally {
    clearTimeout(timeout);
  }
}

