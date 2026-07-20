import { STR } from "./strings.js";
import { N, SHAPES, clearableLines, levelConfig } from "./shapes.js";
import { PIECES, pieceInfo } from "./pieces.js";
import { AUDIO } from "./audio.js";

// ---------- palette (STYLE FORMULA: flat, no gradients) ----------
const COL = {
  bg:        "#F4F4F2",
  cell:      "#E7E7E4",
  cellEdge:  "#DDDDD9",
  text:      "#2B2B2B",
  textSoft:  "#8A8A86",
  ghostOk:   "rgba(87,193,160,0.45)",
  ghostBad:  "rgba(232,105,91,0.40)",
  panel:     "#FFFFFF"
};
// Per-level color themes. Each level picks one palette (5 colors), so the blocks
// visibly change color from level to level. All stay flat and readable per the
// STYLE FORMULA. Cells store a color INDEX (0..4); the active palette maps it to a hex.
const PALETTES = [
  ["#5B7FDB", "#E8695B", "#57C1A0", "#EBB04B", "#9B7BD4"], // classic
  ["#6C8AE4", "#F0836F", "#4FB6C9", "#F2C14E", "#B98BE0"], // bright
  ["#E4776B", "#E8A15B", "#E8C15B", "#7FB98B", "#6FA3C9"], // warm-to-cool
  ["#7B86C9", "#C97BA8", "#7BC9B0", "#C9B67B", "#8F9BD4"], // dusty pastel
  ["#4E9DE0", "#5FC29A", "#F2A65A", "#EF6F6C", "#A98CE0"], // vivid
  ["#5AA9A0", "#5A86A9", "#A95A86", "#A9925A", "#7A5AA9"], // muted jewel
  ["#E07A5F", "#3D9A8B", "#8C6BB1", "#E0B15F", "#5B87C9"], // earthy
  ["#3AA0C9", "#3AC98F", "#C9A83A", "#C95B7B", "#7B5BC9"]  // cool pop
];
// current active palette (set per level in startLevel)
let BLOCKS = PALETTES[0];
function paletteForLevel(idx) { return PALETTES[idx % PALETTES.length]; }

// Per-level background gradients. These are clearly colorful (not near-white) so
// the backdrop visibly changes every level, but still soft and shape-free so the
// board and pieces stay readable. Three stops each for a richer wash.
const BG_TINTS = [
  ["#DCE7FB", "#EBE4F6", "#F7E4EC"], // blue -> lavender -> rose
  ["#FBEFD9", "#F7E8E0", "#DDEEFB"], // cream -> peach -> sky
  ["#FBE2D9", "#F6EBD8", "#E1F1DD"], // peach -> sand -> green
  ["#E6DDF9", "#EDE4F5", "#DCEEE9"], // violet -> lilac -> mint
  ["#D9ECFB", "#E7EFF3", "#FBF0D9"], // sky -> pale -> warm sand
  ["#D9EFE9", "#E4EEF2", "#E7E1F5"], // seafoam -> teal -> soft violet
  ["#FBE4D9", "#F3E8E2", "#DCE7F3"], // terracotta -> taupe -> slate
  ["#D9F0F2", "#E6EEF0", "#F6E2ED"]  // aqua -> pale -> pink
];
let bgTint = BG_TINTS[0];
function bgTintForLevel(idx) { return BG_TINTS[idx % BG_TINTS.length]; }



// ---------- attractive background images, rotated per level ----------
// Soft dreamy abstract wallpapers (no shapes) shown as the real backdrop, with a
// gentle white scrim so blocks stay readable. The per-level gradient tint below is
// the instant fallback shown until an image loads (or if it can't).
const BG_URLS = [
  "https://d8j0ntlcm91z4.cloudfront.net/user_36WhJm9G1dLQpS5pEP9lbzca22L/hf_20260717_143047_cc4ca21b-1e6c-48ca-8edc-6b0f7756cdd7.png", // peach dawn
  "https://d8j0ntlcm91z4.cloudfront.net/user_36WhJm9G1dLQpS5pEP9lbzca22L/hf_20260717_143053_0fc7e15a-035d-48d2-9e1f-83857f426b87.png", // mint meadow
  "https://d8j0ntlcm91z4.cloudfront.net/user_36WhJm9G1dLQpS5pEP9lbzca22L/hf_20260717_143058_94dda06c-f842-4449-b610-5245165d8d4f.png", // lavender twilight
  "https://d8j0ntlcm91z4.cloudfront.net/user_36WhJm9G1dLQpS5pEP9lbzca22L/hf_20260717_143103_5d77cb7d-91ce-40df-955a-076fbe275421.png"  // sky blue
];
const bgImages = BG_URLS.map(url => {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = url;
  return img;
});
function bgImageForLevel(idx) { return bgImages[idx % bgImages.length]; }

function drawBackground(ctx, W, H) {
  // instant fallback: colored diagonal wash (also shows if the image hasn't loaded)
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, bgTint[0]);
  grad.addColorStop(0.5, bgTint[1] || bgTint[0]);
  grad.addColorStop(1, bgTint[2] || bgTint[bgTint.length - 1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // the attractive image for this level, cover-fit across the viewport
  const img = bgImageForLevel(Game.levelIndex || 0);
  if (img && img.complete && img.naturalWidth > 0) {
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const scale = Math.max(W / iw, H / ih);
    const dw = iw * scale, dh = ih * scale;
    ctx.globalAlpha = 0.9;
    ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
    ctx.globalAlpha = 1;
  }

  // soft white scrim so the board and blocks stay clearly readable over the image
  ctx.fillStyle = "rgba(248,248,246,0.42)";
  ctx.fillRect(0, 0, W, H);

  // gentle center bloom to focus the play area
  const r = Math.max(W, H) * 0.8;
  const rg = ctx.createRadialGradient(W / 2, H * 0.42, r * 0.15, W / 2, H * 0.42, r);
  rg.addColorStop(0, "rgba(255,255,255,0.22)");
  rg.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, W, H);
}
function darker(hex) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  r = Math.round(r * 0.78); g = Math.round(g * 0.78); b = Math.round(b * 0.78);
  return `rgb(${r},${g},${b})`;
}

