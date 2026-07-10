import type { ColorQuestScene, ColorTile } from "@/types/color-quest";

/* ─────────────────────────────────────────────────────────────
   HELPER: build a tile list from a 2-D char map.

   charMap is an array of strings, one string per row.
   Each character maps to an entry in charKey:
     { colorId, number }  → foreground tile
     null                 → background (isEmpty) tile

   Tile ids get a prefix to avoid collisions between scenes.
   ───────────────────────────────────────────────────────────── */
function buildTiles(
  prefix: string,
  charMap: string[],
  charKey: Record<string, { colorId: string; number: number } | null>,
): { layout: string[][]; tiles: ColorTile[] } {
  const layout: string[][] = [];
  const tiles: ColorTile[] = [];
  let idx = 0;

  for (const row of charMap) {
    const layoutRow: string[] = [];
    for (const ch of row) {
      idx++;
      const id = `${prefix}${idx}`;
      const entry = charKey[ch];
      layoutRow.push(id);
      if (entry === null) {
        tiles.push({ id, number: 0, colorId: "", isEmpty: true });
      } else {
        tiles.push({ id, number: entry.number, colorId: entry.colorId });
      }
    }
    layout.push(layoutRow);
  }

  return { layout, tiles };
}

/* ═══════════════════════════════════════════════════════════════
   SCENE 1 — Glowing Key  (8 × 8, easy)
   Picture: a big key shape made of gold/purple on a dark bg

   Chars:
   . = background (dark navy)
   G = gold (key bow / ring at top)
   P = purple (key shaft)
   T = teal (key teeth)
   K = pink (key shine/highlight)
   ═══════════════════════════════════════════════════════════════ */
const keyMap = [
  "..GGG...",
  ".GGGGG..",
  ".G...G..",
  ".GGGGG..",
  "..PPP...",
  "..PPT...",
  "..PPT...",
  "..PPP...",
];

const keyCharKey = {
  ".": null,
  G: { colorId: "gold",   number: 1 },
  P: { colorId: "purple", number: 2 },
  T: { colorId: "teal",   number: 3 },
  K: { colorId: "pink",   number: 4 },
} as const;

const { layout: keyLayout, tiles: keyTiles } = buildTiles("k", keyMap, keyCharKey);

/* ═══════════════════════════════════════════════════════════════
   SCENE 2 — Rocket Ship  (8 × 10, medium)
   Picture: a rocket with flames shooting up

   Chars:
   . = background (sky/space)
   W = white body
   B = blue (windows / nose)
   R = red (fins)
   F = orange (flames)
   Y = yellow (flame center)
   ═══════════════════════════════════════════════════════════════ */
const rocketMap = [
  "...BB...",
  "..BWWB..",
  "..WWWW..",
  "..WWWW..",
  ".BWWWWB.",
  ".BWWWWB.",
  "R.WWWW.R",
  "R.WWWW.R",
  ".RFFFFY.",
  "..FYYYF.",
];

const rocketCharKey = {
  ".": null,
  W: { colorId: "white",  number: 1 },
  B: { colorId: "blue",   number: 2 },
  R: { colorId: "red",    number: 3 },
  F: { colorId: "orange", number: 4 },
  Y: { colorId: "yellow", number: 5 },
} as const;

const { layout: rocketLayout, tiles: rocketTiles } = buildTiles("r", rocketMap, rocketCharKey);

/* ═══════════════════════════════════════════════════════════════
   SCENE 3 — Jumping Girl on Vines  (8 × 8, easy)
   Picture: silhouette of a girl jumping on jungle vines

   Chars:
   . = background (sky blue)
   H = hair (dark)
   S = skin (warm brown)
   O = outfit (purple)
   J = jeans (blue)
   V = vine (green)
   ═══════════════════════════════════════════════════════════════ */
const girlMap = [
  "..HHH...",
  ".HSSSSH.",
  "..SSSS..",
  ".OOOOOO.",
  "..OOOO..",
  ".JJ..JJ.",
  ".J....J.",
  "VV....VV",
];

const girlCharKey = {
  ".": null,
  H: { colorId: "hair",   number: 1 },
  S: { colorId: "skin",   number: 2 },
  O: { colorId: "outfit", number: 3 },
  J: { colorId: "jeans",  number: 4 },
  V: { colorId: "vine",   number: 5 },
} as const;

const { layout: girlLayout, tiles: girlTiles } = buildTiles("g", girlMap, girlCharKey);

/* ═══════════════════════════════════════════════════════════════
   EXPORTED SCENES
   ═══════════════════════════════════════════════════════════════ */
export const colorQuestScenes: ColorQuestScene[] = [
  {
    id: "jungle-temple",
    title: "Jungle Temple Glow",
    subtitle: "Color in the magical key!",
    description:
      "Use the color numbers to reveal the glowing key hidden inside the jungle temple.",
    difficulty: "easy",
    themeTag: "Game Zone",
    palette: [
      { id: "gold",   label: "1 = Golden Glow",    hex: "#FBBF24" },
      { id: "purple", label: "2 = Power Purple",   hex: "#7C3AED" },
      { id: "teal",   label: "3 = Jungle Teal",    hex: "#14B8A6" },
      { id: "pink",   label: "4 = Adventure Pink", hex: "#EC4899" },
    ],
    layout: keyLayout,
    tiles: keyTiles,
  },
  {
    id: "space-portal",
    title: "Rocket to the Stars",
    subtitle: "Paint the rocket ship!",
    description:
      "Match the numbers to blast this rocket into space. Color in every part!",
    difficulty: "medium",
    themeTag: "Space",
    palette: [
      { id: "white",  label: "1 = Rocket White",  hex: "#F1F5F9" },
      { id: "blue",   label: "2 = Sky Blue",       hex: "#3B82F6" },
      { id: "red",    label: "3 = Fin Red",        hex: "#EF4444" },
      { id: "orange", label: "4 = Flame Orange",   hex: "#F97316" },
      { id: "yellow", label: "5 = Flame Yellow",   hex: "#FDE047" },
    ],
    layout: rocketLayout,
    tiles: rocketTiles,
  },
  {
    id: "jumping-jungle",
    title: "Jumping Jungle",
    subtitle: "Color the jumping girl!",
    description:
      "Help color in the girl leaping across the jungle vines. Match each number to its color!",
    difficulty: "easy",
    themeTag: "Jungle",
    palette: [
      { id: "hair",   label: "1 = Dark Hair",      hex: "#1C1917" },
      { id: "skin",   label: "2 = Warm Skin",      hex: "#D97706" },
      { id: "outfit", label: "3 = Purple Outfit",  hex: "#7C3AED" },
      { id: "jeans",  label: "4 = Blue Jeans",     hex: "#1D4ED8" },
      { id: "vine",   label: "5 = Jungle Vine",    hex: "#16A34A" },
    ],
    layout: girlLayout,
    tiles: girlTiles,
  },
];
