import type { StaticImageData } from "next/image";

import alanaLineArt from "@/assets/images/Alana_LineArt.png";

export type ColorLabRegion = {
  id: string;
  colorId: number;
  label: string;
  cx: number;
  cy: number;
  path: string;
};

export type ColorLabScene = {
  id: string;
  title: string;
  viewBox: string;
  /** Optional background image (e.g. line art). Rendered first, then regions on top. */
  image?: StaticImageData;
  /** When set, overrides default image sizing (which derives from viewBox). */
  imageRect?: { x: number; y: number; width: number; height: number };
  regions: ColorLabRegion[];
  /** Extra SVG elements (e.g. antenna lines) rendered before regions. */
  extraPaths?: { d: string; stroke?: string; strokeWidth?: number }[];
};

// Shared palette used by all Color Lab scenes
export const COLOR_LAB_PALETTE = [
  { id: 1, hex: "#FF6B9D", name: "Petal Pink" },
  { id: 2, hex: "#FF9F43", name: "Sunset Orange" },
  { id: 3, hex: "#FFDD59", name: "Sunshine" },
  { id: 4, hex: "#54E346", name: "Leaf Green" },
  { id: 5, hex: "#00C6FF", name: "Sky Blue" },
  { id: 6, hex: "#A855F7", name: "Lavender" },
  { id: 7, hex: "#FF4757", name: "Ruby" },
  { id: 8, hex: "#FFFFFF", name: "Cloud White" },
  { id: 9, hex: "#2F3640", name: "Night Sky" },
  { id: 10, hex: "#F8C8A8", name: "Peach Glow" },
] as const;

// Butterfly (no background image; paths form the shape)
const BUTTERFLY_REGIONS: ColorLabRegion[] = [
  { id: "body", colorId: 9, label: "9", cx: 200, cy: 200, path: "M192,140 Q200,130 208,140 L215,260 Q200,270 185,260 Z" },
  { id: "head", colorId: 10, label: "10", cx: 200, cy: 115, path: "M200,95 A25,25 0 1,1 200.01,95 Z" },
  { id: "tlwo", colorId: 5, label: "5", cx: 100, cy: 130, path: "M192,155 Q140,60 60,80 Q30,150 80,190 Q130,230 185,200 Z" },
  { id: "tlwi", colorId: 6, label: "6", cx: 130, cy: 155, path: "M186,165 Q150,120 110,130 Q90,165 120,190 Q155,200 184,185 Z" },
  { id: "trwo", colorId: 5, label: "5", cx: 300, cy: 130, path: "M208,155 Q260,60 340,80 Q370,150 320,190 Q270,230 215,200 Z" },
  { id: "trwi", colorId: 6, label: "6", cx: 270, cy: 155, path: "M214,165 Q250,120 290,130 Q310,165 280,190 Q245,200 216,185 Z" },
  { id: "blwo", colorId: 1, label: "1", cx: 110, cy: 255, path: "M186,215 Q140,220 80,270 Q100,330 160,300 Q190,275 187,240 Z" },
  { id: "blwi", colorId: 2, label: "2", cx: 140, cy: 262, path: "M185,230 Q155,235 120,268 Q140,295 170,278 Q186,260 185,242 Z" },
  { id: "brwo", colorId: 1, label: "1", cx: 290, cy: 255, path: "M214,215 Q260,220 320,270 Q300,330 240,300 Q210,275 213,240 Z" },
  { id: "brwi", colorId: 2, label: "2", cx: 260, cy: 262, path: "M215,230 Q245,235 280,268 Q260,295 230,278 Q214,260 215,242 Z" },
  { id: "ant1", colorId: 9, label: "9", cx: 188, cy: 84, path: "M188,84 A5,5 0 1,1 188.01,84 Z" },
  { id: "ant2", colorId: 9, label: "9", cx: 212, cy: 84, path: "M212,84 A5,5 0 1,1 212.01,84 Z" },
  { id: "spot1", colorId: 3, label: "3", cx: 95, cy: 168, path: "M95,168 A12,12 0 1,1 95.01,168 Z" },
  { id: "spot2", colorId: 3, label: "3", cx: 305, cy: 168, path: "M305,168 A12,12 0 1,1 305.01,168 Z" },
  { id: "spot3", colorId: 4, label: "4", cx: 105, cy: 280, path: "M105,280 A10,10 0 1,1 105.01,280 Z" },
  { id: "spot4", colorId: 4, label: "4", cx: 295, cy: 280, path: "M295,280 A10,10 0 1,1 295.01,280 Z" },
];