// ---------- seeded RNG (deterministic) ----------
function makeRNG(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// ---------- game state ----------
const Game = {
  screen: "menu",       // "menu" | "play"
  levelIndex: 0,
  mode: "levels",       // "levels" | "free"
  shape: null,          // active shape object
  lines: [],            // clearable lines for this shape
  cells: null,          // N x N of null | colorIndex
  score: 0,
  goal: 0,
  cleared: 0,           // lines cleared this level
  movesLeft: 0,
  tray: [],             // up to 3 pieces {info, color, used}
  rng: null,
  banner: null,         // {text, sub, until, kind}
  clearFx: [],          // [{cells:[{r,c}], color, t}]
  placeFx: [],          // [{cells:[{r,c}], t}] pop-in for freshly placed blocks
  confetti: [],         // celebration particles on level complete
  bannerT: 0,           // banner fade-in progress 0..1
  drag: null,           // active drag {slot, info, color, px, py, ox, oy}
  soundOn: true,
  bestLevel: 0,         // furthest level reached (persisted)
  bestScore: 0,         // best score (persisted)
  pieceSet: null        // piece defs available on the current level
};

// ---------- easing ----------
const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
const easeOutBack = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const clamp01 = t => t < 0 ? 0 : t > 1 ? 1 : t;

let assetsReady = false;

// ---------- layout ----------
const layout = { boardX: 0, boardY: 0, boardSize: 0, cell: 0, trayY: 0, traySlotW: 0 };

function computeLayout(W, H) {
  const pad = 16;
  const topBar = 92;      // HUD height
  const trayH = Math.min(150, H * 0.20);
  const avail = Math.min(W - pad * 2, H - topBar - trayH - pad * 2);
  const boardSize = Math.max(180, avail);
  layout.boardSize = boardSize;
  layout.cell = boardSize / N;
  layout.boardX = (W - boardSize) / 2;
  layout.boardY = topBar + Math.max(8, (H - topBar - trayH - boardSize) / 2);
  layout.trayY = layout.boardY + boardSize + 14;
  layout.trayH = trayH;
  layout.traySlotW = (Math.min(W - pad * 2, boardSize)) / 3;
  layout.trayX = (W - Math.min(W - pad * 2, boardSize)) / 2;
}

// ---------- level setup ----------
function startLevel(idx) {
  const cfg = levelConfig(idx);
  Game.levelIndex = idx;
  Game.shape = SHAPES[cfg.shape];
  Game.lines = clearableLines(Game.shape);
  Game.goal = cfg.goal;
  Game.movesLeft = cfg.moves;
  Game.cleared = 0;
  Game.cells = Array.from({ length: N }, () => Array(N).fill(null));
  Game.clearFx = [];
  Game.placeFx = [];
  Game.confetti = [];
  // each level gets its own color theme and its own pool of piece shapes
  BLOCKS = paletteForLevel(idx);
  bgTint = bgTintForLevel(idx);
  Game.pieceSet = pieceSetForLevel(idx);
  refillTray(true);
  // remember the furthest level reached and the best score so the player can resume
  Game.bestLevel = Math.max(Game.bestLevel || 0, idx);
  Game.bestScore = Math.max(Game.bestScore || 0, Game.score);
  saveProgress(Game.bestLevel, Game.bestScore);
}

function startGame(fromLevel) {
  Game.mode = "levels";
  Game.score = 0;
  Game.rng = makeRNG((Date.now() & 0x7fffffff) || 1);
  Game.screen = "play";
  Game.banner = null;
  startLevel(fromLevel | 0);
  if (Game.soundOn) AUDIO.startMusic();
}
function newGame() { clearProgress(); Game.bestLevel = 0; startGame(0); }
function continueGame() { startGame(loadProgress().level); }

// ---------- FREE PLAY: one endless open board, runs until no piece fits ----------
function startFreePlay() {
  Game.mode = "free";
  Game.score = 0;
  Game.cleared = 0;
  Game.rng = makeRNG((Date.now() & 0x7fffffff) || 1);
  Game.screen = "play";
  Game.banner = null;
  Game.levelIndex = 0;               // used only to rotate palette/background
  Game.shape = SHAPES.square;        // full open board = most room to keep going
  Game.lines = clearableLines(Game.shape);
  Game.goal = 0; Game.movesLeft = 0; // unused in free play
  Game.cells = Array.from({ length: N }, () => Array(N).fill(null));
  Game.clearFx = []; Game.placeFx = []; Game.confetti = [];
  BLOCKS = paletteForLevel(0);
  bgTint = bgTintForLevel(0);
  Game.pieceSet = pieceSetForLevel(9); // free play uses the full piece variety
  refillTray();
  if (Game.soundOn) AUDIO.startMusic();
}

// ---------- progress persistence (resume where you left off) ----------
const SAVE_KEY = "morphfit_progress_v1";
function loadProgress() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { level: 0, best: 0, freeBest: 0 };
    const p = JSON.parse(raw);
    return {
      level: Math.max(0, p.level | 0),
      best: Math.max(0, p.best | 0),
      freeBest: Math.max(0, p.freeBest | 0)
    };
  } catch (e) { return { level: 0, best: 0, freeBest: 0 }; }
}
function saveProgress(level, best, freeBest) {
  try {
    const cur = loadProgress();
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      level: level != null ? (level | 0) : cur.level,
      best: best != null ? (best | 0) : cur.best,
      freeBest: freeBest != null ? (freeBest | 0) : cur.freeBest
    }));
  } catch (e) { /* storage unavailable: game still works, just no resume */ }
}
function clearProgress() {
  // only clears LEVEL progress; the free-play high score is preserved
  try {
    const cur = loadProgress();
    localStorage.setItem(SAVE_KEY, JSON.stringify({ level: 0, best: 0, freeBest: cur.freeBest }));
  } catch (e) {}
}
function saveFreeBest(score) {
  const cur = loadProgress();
  if (score > cur.freeBest) saveProgress(null, null, score);
}

