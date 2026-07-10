/** Visual theme for section unit view — meadow + per-card scenes change with section */

export type SectionPlaygroundDecor =
  | "meadow"
  | "garden"
  | "plaza"
  | "games"
  | "school"
  | "weather"
  | "cafe"
  | "grove";

export type SectionPlaygroundTheme = {
  sectionId: number;
  label: string;
  decor: SectionPlaygroundDecor;
  skyTop: string;
  skyMid: string;
  skyBottom: string;
  hillFarTop: string;
  hillFarBottom: string;
  hillNearTop: string;
  hillNearBottom: string;
  groundTop: string;
  groundBottom: string;
  pathLight: string;
  pathMid: string;
  pathDark: string;
  borderColor: string;
  sunVisible: boolean;
  cloudDensity: "light" | "medium" | "heavy";
};

const THEMES: SectionPlaygroundTheme[] = [
  {
    sectionId: 1,
    label: "Sunny meadow",
    decor: "meadow",
    skyTop: "#6eb8d9",
    skyMid: "#a8d4ef",
    skyBottom: "#c5e8f7",
    hillFarTop: "#72b364",
    hillFarBottom: "#5a9a4e",
    hillNearTop: "#5c9e4a",
    hillNearBottom: "#457a38",
    groundTop: "#6bb85a",
    groundBottom: "#3f7334",
    pathLight: "#c9b08a",
    pathMid: "#b89968",
    pathDark: "#a88858",
    borderColor: "#5a9a4e",
    sunVisible: true,
    cloudDensity: "light",
  },
  {
    sectionId: 2,
    label: "Study garden",
    decor: "garden",
    skyTop: "#8b9cf0",
    skyMid: "#b8c4f5",
    skyBottom: "#e8ecfc",
    hillFarTop: "#6b9e6a",
    hillFarBottom: "#528f52",
    hillNearTop: "#7aab6e",
    hillNearBottom: "#5d8f55",
    groundTop: "#8fbc8f",
    groundBottom: "#4a7a48",
    pathLight: "#b8a898",
    pathMid: "#9a8878",
    pathDark: "#887868",
    borderColor: "#6b7fd7",
    sunVisible: true,
    cloudDensity: "light",
  },
  {
    sectionId: 3,
    label: "Town plaza",
    decor: "plaza",
    skyTop: "#7eb0d4",
    skyMid: "#a8cce8",
    skyBottom: "#d0e4f2",
    hillFarTop: "#8a9aaa",
    hillFarBottom: "#6a7a8a",
    hillNearTop: "#9aa8b0",
    hillNearBottom: "#788890",
    groundTop: "#a8b0a0",
    groundBottom: "#707870",
    pathLight: "#c8c0b0",
    pathMid: "#b0a898",
    pathDark: "#989080",
    borderColor: "#6a8aaa",
    sunVisible: true,
    cloudDensity: "medium",
  },
  {
    sectionId: 4,
    label: "Games park",
    decor: "games",
    skyTop: "#5ec8e8",
    skyMid: "#9ee0f5",
    skyBottom: "#d4f2fc",
    hillFarTop: "#82c96e",
    hillFarBottom: "#62a84e",
    hillNearTop: "#6ec85a",
    hillNearBottom: "#4a9838",
    groundTop: "#7ed66a",
    groundBottom: "#3d8830",
    pathLight: "#d4b890",
    pathMid: "#c0a070",
    pathDark: "#a89060",
    borderColor: "#f97316",
    sunVisible: true,
    cloudDensity: "light",
  },
  {
    sectionId: 5,
    label: "School yard",
    decor: "school",
    skyTop: "#6aa8d8",
    skyMid: "#98c4e8",
    skyBottom: "#c8dff0",
    hillFarTop: "#6a9878",
    hillFarBottom: "#507860",
    hillNearTop: "#78a888",
    hillNearBottom: "#588868",
    groundTop: "#88b898",
    groundBottom: "#487858",
    pathLight: "#b0a890",
    pathMid: "#989078",
    pathDark: "#807860",
    borderColor: "#58cc02",
    sunVisible: true,
    cloudDensity: "medium",
  },
  {
    sectionId: 6,
    label: "Weather hill",
    decor: "weather",
    skyTop: "#8aa8c8",
    skyMid: "#b0c4d8",
    skyBottom: "#d8e4f0",
    hillFarTop: "#6a9870",
    hillFarBottom: "#508058",
    hillNearTop: "#78a880",
    hillNearBottom: "#588060",
    groundTop: "#90b890",
    groundBottom: "#487050",
    pathLight: "#b8b0a0",
    pathMid: "#a09888",
    pathDark: "#888078",
    borderColor: "#1cb0f6",
    sunVisible: false,
    cloudDensity: "heavy",
  },
  {
    sectionId: 7,
    label: "Café lane",
    decor: "cafe",
    skyTop: "#e8b878",
    skyMid: "#f0d0a0",
    skyBottom: "#f8e8c8",
    hillFarTop: "#a89070",
    hillFarBottom: "#887050",
    hillNearTop: "#b8a080",
    hillNearBottom: "#987060",
    groundTop: "#c8b090",
    groundBottom: "#907050",
    pathLight: "#d8c8a8",
    pathMid: "#c0b090",
    pathDark: "#a89878",
    borderColor: "#ec4899",
    sunVisible: true,
    cloudDensity: "light",
  },
  {
    sectionId: 8,
    label: "Friendship grove",
    decor: "grove",
    skyTop: "#68b8c8",
    skyMid: "#98d0e0",
    skyBottom: "#c8e8f0",
    hillFarTop: "#5a9858",
    hillFarBottom: "#408040",
    hillNearTop: "#68a860",
    hillNearBottom: "#488838",
    groundTop: "#78b870",
    groundBottom: "#388030",
    pathLight: "#c0b090",
    pathMid: "#a89878",
    pathDark: "#908068",
    borderColor: "#7c22c5",
    sunVisible: true,
    cloudDensity: "medium",
  },
];

export function getSectionPlaygroundTheme(sectionId: number): SectionPlaygroundTheme {
  return THEMES.find((t) => t.sectionId === sectionId) ?? THEMES[0];
}
