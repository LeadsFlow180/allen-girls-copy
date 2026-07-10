"use client";

import { useMemo, useState } from "react";
import { colorQuestScenes } from "@/data/games/scenes";
import type { ColorId, ColorQuestScene } from "@/types/color-quest";

export interface ColorQuestState {
  scene: ColorQuestScene;
  selectedColorId: ColorId | null;
  filledTiles: Record<string, ColorId>;
  mistakes: number;
}

export interface UseColorQuestResult extends ColorQuestState {
  scenes: ColorQuestScene[];
  selectScene: (id: string) => void;
  selectColor: (colorId: ColorId) => void;
  paintTile: (tileId: string) => void;
  resetScene: () => void;
  completionPercent: number;
  isComplete: boolean;
}

export function useColorQuest(initialSceneId?: string): UseColorQuestResult {
  const [sceneId, setSceneId] = useState<string>(
    initialSceneId ?? colorQuestScenes[0]?.id,
  );
  const [selectedColorId, setSelectedColorId] = useState<ColorId | null>(null);
  const [filledTiles, setFilledTiles] = useState<Record<string, ColorId>>({});
  const [mistakes, setMistakes] = useState(0);

  const scene = useMemo(
    () => colorQuestScenes.find((s) => s.id === sceneId) ?? colorQuestScenes[0],
    [sceneId],
  );

  const totalTiles = scene.tiles.length;
  const correctCount = useMemo(
    () =>
      scene.tiles.filter((tile) => filledTiles[tile.id] === tile.colorId).length,
    [scene.tiles, filledTiles],
  );

  const completionPercent =
    totalTiles === 0 ? 0 : Math.round((correctCount / totalTiles) * 100);

  const isComplete = completionPercent === 100;

  const selectScene = (id: string) => {
    if (id === sceneId) return;
    setSceneId(id);
    setFilledTiles({});
    setSelectedColorId(null);
    setMistakes(0);
  };

  const selectColor = (colorId: ColorId) => {
    setSelectedColorId(colorId);
  };

  const paintTile = (tileId: string) => {
    if (!selectedColorId) return;
    const tile = scene.tiles.find((t) => t.id === tileId);
    if (!tile) return;

    setFilledTiles((prev) => ({
      ...prev,
      [tileId]: selectedColorId,
    }));

    if (selectedColorId !== tile.colorId) {
      setMistakes((m) => m + 1);
    }
  };

  const resetScene = () => {
    setFilledTiles({});
    setSelectedColorId(null);
    setMistakes(0);
  };

  return {
    scene,
    scenes: colorQuestScenes,
    selectedColorId,
    filledTiles,
    mistakes,
    selectScene,
    selectColor,
    paintTile,
    resetScene,
    completionPercent,
    isComplete,
  };
}

