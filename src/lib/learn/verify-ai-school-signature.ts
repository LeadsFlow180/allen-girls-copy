import { createHmac } from "node:crypto";

export const AGA_CONTENT_SOURCE = "allen-girls-adventures";

/** Canonical HMAC: sha256(secret, base64(utf8 JSON without sig)). */
export function signAiSchoolBody(
  bodyWithoutSig: Record<string, unknown>,
  secret: string,
): string {
  const json = JSON.stringify(bodyWithoutSig);
  const b64 = Buffer.from(json, "utf8").toString("base64");
  return createHmac("sha256", secret).update(b64).digest("hex");
}

export function verifyAiSchoolSignature(
  bodyWithoutSig: Record<string, unknown>,
  sig: string,
  secret: string,
): { valid: boolean; canonical: string; legacyBase64Url?: string } {
  const canonical = signAiSchoolBody(bodyWithoutSig, secret);
  const json = JSON.stringify(bodyWithoutSig);
  const legacyBase64Url = createHmac("sha256", secret)
    .update(Buffer.from(json, "utf8").toString("base64url"))
    .digest("hex");

  return {
    valid: sig === canonical || sig === legacyBase64Url,
    canonical,
    legacyBase64Url,
  };
}

export function assertAiSchoolSource(source: string): boolean {
  return source === AGA_CONTENT_SOURCE;
}

export function isSessionExpired(expiresAt: unknown): boolean {
  if (typeof expiresAt !== "string" || !expiresAt.trim()) return false;
  const ts = new Date(expiresAt).getTime();
  return Number.isFinite(ts) && ts < Date.now();
}
