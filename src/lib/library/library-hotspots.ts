import type { LibraryWingId } from "./library-catalog";

/** Percent regions on `public/Library Background.png` (2764×1504). */
export type LibraryHotspotRegion = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type LibraryHotspotVariant = "primary" | "allen" | "licensed";

export type LibraryHotspot = {
  id: string;
  label: string;
  hint: string;
  variant: LibraryHotspotVariant;
  wing?: LibraryWingId | "all";
  region: LibraryHotspotRegion;
};

/** Home pill baked into the hub artwork (top-left). */
export const LIBRARY_HUB_HOME_REGION: LibraryHotspotRegion = {
  left: 1.8,
  top: 2.2,
  width: 13.5,
  height: 8.5,
};

export function doorTransformOrigin(region: LibraryHotspotRegion): string {
  const x = region.left + region.width / 2;
  const y = region.top + region.height / 2;
  return `${x}% ${y}%`;
}

export function doorHingeSide(variant: LibraryHotspot["variant"]): "left" | "right" {
  return variant === "licensed" ? "right" : "left";
}

export const LIBRARY_HUB_HOTSPOTS: LibraryHotspot[] = [
  {
    id: "enter",
    label: "Enter the Library",
    hint: "Explore every story on the shelves",
    variant: "primary",
    wing: "all",
    region: { left: 5.5, top: 48.5, width: 27, height: 50 },
  },
  {
    id: "allen-girls",
    label: "Allen Girls Stories",
    hint: "Original adventures in the labyrinth",
    variant: "allen",
    wing: "allen_girls",
    region: { left: 36.5, top: 48.5, width: 27, height: 50 },
  },
  {
    id: "licensed",
    label: "Licensed Classics",
    hint: "Beloved tales with labyrinth editions",
    variant: "licensed",
    wing: "licensed",
    region: { left: 67.5, top: 48.5, width: 27, height: 50 },
  },
];
