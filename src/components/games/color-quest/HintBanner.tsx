interface HintBannerProps {
  isComplete: boolean;
}

export function HintBanner({ isComplete }: HintBannerProps) {
  if (isComplete) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-800 shadow-sm sm:text-sm">
        <span className="text-lg" aria-hidden>
          ✨
        </span>
        <p className="font-nunito">
          Awesome work! You lit up the whole scene. Pick another level to keep playing.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-xs text-indigo-900 shadow-sm sm:text-sm">
      <span className="text-lg" aria-hidden>
        💡
      </span>
      <p className="font-nunito">
        Hint: Look at the number in each square. Match it to the same number in the color legend.
      </p>
    </div>
  );
}