// ---------- tray ----------
// Piece pools by difficulty. Early levels use small, forgiving pieces; later
// levels progressively add the trickier tetromino shapes.
const PIECE_TIERS = {
  basic:  ["1x1", "1x2", "2x1", "1x3", "3x1", "2x2"],           // small & easy
  mid:    ["1x4", "4x1", "Ltri", "Ltri2", "Ltri3", "Ltri4"],   // L-triominoes, lines
  hard:   ["2x3", "Ltet", "Jtet", "Ttet", "Stet", "Ztet"],     // tetrominoes
  expert: ["3x3"]                                               // the big square
};
function idsToDefs(ids) { return ids.map(id => PIECES.find(p => p.id === id)).filter(Boolean); }

// Can this piece fit ANYWHERE on the shape's EMPTY board (mask only, ignore fills)?
// Used to keep pieces that literally can't sit on a sparse shape out of the pool.
function pieceFitsOnShape(shape, info) {
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      let ok = true;
      for (const cell of info.cells) {
        const rr = r + cell.r, cc = c + cell.c;
        if (rr < 0 || rr >= N || cc < 0 || cc >= N || !shape.active[rr][cc]) { ok = false; break; }
      }
      if (ok) return true;
    }
  }
  return false;
}

// Level pool = difficulty-appropriate ids, but ONLY those that can actually sit on
// this level's board shape. Sparse shapes (zigzag, cross) thus never offer big pieces.
function pieceSetForLevel(idx) {
  const shape = SHAPES[levelConfig(idx).shape];
  let ids = [...PIECE_TIERS.basic];
  if (idx >= 2) ids = ids.concat(PIECE_TIERS.mid);
  if (idx >= 5) ids = ids.concat(PIECE_TIERS.hard);
  if (idx >= 9) ids = ids.concat(PIECE_TIERS.expert);
  let defs = idsToDefs(ids).filter(def => pieceFitsOnShape(shape, pieceInfo(def)));
  // safety: never let the pool become empty (a shape with only single cells)
  if (!defs.length) defs = idsToDefs(["1x1", "1x2", "2x1"]).filter(def => pieceFitsOnShape(shape, pieceInfo(def)));
  if (!defs.length) defs = idsToDefs(["1x1"]);
  return defs;
}

function drawPieceFrom(pool) {
  const def = pool[Math.floor(Game.rng() * pool.length)];
  return { info: pieceInfo(def), color: Math.floor(Game.rng() * BLOCKS.length), used: false };
}

// Build a tray of 3 pieces where AT LEAST ONE fits the CURRENT board state, so the
// player is never handed a dead tray. Prefers pieces that fit; falls back safely.
function refillTray() {
  const pool = Game.pieceSet && Game.pieceSet.length ? Game.pieceSet : PIECES;
  const fitting = pool.filter(def => pieceFitsAnywhere(pieceInfo(def)));
  const tray = [];
  for (let i = 0; i < 3; i++) tray.push(drawPieceFrom(pool));
  // guarantee at least one placeable piece if any exists for the current board
  if (fitting.length && !tray.some(p => pieceFitsAnywhere(p.info))) {
    tray[0] = drawPieceFrom(fitting);
  }
  Game.tray = tray;
}
function trayEmpty() {
  return Game.tray.every(p => !p || p.used);
}
// Immediate stuck test: if NO remaining tray piece fits the current board, it's over.
// Called after any refill and after placement, in both modes, so a dead tray never sits.
function checkStuckNow() {
  if (Game.screen !== "play") return false;
  if (Game.banner && Game.banner.kind === "over") return true;
  if (!anyTrayPieceFits()) { gameOver(STR.noMoves); return true; }
  return false;
}

// ---------- placement logic ----------
function canPlaceAt(info, baseR, baseC) {
  for (const cell of info.cells) {
    const r = baseR + cell.r, c = baseC + cell.c;
    if (r < 0 || r >= N || c < 0 || c >= N) return false;
    if (!Game.shape.active[r][c]) return false;
    if (Game.cells[r][c] !== null) return false;
  }
  return true;
}
function pieceFitsAnywhere(info) {
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++)
      if (canPlaceAt(info, r, c)) return true;
  return false;
}
function anyTrayPieceFits() {
  return Game.tray.some(p => p && !p.used && pieceFitsAnywhere(p.info));
}

function placePiece(slot, baseR, baseC) {
  const p = Game.tray[slot];
  if (!p || p.used) return false;
  if (!canPlaceAt(p.info, baseR, baseC)) return false;
  const placed = [];
  for (const cell of p.info.cells) {
    const r = baseR + cell.r, c = baseC + cell.c;
    Game.cells[r][c] = p.color;
    placed.push({ r, c });
  }
  Game.placeFx.push({ cells: placed, t: 0 });
  p.used = true;
  if (Game.mode === "levels") Game.movesLeft--;
  if (Game.soundOn) AUDIO.play("place");
  resolveClears();
  if (trayEmpty()) refillTray();
  checkLevelState();
  return true;
}

