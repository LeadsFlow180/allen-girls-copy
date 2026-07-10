"use client";

const DUST = [
  { top: "12%", left: "8%", delay: "0s", size: 3 },
  { top: "20%", left: "32%", delay: "1.2s", size: 2 },
  { top: "36%", left: "72%", delay: "0.5s", size: 3.5 },
  { top: "44%", left: "18%", delay: "2s", size: 2 },
  { top: "52%", left: "56%", delay: "0.9s", size: 2.5 },
  { top: "60%", left: "84%", delay: "1.6s", size: 2 },
  { top: "70%", left: "24%", delay: "2.4s", size: 3 },
  { top: "16%", left: "90%", delay: "1.8s", size: 2 },
  { top: "78%", left: "48%", delay: "0.3s", size: 2.5 },
  { top: "30%", left: "62%", delay: "3.1s", size: 2 },
  { top: "86%", left: "14%", delay: "1.1s", size: 2 },
  { top: "8%", left: "52%", delay: "2.8s", size: 3 },
] as const;

const STARS = [
  { top: "6%", left: "22%", delay: "0s" },
  { top: "14%", left: "68%", delay: "1.4s" },
  { top: "28%", left: "88%", delay: "0.7s" },
  { top: "42%", left: "6%", delay: "2.1s" },
  { top: "55%", left: "38%", delay: "0.3s" },
  { top: "72%", left: "76%", delay: "1.9s" },
  { top: "82%", left: "30%", delay: "1.2s" },
] as const;

export function LibraryAmbientDust() {
  return (
    <div className="lib-fx-layer lib-ambient" aria-hidden>
      {DUST.map((p, i) => (
        <span
          key={`d-${i}`}
          className="lib-dust-mote"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
          }}
        />
      ))}
      {STARS.map((s, i) => (
        <span
          key={`s-${i}`}
          className="lib-star"
          style={{ top: s.top, left: s.left, animationDelay: s.delay }}
        />
      ))}
    </div>
  );
}
