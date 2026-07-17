// Move 2 helper: map hardcoded 6-digit hex in *.module.css to the nearest
// design token, then (in apply mode) replace them with var(--token).
// The printed mapping is the reviewable artifact the brief asks for.
//
//   node scripts/tokenize.mjs         -> dry run: print hex -> token (+distance)
//   node scripts/tokenize.mjs apply   -> rewrite the module files
//
// Values with a large color distance are flagged REVIEW and, unless listed
// in EXEMPT, are left untouched so they surface as deliberate survivors.
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// token name -> hex value. Semantic names first so they win ties on shared values.
const TOKENS = {
  // semantic (Move 1)
  "--surface": "#ffffff", "--text": "#0f172a", "--text-muted": "#64748b",
  "--text-subtle": "#94a3b8", "--border": "#e2e8f0", "--border-strong": "#cbd5e1",
  "--success": "#22c55e", "--warning": "#f59e0b", "--danger": "#ef4444",
  // brand
  "--primary": "#7c22c5", "--primary-dark": "#5a18a0", "--secondary": "#e8357a",
  "--accent": "#f5c518", "--aga-navy": "#1a0a40",
  // slate
  "--slate-50": "#f8fafc", "--slate-100": "#f1f5f9", "--slate-200": "#e2e8f0",
  "--slate-300": "#cbd5e1", "--slate-400": "#94a3b8", "--slate-500": "#64748b",
  "--slate-600": "#475569", "--slate-700": "#334155", "--slate-800": "#1e293b",
  "--slate-900": "#0f172a",
  // purple/violet
  "--purple-50": "#faf5ff", "--purple-100": "#ede9fe", "--purple-200": "#ddd6fe",
  "--purple-300": "#c4b5fd", "--purple-400": "#a78bfa", "--purple-500": "#8b5cf6",
  "--purple-600": "#7c3aed", "--purple-700": "#6d28d9", "--purple-800": "#5b21b6",
  "--purple-900": "#4c1d95", "--purple-950": "#2a1060",
  // pink/rose
  "--pink-100": "#fce7f3", "--pink-300": "#f472b6", "--pink-400": "#ec4899",
  "--pink-500": "#e8357a", "--pink-600": "#db2777", "--pink-700": "#be185d",
  "--pink-900": "#9d174d",
  // yellow/amber/gold
  "--gold-50": "#fffbeb", "--gold-100": "#fef3c7", "--gold-200": "#fde68a",
  "--gold-300": "#fde047", "--gold-400": "#facc15", "--gold-500": "#f5c518",
  "--gold-metal": "#d4af37", "--amber-500": "#f59e0b", "--amber-600": "#ca8a04",
  "--amber-700": "#a16207", "--amber-800": "#854d0e",
  // green/emerald + gamified
  "--green-100": "#bbf7d0", "--green-300": "#86efac", "--green-400": "#4ade80",
  "--green-500": "#22c55e", "--green-600": "#16a34a", "--green-700": "#15803d",
  "--green-800": "#166534", "--green-900": "#14532d",
  "--emerald-500": "#10b981", "--emerald-600": "#059669", "--emerald-700": "#047857",
  "--game-green": "#58cc02", "--game-green-dark": "#46a302", "--game-green-light": "#7ee02a",
  // blue/sky/cyan + gamified
  "--sky-50": "#f0f9ff", "--sky-100": "#e0f2fe", "--sky-200": "#bae6fd",
  "--sky-300": "#7dd3fc", "--sky-400": "#38bdf8", "--sky-500": "#0ea5e9",
  "--sky-600": "#0284c7", "--sky-700": "#0369a1", "--sky-900": "#0c4a6e",
  "--blue-500": "#3b82f6", "--blue-600": "#2563eb", "--blue-700": "#1d4ed8",
  "--game-blue": "#1cb0f6", "--game-blue-dark": "#1899d6", "--cyan-500": "#06b6d4",
  // orange + warm brown
  "--orange-300": "#fdba74", "--orange-500": "#f97316", "--orange-600": "#ea580c",
  "--orange-700": "#c2410c", "--brown-700": "#92400e", "--brown-800": "#78350f",
  "--brown-900": "#451a03", "--brown-warn": "#b45309",
  // red
  "--red-100": "#fee2e2", "--red-200": "#fecaca", "--red-300": "#fca5a5",
  "--red-400": "#f87171", "--red-500": "#ef4444", "--red-600": "#dc2626",
  "--red-700": "#b91c1c", "--red-800": "#991b1b", "--red-900": "#7f1d1d",
  "--game-red": "#ff4b4b",
  // teal
  "--teal-100": "#ccfbf1", "--teal-500": "#14b8a6", "--teal-700": "#0f766e", "--teal-900": "#134e4a",
  // gap-fillers
  "--violet-400": "#c084fc", "--violet-500": "#a855f7", "--fuchsia-500": "#c026d3",
  "--indigo-300": "#a5b4fc", "--indigo-600": "#4f46e5", "--indigo-700": "#4338ca", "--indigo-800": "#312e81",
  "--yellow-500": "#eab308", "--yellow-600": "#ca8a04", "--gold-dark": "#c9a012", "--amber-orange": "#d97706",
  "--orange-100": "#ffedd5", "--orange-200": "#fed7aa",
  "--lime-200": "#d7ffb8", "--lime-300": "#bef264", "--lime-500": "#3d8c02",
  "--cyan-300": "#67e8f9", "--cyan-400": "#22d3ee",
  "--emerald-300": "#6ee7b7", "--emerald-400": "#34d399",
  "--rose-700": "#be123c",
  "--earth-500": "#7d6352", "--earth-600": "#6b5344", "--earth-700": "#5c4638",
  "--indigo-950": "#1e1b4b", "--green-50": "#dcfce7",
};