function resolveClears() {
  const full = [];
  for (const line of Game.lines) {
    if (line.cells.every(({ r, c }) => Game.cells[r][c] !== null)) full.push(line);
  }
  if (full.length === 0) return;

  // gather cells to clear (dedupe) and pick a representative color per line for fx
  const toClear = new Set();
  for (const line of full) {
    const color = Game.cells[line.cells[0].r][line.cells[0].c];
    Game.clearFx.push({ cells: line.cells.slice(), color: (color ?? 0), t: 0 });
    for (const { r, c } of line.cells) toClear.add(r + "," + c);
  }
  for (const key of toClear) {
    const [r, c] = key.split(",").map(Number);
    Game.cells[r][c] = null;
  }
  const n = full.length;
  Game.cleared += n;
  // combo: base 100 per line, multiplier grows with simultaneous clears
  const mult = 1 + (n - 1) * 0.5;
  Game.score += Math.round(n * 100 * mult);
  if (Game.soundOn) AUDIO.play("clear", n);
}

function checkLevelState() {
  if (Game.mode === "free") {
    // keep the running high score fresh
    saveFreeBest(Game.score);
    // vary the look every few clears so a long run doesn't feel static
    const theme = Math.floor(Game.cleared / 6);
    BLOCKS = paletteForLevel(theme);
    bgTint = bgTintForLevel(theme);
    Game.levelIndex = theme; // confetti/colors follow the theme
    // free play ends only when no tray piece can be placed anywhere
    if (!anyTrayPieceFits()) return gameOver(STR.noMoves);
    return;
  }

  // ----- level mode -----
  // Win: goal reached
  if (Game.cleared >= Game.goal) {
    Game.score += Game.movesLeft * 20; // bonus for leftover moves
    Game.banner = { text: STR.levelClear, sub: STR.nextLevel, until: performance.now() + 2100, kind: "win" };
    Game.bannerT = 0;
    spawnConfetti();
    if (Game.soundOn) AUDIO.play("level");
    const next = Game.levelIndex + 1;
    setTimeout(() => {
      if (Game.screen === "play") { startLevel(next); Game.banner = null; }
    }, 2100);
    return;
  }
  // Lose: out of moves
  if (Game.movesLeft <= 0) return gameOver(STR.gameOver);
  // Lose: no tray piece fits anywhere
  if (!anyTrayPieceFits()) return gameOver(STR.noMoves);
}

function gameOver(reason) {
  let sub;
  if (Game.mode === "free") {
    saveFreeBest(Game.score);
    const hi = loadProgress().freeBest;
    sub = `${STR.scoreColon}: ${Game.score}   ·   ${STR.bestLabel}: ${hi}`;
  } else {
    Game.bestScore = Math.max(Game.bestScore || 0, Game.score);
    saveProgress(Game.bestLevel || Game.levelIndex, Game.bestScore);
    sub = STR.scoreColon + ": " + Game.score;
  }
  Game.banner = { text: reason, sub, until: Infinity, kind: "over" };
  Game.bannerT = 0;
  if (Game.soundOn) { AUDIO.play("over"); AUDIO.stopMusic(); }
}

// ---------- coordinate helpers ----------
function cellAtPixel(px, py) {
  const c = Math.floor((px - layout.boardX) / layout.cell);
  const r = Math.floor((py - layout.boardY) / layout.cell);
  if (r < 0 || r >= N || c < 0 || c >= N) return null;
  return { r, c };
}

