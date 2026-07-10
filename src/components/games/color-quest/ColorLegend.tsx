import type { ColorSwatch } from "@/types/color-quest";

interface ColorLegendProps {
  colors: ColorSwatch[];
  dark?: boolean;
}

export function ColorLegend({ colors, dark }: ColorLegendProps) {
  return (
    <div className={dark ? "mt-2 grid gap-1.5 text-[0.7rem] sm:text-xs" : "mt-3 grid gap-1.5 text-[0.7rem] sm:text-xs"}>
      {colors.map((c, index) => (
        <div
          key={c.id}
          className={`flex items-center gap-2 font-nunito ${dark ? "" : "text-slate-600"}`}
          style={dark ? { color: "#e9d5ff" } : undefined}
        >
          <span
            className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[0.6rem] font-bold ${dark ? "bg-white/20 text-amber-200" : "bg-slate-900 text-amber-300"}`}
          >
            {index + 1}
          </span>
          <span
            className="h-3 w-8 rounded-full border border-slate-200"
            style={{ backgroundColor: c.hex, borderColor: dark ? "rgba(255,255,255,0.2)" : undefined }}
          />
          <span>{c.label}</span>
        </div>
      ))}
    </div>
  );
}