/*
 * Alana line art regions.
 *
 * Image is 2730×1536 (landscape). We use a 400×550 viewBox (portrait)
 * and position the <image> element at (-102, -5, 999, 562) with
 * preserveAspectRatio="none" so the character fills the canvas.
 *
 * Mapping from image pixels → SVG coords:
 *   svgX = imgPx × 0.366 − 102
 *   svgY = imgPx × 0.366 − 5
 */
const ALANA_REGIONS: ColorLabRegion[] = [
  {
    id: "hair", colorId: 6, label: "6", cx: 138, cy: 50,
    path: "M90,90 Q88,50 105,28 Q125,8 145,8 Q170,8 185,28 Q198,50 195,90 Q192,105 180,108 L100,108 Q90,105 90,90 Z",
  },
  {
    id: "face", colorId: 10, label: "10", cx: 140, cy: 138,
    path: "M108,108 Q140,100 175,108 Q190,120 190,142 Q188,168 172,178 Q140,188 110,178 Q96,168 96,142 Q98,120 108,108 Z",
  },
  {
    id: "neck", colorId: 10, label: "10", cx: 140, cy: 188,
    path: "M128,178 L155,178 L157,198 L126,198 Z",
  },
  {
    id: "shirt", colorId: 8, label: "8", cx: 140, cy: 268,
    path: "M82,200 Q140,192 200,200 L205,220 Q208,260 205,310 Q202,330 195,345 L88,345 Q82,330 78,310 Q75,260 78,220 Z",
  },
  {
    id: "cupcake", colorId: 1, label: "1", cx: 148, cy: 242,
    path: "M128,222 Q148,215 168,222 Q175,238 168,255 Q148,262 128,255 Q120,238 128,222 Z",
  },
  {
    id: "arm-left", colorId: 10, label: "10", cx: 55, cy: 262,
    path: "M82,200 L62,210 Q48,228 42,260 Q38,292 45,318 L78,318 Q75,292 78,260 Q80,228 82,200 Z",
  },
  {
    id: "arm-right", colorId: 10, label: "10", cx: 225, cy: 262,
    path: "M200,200 L222,210 Q236,228 242,260 Q246,292 240,318 L205,318 Q208,292 205,260 Q202,228 200,200 Z",
  },
  {
    id: "fannypack", colorId: 2, label: "2", cx: 248, cy: 348,
    path: "M198,325 L290,332 Q300,345 298,370 L288,385 L195,378 Q190,365 192,345 Z",
  },
  {
    id: "jeans-left", colorId: 5, label: "5", cx: 120, cy: 420,
    path: "M88,345 L148,345 Q150,400 148,450 Q145,485 140,502 L95,502 Q92,485 94,450 Q96,400 88,345 Z",
  },
  {
    id: "jeans-right", colorId: 5, label: "5", cx: 170, cy: 420,
    path: "M148,345 L195,345 Q198,400 200,450 Q202,485 198,502 L152,502 Q148,485 148,450 Q148,400 148,345 Z",
  },
  {
    id: "shoe-left", colorId: 7, label: "7", cx: 112, cy: 518,
    path: "M95,502 L140,502 Q148,510 146,522 Q140,535 85,535 Q78,528 80,515 Q84,506 95,502 Z",
  },
  {
    id: "shoe-right", colorId: 7, label: "7", cx: 178, cy: 518,
    path: "M152,502 L198,502 Q206,510 208,518 Q210,532 200,535 Q160,535 148,530 Q142,522 145,510 Q148,506 152,502 Z",
  },
];

export const COLOR_LAB_SCENES: ColorLabScene[] = [
  {
    id: "butterfly",
    title: "Butterfly Sisters",
    viewBox: "0 0 400 370",
    regions: BUTTERFLY_REGIONS,
    extraPaths: [
      { d: "M200,95 Q183,88 183,80", stroke: "#2F3640", strokeWidth: 2 },
      { d: "M200,95 Q217,88 217,80", stroke: "#2F3640", strokeWidth: 2 },
    ],
  },
  {
    id: "alana",
    title: "Alana",
    viewBox: "0 0 400 550",
    image: alanaLineArt,
    imageRect: { x: -102, y: -5, width: 999, height: 562 },
    regions: ALANA_REGIONS,
  },
];
