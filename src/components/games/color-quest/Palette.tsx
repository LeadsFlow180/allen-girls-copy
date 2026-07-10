import { cn } from "@/lib/utils";
import type { ColorId, ColorSwatch } from "@/types/color-quest";

interface PaletteProps {
  colors: ColorSwatch[];
  selectedColorId: ColorId | null;
  onSelectColor: (id: ColorId) => void;
  dark?: boolean;
}

export function Palette({ colors, selectedColorId, onSelectColor, dark }: PaletteProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => (
        <button
          key={color.id}
          type="button"
          onClick={() => onSelectColor(color.id)}
          className={cn(
            "flex items-center gap-2 rounded-full border px-3 py-1.5 text-left text-xs shadow-sm transition-all sm:text-sm",
            dark ? "bg-white/10 hover:bg-white/20 border-white/20" : "bg-white/70 hover:bg-white border-slate-200",
            selectedColorId === color.id
              ? "ring-2 ring-amber-300/60"
              : "",
            selectedColorId === color.id && dark ? "border-amber-400" : "",
            selectedColorId === color.id && !dark ? "border-amber-400" : "",
          )}
        >
          <span
            className="h-5 w-5 rounded-full border border-slate-200"
            style={{ backgroundColor: color.hex }}
          />
          <span
            className="font-nunito text-[0.7rem] font-semibold uppercase tracking-wide sm:text-xs"
            style={dark ? { color: "#e9d5ff" } : undefined}
          >
            {color.label}
          </span>
        </button>
      ))}
    </div>
  );
}

