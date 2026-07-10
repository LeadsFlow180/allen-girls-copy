import { cn } from "@/lib/utils";
import type { ColorQuestScene } from "@/types/color-quest";

interface SceneCardProps {
  scene: ColorQuestScene;
  active: boolean;
  onSelect: () => void;
}

export function SceneCard({ scene, active, onSelect }: SceneCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-xs transition-all sm:text-sm",
        "bg-white/60 hover:bg-white shadow-sm hover:shadow-md",
        active
          ? "border-purple-500 ring-2 ring-purple-400/40"
          : "border-slate-200",
      )}
    >
      <div className="flex flex-col">
        <span className="font-nunito text-[0.7rem] uppercase tracking-wide text-slate-500">
          {scene.themeTag}
        </span>
        <span className="font-fredoka text-sm text-slate-900 sm:text-base">
          {scene.title}
        </span>
        <span className="font-nunito text-[0.7rem] text-slate-500">
          {scene.subtitle}
        </span>
      </div>
      <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-purple-700">
        {scene.difficulty === "easy"
          ? "Level 1"
          : scene.difficulty === "medium"
            ? "Level 2"
            : "Level 3"}
      </span>
    </button>
  );
}

