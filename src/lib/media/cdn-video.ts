/**
 * Platform rule: heavy video never lives inside the Next.js app bundle or `src`.
 *
 * The app is the TV remote (players + short URLs).
 * The CDN is the streaming service (actual MP4 / WebM bytes).
 *
 * Local exception: `/videos/...` under `public/videos` (gitignored) for owner preview
 * until a permanent CDN URL is set via NEXT_PUBLIC_CADET_INTRO_VIDEO_URL.
 */

export type CdnVideoProvider = "cloudflare_r2" | "aws_s3_cloudfront" | "vercel_blob" | "supabase_storage";

export type CdnVideoAsset = {
  id: string;
  /** Permanent public HTTPS URL on CDN/object storage — or local /videos/ during preview. */
  url: string;
  /** Preferred delivery: progressive MP4 (H.264) and/or WebM. */
  formats: Array<"mp4_h264" | "webm">;
  posterUrl?: string;
  durationSeconds?: number;
  /** Lighter cut or still+audio package for prefers-reduced-motion. */
  reducedMotion?: {
    kind: "lighter_cut" | "still_plus_audio";
    url: string;
  };
  captionsUrl?: string;
};

export const CDN_VIDEO_POLICY = {
  rule:
    "Store all platform cinematic videos on cloud object storage + CDN. The site only stores short URLs and player config.",
  allowedProviders: [
    "cloudflare_r2",
    "aws_s3_cloudfront",
    "vercel_blob",
    "supabase_storage",
  ] as const satisfies readonly CdnVideoProvider[],
  preferredFormats: ["mp4_h264", "webm"] as const,
  forbidden: [
    "Committing large .mp4/.webm files into src/ or git",
    "Serving multi-megabyte cinematic video from the Next.js server process in production",
    "Inlining video bytes into pages",
  ],
  accessibility: {
    alwaysProvideCaptions: true,
    provideReducedMotionAlternative: true,
    skipControlRequiredForOpeners: true,
  },
} as const;

/** True when a URL is an external https media URL (safe for CDN playback). */
export function isCdnHttpsMediaUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isLocalPublicVideoPath(url: string): boolean {
  return url.startsWith("/videos/") && (url.endsWith(".mp4") || url.endsWith(".webm"));
}

/**
 * Validates a cinematic asset before the placement/player UI can accept it.
 * Throws on local/blob-heavy patterns that would weigh down the app server —
 * except gitignored `/videos/` preview paths used during local owner review.
 */
export function assertCdnVideoAsset(asset: CdnVideoAsset): CdnVideoAsset {
  const okRemote = isCdnHttpsMediaUrl(asset.url);
  const okLocalPreview = isLocalPublicVideoPath(asset.url);
  if (!okRemote && !okLocalPreview) {
    throw new Error(
      `Video "${asset.id}" must use an https CDN URL (or /videos/ preview path while testing).`,
    );
  }
  if (asset.url.includes("/src/")) {
    throw new Error(
      `Video "${asset.id}" looks like an app-local src file. Upload to CDN storage first, then store only the URL.`,
    );
  }
  if (asset.formats.length === 0) {
    throw new Error(`Video "${asset.id}" needs at least one format (mp4_h264 or webm).`);
  }
  if (asset.reducedMotion) {
    const rm = asset.reducedMotion.url;
    if (!isCdnHttpsMediaUrl(rm) && !isLocalPublicVideoPath(rm)) {
      throw new Error(`Video "${asset.id}" reduced-motion alternative must also be a CDN or /videos/ URL.`);
    }
  }
  return asset;
}

/**
 * Cadet intro playback URL.
 * Prefer NEXT_PUBLIC_CADET_INTRO_VIDEO_URL (CDN) when set.
 */
export function getCadetIntroVideoSrc(): string {
  const fromEnv = process.env.NEXT_PUBLIC_CADET_INTRO_VIDEO_URL?.trim();
  if (fromEnv) return fromEnv;
  return "/videos/aga-cadet-intro-2026.mp4";
}

/**
 * Game Zone hero video (/games).
 * Prefer NEXT_PUBLIC_GAME_ZONE_HERO_VIDEO_URL (CDN) when set.
 */
export function getGameZoneHeroVideoSrc(): string {
  const fromEnv = process.env.NEXT_PUBLIC_GAME_ZONE_HERO_VIDEO_URL?.trim();
  if (fromEnv) return fromEnv;
  return "/videos/power-up-games.mp4";
}

/** Registry of platform cinematic videos. Add CDN URLs here after upload — never file bytes. */
export const platformCinematicVideos: Record<string, CdnVideoAsset | null> = {
  /** Galaxy-map first-click intro → fades into Signal Clarity Scan. */
  placement_opening_the_signal_and_the_stone: assertCdnVideoAsset({
    id: "placement_opening_the_signal_and_the_stone",
    url: getCadetIntroVideoSrc(),
    formats: ["mp4_h264"],
    durationSeconds: undefined,
  }),
  /** Game Zone page hero loop. */
  game_zone_power_up: assertCdnVideoAsset({
    id: "game_zone_power_up",
    url: getGameZoneHeroVideoSrc(),
    formats: ["mp4_h264"],
    durationSeconds: undefined,
  }),
};
