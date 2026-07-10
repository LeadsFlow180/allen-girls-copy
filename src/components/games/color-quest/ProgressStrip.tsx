interface ProgressStripProps {
  percent: number;
  mistakes: number;
  isComplete: boolean;
}

export function ProgressStrip({ percent, mistakes, isComplete }: ProgressStripProps) {
  return (
    <div className="space-y-2 rounded-xl bg-slate-900/90 p-4 text-xs text-white shadow-lg">
      <div className="flex items-center justify-between gap-2">
        <div className="font-fredoka text-sm">
          {isComplete ? "You did it! 🎉" : "Power Up & Play!"}
        </div>
        <div className="rounded-full bg-slate-800 px-2 py-0.5 font-nunito text-[0.7rem] tracking-wide">
          {percent}% complete
        </div>
      </div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-700">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-400 via-pink-400 to-sky-400 transition-all"
          style={{ width: `${Math.max(5, percent)}%` }}
        />
      </div>
      <div className="flex items-center justify-between font-nunito text-[0.7rem] text-slate-200">
        <span>
          Tap a color, then tap the matching number tiles to fill in the picture.
        </span>
        <span className="rounded-full bg-slate-800 px-2 py-0.5">
          Oops tries: <strong>{mistakes}</strong>
        </span>
      </div>
    </div>
  );
}

