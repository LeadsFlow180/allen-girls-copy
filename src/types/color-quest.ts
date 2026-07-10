export type ColorId = string;

export type Difficulty = "easy" | "medium" | "hard";

export interface ColorSwatch {
  id: ColorId;
  label: string;
  hex: string;
}

export interface ColorTile {
  id: string;
  /**
   * The number the child sees on the tile (1, 2, 3, ...).
   * Not used when isEmpty is true.
   */
  number: number;
  /**
   * Which color this tile should become when correctly filled.
   */
  colorId: ColorId;
  /**
   * Background tiles are pre-filled and show no number.
   * They form the "sky" / empty space in the picture.
   */
  isEmpty?: boolean;
}

export interface ColorQuestScene {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  difficulty: Difficulty;
  /**
   * Simple 2D layout (rows of tile ids) so we can render a grid.
   */
  layout: string[][];
  /**
   * All tiles that appear in the layout.
   */
  tiles: ColorTile[];
  /**
   * Palette shown to the player.
   */
  palette: ColorSwatch[];
  /**
   * Fun badge text like "Dino World" or "Space".
   */
  themeTag: string;
}