// ---------- rendering ----------
function roundRect(ctx, x, y, w, h, rad) {
  const r = Math.min(rad, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawBlock(ctx, x, y, size, colorIndex, alpha = 1, scale = 1) {
  const pad = size * 0.06;
  let s = size - pad * 2;
  let cx = x + size / 2, cy = y + size / 2;
  // scale about the cell center for pop-in / shrink effects
  let dx = x + pad, dy = y + pad;
  if (scale !== 1) {
    const ns = s * scale;
    dx = cx - ns / 2; dy = cy - ns / 2; s = ns;
  }
  const col = BLOCKS[colorIndex] || BLOCKS[0];
  ctx.globalAlpha = alpha;
  roundRect(ctx, dx, dy, s, s, s * 0.16);
  ctx.fillStyle = col;
  ctx.fill();
  ctx.lineWidth = Math.max(1, size * 0.03);
  ctx.strokeStyle = darker(col);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function render(ctx, W, H, now) {
  ctx.clearRect(0, 0, W, H);
  drawBackground(ctx, W, H);

  if (Game.screen === "menu") return renderMenu(ctx, W, H);

  computeLayout(W, H);
  renderHUD(ctx, W, H);
  renderBoard(ctx, now);
  renderTray(ctx);
  renderDrag(ctx);
  renderBanner(ctx, W, H, now);
  renderConfetti(ctx); // celebration on top of everything
}

function renderHUD(ctx, W, H) {
  ctx.textBaseline = "alphabetic";
  // score (left)
  ctx.fillStyle = COL.textSoft;
  ctx.font = "600 13px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(STR.score, 18, 30);
  ctx.fillStyle = COL.text;
  ctx.font = "700 26px system-ui, sans-serif";
  ctx.fillText(String(Game.score), 18, 58);

  // center info: differs by mode
  ctx.textAlign = "center";
  ctx.fillStyle = COL.text;
  ctx.font = "700 16px system-ui, sans-serif";
  if (Game.mode === "free") {
    ctx.fillText(STR.freePlay, W / 2, 30);
    ctx.fillStyle = COL.textSoft;
    ctx.font = "500 13px system-ui, sans-serif";
    const hi = loadProgress().freeBest;
    ctx.fillText(
      `${Game.cleared} ${STR.linesWord} cleared   ·   ${STR.bestLabel}: ${hi}`,
      W / 2, 52
    );
  } else {
    const shapeName = STR.shapes[Game.shape.id] || Game.shape.id.toUpperCase();
    ctx.fillText(`${STR.level} ${Game.levelIndex + 1} · ${shapeName}`, W / 2, 30);
    ctx.fillStyle = COL.textSoft;
    ctx.font = "500 13px system-ui, sans-serif";
    ctx.fillText(
      `${STR.goalLabel}: ${Game.cleared}/${Game.goal} ${STR.linesWord}   ·   ${STR.movesLabel}: ${Game.movesLeft}`,
      W / 2, 52
    );
  }

  // --- top-right icon buttons: circular, soft, with vector icons ---
  const R = 18;                  // button radius
  const by = 20;
  const gap = 12;
  const rcx = W - 14 - R;        // restart button center x
  const scx = rcx - R * 2 - gap; // sound button center x
  const hcx = scx - R * 2 - gap; // home button center x
  const cy = by + R;

  drawIconButton(ctx, rcx, cy, R, "restart", false);
  Game._restartBtn = { x: rcx - R - 4, y: cy - R - 4, w: (R + 4) * 2, h: (R + 4) * 2 };

  drawIconButton(ctx, scx, cy, R, "sound", !Game.soundOn);
  Game._soundBtn = { x: scx - R - 4, y: cy - R - 4, w: (R + 4) * 2, h: (R + 4) * 2 };

  drawIconButton(ctx, hcx, cy, R, "home", false);
  Game._homeBtn = { x: hcx - R - 4, y: cy - R - 4, w: (R + 4) * 2, h: (R + 4) * 2 };
}

// A soft circular button with a crisp vector icon inside.
function drawIconButton(ctx, cx, cy, r, icon, muted) {
  // subtle shadow
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy + 1.5, r, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(43,43,43,0.10)";
  ctx.fill();
  // button face
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = COL.cellEdge;
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = COL.text;
  ctx.fillStyle = COL.text;
  ctx.lineWidth = 1.8;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (icon === "restart") {
    // circular refresh arrow: wide arc with an arrowhead at its end
    const rr = r * 0.44;
    const start = Math.PI * 0.30;
    const end = start + Math.PI * 1.66; // large sweep, small gap
    ctx.beginPath();
    ctx.arc(cx, cy, rr, start, end);
    ctx.stroke();
    const ex = cx + Math.cos(end) * rr;
    const ey = cy + Math.sin(end) * rr;
    const tang = end + Math.PI / 2;      // clockwise tangent at the end point
    const ah = r * 0.36, aw = r * 0.24;
    const tipx = ex + Math.cos(tang) * ah * 0.5;
    const tipy = ey + Math.sin(tang) * ah * 0.5;
    const backx = ex - Math.cos(tang) * ah * 0.5;
    const backy = ey - Math.sin(tang) * ah * 0.5;
    const nx = Math.cos(tang + Math.PI / 2), ny = Math.sin(tang + Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(tipx, tipy);
    ctx.lineTo(backx + nx * aw, backy + ny * aw);
    ctx.lineTo(backx - nx * aw, backy - ny * aw);
    ctx.closePath();
    ctx.fill();
  } else if (icon === "sound") {
    // speaker body
    const s = r * 0.5;
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.9, cy - s * 0.4);
    ctx.lineTo(cx - s * 0.35, cy - s * 0.4);
    ctx.lineTo(cx + s * 0.15, cy - s * 0.85);
    ctx.lineTo(cx + s * 0.15, cy + s * 0.85);
    ctx.lineTo(cx - s * 0.35, cy + s * 0.4);
    ctx.lineTo(cx - s * 0.9, cy + s * 0.4);
    ctx.closePath();
    ctx.fill();
    if (muted) {
      // an X to the right when muted
      ctx.beginPath();
      ctx.moveTo(cx + s * 0.5, cy - s * 0.45);
      ctx.lineTo(cx + s * 1.05, cy + s * 0.45);
      ctx.moveTo(cx + s * 1.05, cy - s * 0.45);
      ctx.lineTo(cx + s * 0.5, cy + s * 0.45);
      ctx.stroke();
    } else {
      // sound waves when on
      ctx.beginPath();
      ctx.arc(cx + s * 0.35, cy, s * 0.55, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + s * 0.35, cy, s * 0.95, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();
    }
  } else if (icon === "home") {
    // a simple house: roof triangle + walls + a small door
    const s = r * 0.52;
    const topY = cy - s * 0.8;
    const eaveY = cy - s * 0.15;
    const baseY = cy + s * 0.75;
    const left = cx - s * 0.8, right = cx + s * 0.8;
    ctx.beginPath();
    ctx.moveTo(left, eaveY);
    ctx.lineTo(cx, topY);
    ctx.lineTo(right, eaveY);
    ctx.stroke();
    const wl = cx - s * 0.62, wr = cx + s * 0.62;
    ctx.beginPath();
    ctx.moveTo(wl, eaveY);
    ctx.lineTo(wl, baseY);
    ctx.lineTo(wr, baseY);
    ctx.lineTo(wr, eaveY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.2, baseY);
    ctx.lineTo(cx - s * 0.2, cy + s * 0.2);
    ctx.lineTo(cx + s * 0.2, cy + s * 0.2);
    ctx.lineTo(cx + s * 0.2, baseY);
    ctx.stroke();
  }
  ctx.restore();
}

function renderBoard(ctx, now) {
  const { boardX, boardY, cell } = layout;
  // active cells
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (!Game.shape.active[r][c]) continue;
      const x = boardX + c * cell, y = boardY + r * cell;
      const g = cell * 0.05;
      roundRect(ctx, x + g, y + g, cell - g * 2, cell - g * 2, cell * 0.12);
      ctx.fillStyle = COL.cell;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = COL.cellEdge;
      ctx.stroke();
      const v = Game.cells[r][c];
      if (v !== null) {
        const pf = placeScaleAt(r, c);
        drawBlock(ctx, x, y, cell, v, 1, pf);
      }
    }
  }
  // clear flash fx: smooth shrink + fade
  for (const fx of Game.clearFx) {
    const e = easeOutCubic(fx.t);
    const a = (1 - e) * 0.95;
    const sc = 1 - e * 0.7;
    for (const { r, c } of fx.cells) {
      const x = boardX + c * cell, y = boardY + r * cell;
      drawBlock(ctx, x, y, cell, fx.color, a, sc);
    }
  }
}

// pop-in scale for a freshly placed cell (easeOutBack overshoot), 1 when settled
function placeScaleAt(r, c) {
  for (const fx of Game.placeFx) {
    for (const cell of fx.cells) {
      if (cell.r === r && cell.c === c) {
        const t = clamp01(fx.t);
        return 0.5 + easeOutBack(t) * 0.5; // 0.5 -> ~1 with a gentle overshoot
      }
    }
  }
  return 1;
}

function renderTray(ctx) {
  const { trayX, trayY, traySlotW, trayH } = layout;
  const slotInner = Math.min(traySlotW, trayH) * 0.82;
  for (let i = 0; i < 3; i++) {
    const p = Game.tray[i];
    const cx = trayX + traySlotW * i + traySlotW / 2;
    const cy = trayY + trayH / 2 - 6;
    if (!p || p.used) continue;
    if (Game.drag && Game.drag.slot === i) continue; // hidden while dragging
    drawTrayPiece(ctx, p, cx, cy, slotInner);
  }
}

function drawTrayPiece(ctx, p, cx, cy, box) {
  const info = p.info;
  const unit = box / Math.max(info.w, info.h) * 0.9;
  const totalW = info.w * unit, totalH = info.h * unit;
  const ox = cx - totalW / 2, oy = cy - totalH / 2;
  for (const { r, c } of info.cells) {
    drawBlock(ctx, ox + c * unit, oy + r * unit, unit, p.color);
  }
}

function renderDrag(ctx) {
  const d = Game.drag;
  if (!d) return;
  const cell = layout.cell;

  // ghost preview snapped to board
  const target = snappedTarget(d);
  if (target) {
    const ok = canPlaceAt(d.info, target.r, target.c);
    for (const c of d.info.cells) {
      const x = layout.boardX + (target.c + c.c) * cell;
      const y = layout.boardY + (target.r + c.r) * cell;
      const g = cell * 0.06;
      roundRect(ctx, x + g, y + g, cell - g * 2, cell - g * 2, cell * 0.14);
      ctx.fillStyle = ok ? COL.ghostOk : COL.ghostBad;
      ctx.fill();
    }
  }
  // floating piece under finger/cursor, drawn at the smoothed position
  const unit = cell;
  const px = (d.sx !== undefined ? d.sx : d.px);
  const py = (d.sy !== undefined ? d.sy : d.py);
  for (const c of d.info.cells) {
    const x = px - d.grabOx + c.c * unit;
    const y = py - d.grabOy + c.r * unit;
    drawBlock(ctx, x, y, unit, d.color, 0.94, 1.04); // slight lift
  }
}

// where on the board the dragged piece's origin currently snaps to
function snappedTarget(d) {
  const cell = layout.cell;
  const originX = d.px - d.grabOx;
  const originY = d.py - d.grabOy;
  const c = Math.round((originX - layout.boardX) / cell);
  const r = Math.round((originY - layout.boardY) / cell);
  if (r < -1 || r > N || c < -1 || c > N) return null;
  return { r, c };
}

function renderBanner(ctx, W, H, now) {
  const b = Game.banner;
  if (!b) return;
  if (b.until !== Infinity && now > b.until) { Game.banner = null; return; }
  const t = easeOutCubic(clamp01(Game.bannerT));
  const rise = (1 - t) * 14; // text slides up slightly as it fades in
  ctx.fillStyle = `rgba(244,244,242,${0.82 * t})`;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = t;
  ctx.textAlign = "center";
  ctx.fillStyle = COL.text;
  ctx.font = "800 34px system-ui, sans-serif";
  ctx.fillText(b.text, W / 2, H / 2 - 6 + rise);
  if (b.sub) {
    ctx.fillStyle = COL.textSoft;
    ctx.font = "500 18px system-ui, sans-serif";
    ctx.fillText(b.sub, W / 2, H / 2 + 26 + rise);
  }
  ctx.globalAlpha = 1;
  if (b.kind === "over") {
    const bw = 170, bh = 46, gap = 12;
    const totalW = bw * 2 + gap;
    const bx = (W - totalW) / 2, by = H / 2 + 52;
    // Play Again (filled)
    roundRect(ctx, bx, by, bw, bh, 12);
    ctx.fillStyle = COL.text; ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "700 15px system-ui, sans-serif";
    ctx.fillText(STR.playAgain, bx + bw / 2, by + bh / 2 + 5);
    Game._againBtn = { x: bx, y: by, w: bw, h: bh };
    // Menu (outlined)
    const mbx = bx + bw + gap;
    roundRect(ctx, mbx, by, bw, bh, 12);
    ctx.fillStyle = COL.panel; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = COL.cellEdge; ctx.stroke();
    ctx.fillStyle = COL.text;
    ctx.fillText(STR.menuBtn, mbx + bw / 2, by + bh / 2 + 5);
    Game._menuBtn = { x: mbx, y: by, w: bw, h: bh };
  } else {
    Game._againBtn = null;
    Game._menuBtn = null;
  }
}

function renderMenu(ctx, W, H) {
  ctx.textAlign = "center";
  ctx.fillStyle = COL.text;
  ctx.font = "800 clamp(40px, 9vw, 72px) system-ui, sans-serif";
  ctx.font = `800 ${Math.min(72, W * 0.11)}px system-ui, sans-serif`;
  ctx.fillText(STR.title, W / 2, H * 0.34);
  ctx.fillStyle = COL.textSoft;
  ctx.font = "500 16px system-ui, sans-serif";
  ctx.fillText(STR.subtitle, W / 2, H * 0.34 + 34);

  // little decorative diamond of blocks
  const u = Math.min(40, W * 0.08);
  const dcx = W / 2, dcy = H * 0.42;
  const offs = [[-u/2,-u],[ -u, 0],[0,0],[-u/2, u]];
  const dcols = [0,1,2,3];
  offs.forEach((o,i)=> drawBlock(ctx, dcx + o[0], dcy + o[1], u, dcols[i]));

  const prog = loadProgress();
  const hasSave = prog.level > 0;

  const bw = 240, bh = 52, bx = (W - bw) / 2;
  let y = H * 0.58;
  ctx.textAlign = "center";

  // Reset button refs
  Game._continueBtn = null; Game._levelsBtn = null; Game._freeBtn = null;

  // CONTINUE (only when there is level progress) - primary filled
  if (hasSave) {
    roundRect(ctx, bx, y, bw, bh, 14);
    ctx.fillStyle = COL.text; ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "700 19px system-ui, sans-serif";
    ctx.fillText(`${STR.continueLabel}  ·  ${STR.level} ${prog.level + 1}`, W / 2, y + bh / 2 + 6);
    Game._continueBtn = { x: bx, y, w: bw, h: bh };
    y += bh + 12;
  }

  // LEVELS button (filled if no save, outlined if continue is shown)
  roundRect(ctx, bx, y, bw, bh, 14);
  if (hasSave) { ctx.fillStyle = COL.panel; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = COL.cellEdge; ctx.stroke(); ctx.fillStyle = COL.text; }
  else { ctx.fillStyle = COL.text; ctx.fill(); ctx.fillStyle = "#fff"; }
  ctx.font = "700 18px system-ui, sans-serif";
  ctx.fillText(hasSave ? STR.newGame : STR.levelsMode, W / 2, y + bh / 2 + 6);
  Game._levelsBtn = { x: bx, y, w: bw, h: bh };
  y += bh + 12;

  // FREE PLAY button - outlined
  roundRect(ctx, bx, y, bw, bh, 14);
  ctx.fillStyle = COL.panel; ctx.fill();
  ctx.lineWidth = 1.5; ctx.strokeStyle = COL.cellEdge; ctx.stroke();
  ctx.fillStyle = COL.text;
  ctx.font = "700 18px system-ui, sans-serif";
  ctx.fillText(STR.freePlay, W / 2, y + bh / 2 + 6);
  Game._freeBtn = { x: bx, y, w: bw, h: bh };
  y += bh + 18;

  // best-score readouts
  ctx.fillStyle = "#A9A9A5";
  ctx.font = "500 13px system-ui, sans-serif";
  const bits = [];
  if (prog.best > 0) bits.push(`${STR.levelsMode} ${STR.bestLabel.toLowerCase()}: ${prog.best}`);
  if (prog.freeBest > 0) bits.push(`${STR.freePlay} ${STR.bestLabel.toLowerCase()}: ${prog.freeBest}`);
  if (bits.length) ctx.fillText(bits.join("     "), W / 2, y);

  ctx.fillStyle = "#B7B7B3";
  ctx.font = "500 12px system-ui, sans-serif";
  ctx.fillText(STR.version, W / 2, H - 20);
}

// ---------- input ----------
function hit(btn, x, y) {
  return btn && x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h;
}

function pointerDown(x, y) {
  if (Game.soundOn) AUDIO.resume();

  if (Game.screen === "menu") {
    if (hit(Game._continueBtn, x, y)) continueGame();
    else if (hit(Game._levelsBtn, x, y)) newGame();
    else if (hit(Game._freeBtn, x, y)) startFreePlay();
    return;
  }
  // banner buttons
  if (Game.banner && Game.banner.kind === "over") {
    // retry: free play restarts free play; levels resume from furthest level
    if (hit(Game._againBtn, x, y)) {
      Game.banner = null;
      if (Game.mode === "free") startFreePlay(); else continueGame();
    }
    if (hit(Game._menuBtn, x, y)) { Game.banner = null; Game.screen = "menu"; AUDIO.stopMusic(); }
    return;
  }
  if (Game.banner) return; // ignore during transient banners

  // HOME: return to the main menu
  if (hit(Game._homeBtn, x, y)) {
    Game.banner = null;
    Game.drag = null;
    Game.screen = "menu";
    AUDIO.stopMusic();
    return;
  }
  // in-game RESTART: free play restarts free play; levels replay current level
  if (hit(Game._restartBtn, x, y)) {
    if (Game.mode === "free") startFreePlay(); else startGame(Game.levelIndex);
    return;
  }
  if (hit(Game._soundBtn, x, y)) {
    Game.soundOn = !Game.soundOn;
    if (Game.soundOn) { AUDIO.resume(); AUDIO.startMusic(); } else AUDIO.stopMusic();
    return;
  }

  // start dragging a tray piece if pressed on one
  const slot = traySlotAt(x, y);
  if (slot !== -1) {
    const p = Game.tray[slot];
    if (p && !p.used) {
      // grab offset: put piece's top-left roughly above finger, lifted so it's visible
      const cell = layout.cell;
      const grabOx = (p.info.w * cell) / 2;
      const grabOy = p.info.h * cell + cell * 0.4; // lift above finger
      Game.drag = { slot, info: p.info, color: p.color, px: x, py: y, sx: x, sy: y, grabOx, grabOy };
    }
  }
}

function pointerMove(x, y) {
  if (Game.drag) { Game.drag.px = x; Game.drag.py = y; }
}

function pointerUp(x, y) {
  const d = Game.drag;
  if (!d) return;
  Game.drag = null;
  const target = snappedTarget({ ...d, px: x, py: y });
  if (target && canPlaceAt(d.info, target.r, target.c)) {
    placePiece(d.slot, target.r, target.c);
  }
  // invalid release: piece simply returns to tray (nothing to do)
}

function traySlotAt(x, y) {
  const { trayX, trayY, traySlotW, trayH } = layout;
  if (y < trayY - 10 || y > trayY + trayH + 10) return -1;
  for (let i = 0; i < 3; i++) {
    const sx = trayX + traySlotW * i;
    if (x >= sx && x <= sx + traySlotW) return i;
  }
  return -1;
}

// ---------- celebration confetti ----------
function spawnConfetti() {
  const W = window.innerWidth, H = window.innerHeight;
  const cols = paletteForLevel(Game.levelIndex);
  const parts = [];
  const count = 90;
  for (let i = 0; i < count; i++) {
    // burst from two upper points, arcing outward and falling
    const fromLeft = i % 2 === 0;
    const ox = fromLeft ? W * 0.28 : W * 0.72;
    const oy = H * 0.34;
    const ang = (fromLeft ? -0.5 : -Math.PI + 0.5) + (Math.random() - 0.5) * 1.4;
    const spd = 6 + Math.random() * 8;
    parts.push({
      x: ox, y: oy,
      vx: Math.cos(ang) * spd * (fromLeft ? 1 : -1),
      vy: -Math.abs(Math.sin(ang)) * spd - 3,
      size: 6 + Math.random() * 7,
      color: cols[(Math.random() * cols.length) | 0],
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      life: 0, ttl: 90 + Math.random() * 50,
      shape: Math.random() < 0.5 ? "sq" : "rc"
    });
  }
  Game.confetti = parts;
}

function updateConfetti() {
  if (!Game.confetti.length) return;
  for (const p of Game.confetti) {
    p.vy += 0.35;              // gravity
    p.vx *= 0.99; p.vy *= 0.99; // drag
    p.x += p.vx; p.y += p.vy;
    p.rot += p.vr;
    p.life++;
  }
  Game.confetti = Game.confetti.filter(p => p.life < p.ttl && p.y < window.innerHeight + 40);
}

function renderConfetti(ctx) {
  for (const p of Game.confetti) {
    const fade = p.life > p.ttl - 25 ? Math.max(0, (p.ttl - p.life) / 25) : 1;
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    if (p.shape === "sq") {
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
    } else {
      roundRect(ctx, -p.size / 2, -p.size / 2, p.size, p.size * 0.7, p.size * 0.2);
      ctx.fill();
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

// ---------- fx update ----------
function updateFx(dt) {
  for (const fx of Game.clearFx) fx.t += dt / 320;
  Game.clearFx = Game.clearFx.filter(fx => fx.t < 1);
  for (const fx of Game.placeFx) fx.t += dt / 260;
  Game.placeFx = Game.placeFx.filter(fx => fx.t < 1);
  updateConfetti();
  if (Game.banner) Game.bannerT = clamp01(Game.bannerT + dt / 240);
  // smooth the floating drag piece toward the pointer (snapping still uses raw pointer)
  const d = Game.drag;
  if (d) {
    if (d.sx === undefined) { d.sx = d.px; d.sy = d.py; }
    const k = 0.35; // higher = snappier, lower = floatier
    d.sx += (d.px - d.sx) * k;
    d.sy += (d.py - d.sy) * k;
  }
}

export function initGame(canvas) {
  const ctx = canvas.getContext("2d");
  const DPR_CAP = 2;
  let W = 0, H = 0;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resize);
  window.addEventListener("orientationchange", resize);
  resize();

  // pointer events unify mouse + touch
  function relPos(e) {
    const t = e.touches && e.touches[0] ? e.touches[0] : e.changedTouches && e.changedTouches[0] ? e.changedTouches[0] : e;
    return { x: t.clientX, y: t.clientY };
  }
  canvas.addEventListener("mousedown", e => { const p = relPos(e); pointerDown(p.x, p.y); });
  window.addEventListener("mousemove", e => { const p = relPos(e); pointerMove(p.x, p.y); });
  window.addEventListener("mouseup", e => { const p = relPos(e); pointerUp(p.x, p.y); });
  canvas.addEventListener("touchstart", e => { const p = relPos(e); pointerDown(p.x, p.y); e.preventDefault(); }, { passive: false });
  canvas.addEventListener("touchmove", e => { const p = relPos(e); pointerMove(p.x, p.y); e.preventDefault(); }, { passive: false });
  canvas.addEventListener("touchend", e => { const p = relPos(e); pointerUp(p.x, p.y); e.preventDefault(); }, { passive: false });

  // keyboard: R restart, M mute, Enter continue/play (physical key codes)
  window.addEventListener("keydown", e => {
    if (e.code === "KeyR" && Game.screen === "play") {
      if (Game.mode === "free") startFreePlay(); else startGame(Game.levelIndex);
    } else if (e.code === "KeyM") {
      Game.soundOn = !Game.soundOn;
      if (Game.soundOn) { AUDIO.resume(); AUDIO.startMusic(); } else AUDIO.stopMusic();
    } else if (e.code === "Enter" || e.code === "Space") {
      if (Game.screen === "menu") { loadProgress().level > 0 ? continueGame() : newGame(); }
      else if (Game.banner && Game.banner.kind === "over") {
        Game.banner = null;
        if (Game.mode === "free") startFreePlay(); else continueGame();
      }
    }
  });

  let last = performance.now(), acc = 0, paused = false;
  const STEP = 1000 / 60;
  window.addEventListener("blur", () => paused = true);
  window.addEventListener("focus", () => { paused = false; last = performance.now(); });

  const dev = new URLSearchParams(location.search).has("dev");
  const devEl = document.getElementById("dev");
  if (dev && devEl) devEl.style.display = "block";
  let frames = 0, fpsAt = last;

  function frame(now) {
    requestAnimationFrame(frame);
    if (paused) return;
    acc += now - last; last = now;
    try {
      while (acc >= STEP) { updateFx(STEP); acc -= STEP; }
      render(ctx, W, H, now);
    } catch (e) {
      console.error("frame error:", e);
    }
    if (dev && devEl) {
      frames++;
      if (now - fpsAt >= 500) {
        devEl.textContent = Math.round(frames * 1000 / (now - fpsAt)) + " fps";
        frames = 0; fpsAt = now;
      }
    }
  }
  requestAnimationFrame(frame);
}

export { Game };
