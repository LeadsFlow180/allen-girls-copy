import type { SectionPlaygroundDecor } from "./explore-section-playground-themes";

type DecorProps = {
  decor: SectionPlaygroundDecor;
  accent: string;
  locked: boolean;
};

/** Extra scenery for wide section meadow (viewBox 800×320) */
export function SectionPlaygroundDecorWide({
  decor,
  accent,
  locked,
}: DecorProps) {
  const o = locked ? 0.35 : 0.85;

  switch (decor) {
    case "garden":
      return (
        <g opacity={o}>
          <rect x="180" y="175" width="48" height="6" rx="2" fill="#8b6914" />
          <rect x="182" y="168" width="44" height="8" rx="2" fill="#a67c2a" />
          <rect x="520" y="178" width="70" height="40" rx="4" fill="#7aab6e" opacity="0.6" />
          <circle cx="555" cy="172" r="8" fill="#f472b6" />
          <circle cx="540" cy="176" r="6" fill="#fbbf24" />
        </g>
      );
    case "plaza":
      return (
        <g opacity={o}>
          <rect x="140" y="140" width="90" height="70" fill="#8898a8" rx="2" />
          <rect x="155" y="155" width="18" height="22" fill="#6a7a8a" />
          <rect x="185" y="155" width="18" height="22" fill="#6a7a8a" />
          <rect x="480" y="130" width="110" height="85" fill="#788898" rx="2" />
          <rect x="620" y="168" width="6" height="45" fill="#5c4a3a" />
          <circle cx="623" cy="162" r="10" fill="#ffe566" opacity="0.9" />
        </g>
      );
    case "games":
      return (
        <g opacity={o}>
          <path d="M600 210 L620 150 L640 210 Z" fill="#5c4a3a" />
          <rect x="615" y="150" width="10" height="60" fill={accent} opacity="0.5" rx="1" />
          <rect x="100" y="195" width="8" height="35" fill="#8b6914" />
          <rect x="95" y="190" width="18" height="6" fill={accent} opacity="0.7" rx="1" />
        </g>
      );
    case "school":
      return (
        <g opacity={o}>
          <rect x="200" y="120" width="140" height="95" fill="#c8d8e8" rx="3" />
          <polygon points="200,120 270,85 340,120" fill="#98a8b8" />
          <rect x="230" y="150" width="24" height="30" fill="#88a0b8" />
          <rect x="280" y="150" width="24" height="30" fill="#88a0b8" />
          <line x1="500" y1="210" x2="500" y2="155" stroke="#5c4a3a" strokeWidth="3" />
          <rect x="492" y="148" width="16" height="10" fill={accent} opacity="0.8" rx="1" />
        </g>
      );
    case "weather":
      return (
        <g opacity={locked ? 0.5 : 0.9}>
          <path
            d="M350 95 Q400 75 450 95"
            fill="none"
            stroke="#c084fc"
            strokeWidth="3"
            opacity="0.45"
          />
          <ellipse cx="200" cy="55" rx="50" ry="18" fill="#e8eef4" />
          <ellipse cx="240" cy="48" rx="38" ry="14" fill="#dce4ec" />
          <ellipse cx="500" cy="62" rx="55" ry="20" fill="#eef2f6" />
          <ellipse cx="540" cy="55" rx="40" ry="15" fill="#e0e8f0" />
        </g>
      );
    case "cafe":
      return (
        <g opacity={o}>
          <rect x="120" y="155" width="100" height="12" fill="#c87840" rx="2" />
          <path d="M115 155 L120 140 L225 140 L230 155 Z" fill="#e09050" />
          <rect x="140" y="185" width="22" height="18" fill="#a08060" rx="2" />
          <rect x="175" y="188" width="22" height="15" fill="#a08060" rx="2" />
          <rect x="480" y="160" width="90" height="10" fill="#c87840" rx="2" />
          <path d="M475 160 L480 145 L575 145 L580 160 Z" fill="#e09050" />
        </g>
      );
    case "grove":
      return (
        <g opacity={o}>
          {[80, 130, 580, 650, 700].map((x) => (
            <g key={x}>
              <rect x={x} y={155} width={8} height={40} fill="#5c4a3a" />
              <ellipse cx={x + 4} cy={148} rx={22} ry={26} fill="#4a853c" />
            </g>
          ))}
          <rect x="380" y="188" width="50" height="6" rx="2" fill="#8b6914" />
        </g>
      );
    default:
      return null;
  }
}

/** Extra scenery for per-unit card (viewBox 400×200) */
export function SectionPlaygroundDecorUnit({
  decor,
  accent,
  locked,
}: DecorProps) {
  const o = locked ? 0.35 : 0.8;

  switch (decor) {
    case "garden":
      return (
        <g opacity={o}>
          <rect x="48" y="158" width="36" height="5" rx="1" fill="#8b6914" />
          <rect x="50" y="153" width="32" height="6" rx="1" fill="#a67c2a" />
          <ellipse cx="310" cy="155" rx="18" ry="10" fill="#7aab6e" />
        </g>
      );
    case "plaza":
      return (
        <g opacity={o}>
          <rect x="50" y="118" width="55" height="45" fill="#8898a8" rx="2" />
          <rect x="300" y="125" width="70" height="50" fill="#788898" rx="2" />
          <rect x="355" y="168" width="4" height="28" fill="#5c4a3a" />
          <circle cx="357" cy="163" r="6" fill="#ffe566" />
        </g>
      );
    case "games":
      return (
        <g opacity={o}>
          <path d="M48 168 L58 130 L68 168 Z" fill="#5c4a3a" />
          <rect x="54" y="130" width="8" height="38" fill={accent} opacity="0.55" rx="1" />
        </g>
      );
    case "school":
      return (
        <g opacity={o}>
          <rect x="42" y="108" width="72" height="52" fill="#c8d8e8" rx="2" />
          <polygon points="42,108 78,88 114,108" fill="#98a8b8" />
          <line x1="300" y1="168" x2="300" y2="128" stroke="#5c4a3a" strokeWidth="2" />
          <rect x="294" y="122" width="12" height="7" fill={accent} opacity="0.75" rx="1" />
        </g>
      );
    case "weather":
      return (
        <g opacity={locked ? 0.45 : 0.88}>
          <ellipse cx="100" cy="38" rx="40" ry="14" fill="#eef2f6" />
          <ellipse cx="280" cy="32" rx="45" ry="16" fill="#e8eef4" />
          <path
            d="M160 48 Q200 32 240 48"
            fill="none"
            stroke="#c084fc"
            strokeWidth="2"
            opacity="0.4"
          />
        </g>
      );
    case "cafe":
      return (
        <g opacity={o}>
          <path d="M38 158 L42 145 L95 145 L99 158 Z" fill="#e09050" />
          <rect x="44" y="158" width="48" height="8" fill="#c87840" rx="1" />
          <path d="M275 148 L280 136 L340 136 L345 148 Z" fill="#e09050" />
          <rect x="280" y="148" width="55" height="8" fill="#c87840" rx="1" />
        </g>
      );
    case "grove":
      return (
        <g opacity={o}>
          <rect x="300" y="188" width="40" height="5" rx="1" fill="#8b6914" />
          {[55, 330].map((x) => (
            <g key={x}>
              <rect x={x} y={118} width={7} height="35" fill="#5c4a3a" />
              <ellipse cx={x + 3} cy={112} rx={16} ry={20} fill="#4a853c" />
            </g>
          ))}
        </g>
      );
    default:
      return null;
  }
}