// hex -> forced token (brand/semantic intent that nearest-match could get wrong)
const OVERRIDES = {
  "#7c22c5": "--primary", "#7c3aed": "--primary", "#5a18a0": "--primary-dark",
  "#1a0a40": "--aga-navy", "#e8357a": "--secondary", "#f5c518": "--accent",
  // tail hue-fixes (pure grays must stay neutral, not brown; dark greens stay green)
  "#6b6b6b": "--text-muted", "#4b4b4b": "--slate-700", "#6a5f7d": "--text-muted",
  "#3d3428": "--earth-700", "#050508": "--text", "#0a0a1a": "--text",
  "#052e16": "--green-900", "#c8e6b0": "--lime-200", "#5a9a4e": "--green-600",
  "#ffd36a": "--gold-300", "#8ecae6": "--sky-300", "#93c5fd": "--sky-300",
  "#0d2060": "--purple-950", "#fbcfe8": "--pink-100", "#ecfccb": "--lime-200",
  "#12082e": "--aga-navy", "#0f041c": "--aga-navy", "#0f0520": "--aga-navy",
};

// hex left as literal on purpose (genuine one-off illustration). Filled after review.
const EXEMPT = new Set([]);

const REVIEW_THRESHOLD = 55; // redmean distance above which we won't auto-replace

function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function dist(a, b) {
  // redmean approximation (perceptual-ish)
  const rmean = (a[0] + b[0]) / 2;
  const dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2];
  return Math.sqrt((2 + rmean / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rmean) / 256) * db * db);
}
const tokenRgb = Object.entries(TOKENS).map(([k, v]) => [k, hexToRgb(v)]);
function nearest(hex) {
  const rgb = hexToRgb(hex);
  let best = null, bd = Infinity;
  for (const [k, trgb] of tokenRgb) {
    const d = dist(rgb, trgb);
    if (d < bd) { bd = d; best = k; }
  }
  return [best, bd];
}

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (e.endsWith(".module.css")) out.push(p);
  }
  return out;
}

const apply = process.argv[2] === "apply";
const files = walk("src");
const hexRe = /#[0-9a-fA-F]{6}\b/g;

// collect unique hex + counts
const counts = new Map();
for (const f of files) {
  const txt = readFileSync(f, "utf8");
  for (const m of txt.matchAll(hexRe)) {
    const h = m[0].toLowerCase();
    counts.set(h, (counts.get(h) || 0) + 1);
  }
}

// build decision table
const decide = new Map(); // hex -> {token, d, action}
for (const [h, c] of counts) {
  if (EXEMPT.has(h)) { decide.set(h, { token: null, d: 0, action: "EXEMPT", c }); continue; }
  if (OVERRIDES[h]) { decide.set(h, { token: OVERRIDES[h], d: 0, action: "override", c }); continue; }
  const [tok, d] = nearest(h);
  decide.set(h, { token: tok, d, action: d > REVIEW_THRESHOLD ? "REVIEW-skip" : "map", c });
}

// print sorted by distance desc so far-off ones are visible
const rows = [...decide.entries()].sort((a, b) => b[1].d - a[1].d);
let mapped = 0, skipped = 0;
for (const [h, info] of rows) {
  if (info.action === "map" || info.action === "override") mapped++;
  else skipped++;
}
console.log(`unique hex: ${counts.size} | will map: ${mapped} | left as survivor: ${skipped}`);
console.log("--- farthest 40 matches (review these) ---");
for (const [h, info] of rows.slice(0, 40)) {
  console.log(`${info.action.padEnd(11)} ${h} x${String(info.c).padStart(3)} -> ${info.token ?? "(literal)"}  d=${info.d.toFixed(1)}`);
}

if (apply) {
  let changed = 0, repl = 0;
  for (const f of files) {
    let txt = readFileSync(f, "utf8");
    const orig = txt;
    txt = txt.replace(hexRe, (m) => {
      const info = decide.get(m.toLowerCase());
      if (info && (info.action === "map" || info.action === "override")) { repl++; return `var(${info.token})`; }
      return m;
    });
    if (txt !== orig) { writeFileSync(f, txt); changed++; }
  }
  console.log(`APPLIED: ${repl} replacements across ${changed} files`);
}
