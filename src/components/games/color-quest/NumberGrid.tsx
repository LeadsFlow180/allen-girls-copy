import { cn } from "@/lib/utils";
import type { ColorId, ColorQuestScene } from "@/types/color-quest";

interface NumberGridProps {
  scene: ColorQuestScene;
  filledTiles: Record<string, ColorId>;
  selectedColorId: ColorId | null;
  onPaintTile: (tileId: string) => void;
}

export function NumberGrid({
  scene,
  filledTiles,
  selectedColorId,
  onPaintTile,
}: NumberGridProps) {
  const columns = scene.layout[0]?.length ?? 1;

  return (
    <div
      className="w-full max-w-sm overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-xl"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: "1px",
        backgroundColor: "#e2e8f0",
      }}
    >
      {scene.layout.flat().map((tileId) => {
        const tile = scene.tiles.find((t) => t.id === tileId);
        if (!tile) return null;

        /* ── Background / empty tile ── */
        if (tile.isEmpty) {
          return (
            <div
              key={tile.id}
              className="aspect-square"
              style={{ backgroundColor: "#f0f9ff" }}
            />
          );
        }

        /* ── Foreground (colorable) tile ── */
        const paletteColor = scene.palette.find((p) => p.id === tile.colorId);
        const appliedColorId = filledTiles[tile.id];
        const appliedColor = scene.palette.find((p) => p.id === appliedColorId);
        const isCorrect = appliedColorId === tile.colorId;
        const isWrong = appliedColorId && appliedColorId !== tile.colorId;

        const bgColor = appliedColor ? appliedColor.hex : "#ffffff";

        return (
          <button
            key={tile.id}
            type="button"
            onClick={() => onPaintTile(tile.id)}
            className={cn(
              "relative aspect-square flex items-center justify-center transition-all duration-150",
              "border border-slate-300/60",
              selectedColorId && !isCorrect
                ? "cursor-pointer hover:brightness-95 active:scale-95"
                : isCorrect
                  ? "cursor-default"
                  : "cursor-default",
              isWrong && "ring-1 ring-red-400",
            )}
            style={{ backgroundColor: bgColor }}
            title={paletteColor ? paletteColor.label : ""}
          >
            {/* Show number only when not yet correctly filled */}
            {!isCorrect && (
              <span
                className="select-none font-fredoka font-bold leading-none"
                style={{
                  fontSize: "clamp(0.5rem, 1.8vw, 0.75rem)",
                  color: appliedColor ? "rgba(0,0,0,0.5)" : "#64748b",
                }}
              >
                {tile.number}
              </span>
            )}

            {/* Tiny check when correct */}
            {isCorrect && (
              <span
                className="select-none text-white"
                style={{
                  fontSize: "clamp(0.45rem, 1.5vw, 0.65rem)",
                  textShadow: "0 1px 2px rgba(0,0,0,0.4)",
                }}
              >
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
