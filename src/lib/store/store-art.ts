import type { StaticImageData } from "next/image";

import mayaFallback from "@/assets/images/Maya 2027.png";
import heroPanorama from "@/assets/images/store/hero-panorama.webp";

/**
 * Gemini often bakes a gray checkerboard + star watermark instead of real alpha.
 * Use only assets that are full opaque scenes; overlays use CSS until re-exported.
 */
export const STORE_ART = {
  /** Full shop interior — crop hides bottom-right Gemini mark */
  heroPanorama,
  /** Real cutout until shopkeeper-maya.webp is regenerated without checkerboard */
  shopkeeper: mayaFallback,
} satisfies Record<string, StaticImageData>;

export type StoreArtKey = keyof typeof STORE_ART;
