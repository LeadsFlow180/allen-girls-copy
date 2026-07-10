"use client";

import { useMemo } from "react";
import { ColorLegend } from "@/components/games/color-quest/ColorLegend";
import { ColorQuestLayout } from "@/components/games/color-quest/ColorQuestLayout";
import { NumberGrid } from "@/components/games/color-quest/NumberGrid";
import { Palette } from "@/components/games/color-quest/Palette";
import { SceneCard } from "@/components/games/color-quest/SceneCard";
import { useColorQuest } from "@/hooks/useColorQuest";

export default function ColorQuestPage() {
  const {
    scene,
    scenes,
    selectedColorId,
    filledTiles,
    mistakes,
    selectScene,
    selectColor,
    paintTile,
    resetScene,
    completionPercent,
    isComplete,
  } = useColorQuest();

  const sparkMessage = useMemo(() => {
    if (isComplete)
      return "🎉 Amazing work! Your picture is complete! You're a true artist!";
    if (!selectedColorId)
      return "Pick a color from the palette, then tap every square with that number!";
    const color = scene.palette.find((c) => c.id === selectedColorId);
    return color
      ? `${color.label} selected! Now tap the matching numbers on the grid. 🎨`
      : "Tap a numbered square to fill it with your color!";
  }, [isComplete, selectedColorId, scene.palette]);

  return (
    <ColorQuestLayout
      badge="Game Zone"
      title="Power Up & Play!"
      subtitle="Color by numbers to light up each scene."
      sparkMessage={sparkMessage}
      progressPercent={completionPercent}
      isComplete={isComplete}
      rightAside={
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 16,
              padding: 14,
              backdropFilter: "blur(8px)",
            }}
          >
            <div
              style={{
                color: "#c4b5fd",
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              Choose your level
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {scenes.map((s) => (
                <SceneCard
                  key={s.id}
                  scene={s}
                  active={s.id === scene.id}
                  onSelect={() => selectScene(s.id)}
                />
              ))}
            </div>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 16,
              padding: 14,
              backdropFilter: "blur(8px)",
            }}
          >
            <div
              style={{
                color: "#c4b5fd",
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              Color palette
            </div>
            <p style={{ color: "#e9d5ff", fontSize: 11, marginBottom: 8 }}>
              Tap a color, then tap every square with that number.
            </p>
            <Palette
              colors={scene.palette}
              selectedColorId={selectedColorId}
              onSelectColor={selectColor}
              dark
            />
          </div>

          <button
            type="button"
            onClick={resetScene}
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 12,
              padding: "10px 0",
              color: "#c4b5fd",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              width: "100%",
            }}
          >
            🔄 Start Over
          </button>

          <button
            type="button"
            onClick={() => {
              const idx = scenes.findIndex((s) => s.id === scene.id);
              selectScene(scenes[(idx + 1) % scenes.length].id);
            }}
            style={{
              background: "linear-gradient(135deg, #00C6FF, #0072ff)",
              border: "none",
              borderRadius: 12,
              padding: "10px 0",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              width: "100%",
            }}
          >
            Next level →
          </button>

          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              padding: 12,
            }}
          >
            <div
              style={{
                color: "#c4b5fd",
                fontSize: 11,
                fontWeight: 700,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Color guide
            </div>
            <ColorLegend colors={scene.palette} dark />
          </div>
        </div>
      }
    >
      <div
        style={{
          background: "rgba(255,255,255,0.95)",
          borderRadius: 20,
          padding: 16,
          boxShadow: "0 0 40px rgba(168,85,247,0.2), 0 0 80px rgba(168,85,247,0.08)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <NumberGrid
            scene={scene}
            filledTiles={filledTiles}
            selectedColorId={selectedColorId}
            onPaintTile={paintTile}
          />
          <p
            className="font-nunito"
            style={{ color: "#64748b", fontSize: 12, textAlign: "center", maxWidth: 320 }}
          >
            Pick a color, then tap every square that has the same number. When all numbers are
            filled, the picture is done!
          </p>
        </div>
      </div>
    </ColorQuestLayout>
  );
}
