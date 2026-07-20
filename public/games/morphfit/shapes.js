// Board shape definitions. Every level uses an 8x8 grid, but only some cells are
// "active" (playable). The active-cell mask is what changes the board's shape and
// makes previously-easy placements hard. Each shape also declares which lines
// (rows, cols, diagonals) count as clearable groups of active cells.

export const N = 8; // grid is always N x N

// A shape provides active(r,c) -> bool. Lines are derived generically from it,
// with diagonals switched on per shape.
function make(id, activeFn, opts = {}) {
  const active = [];
  for (let r = 0; r < N; r++) {
    active[r] = [];
    for (let c = 0; c < N; c++) active[r][c] = !!activeFn(r, c);
  }
  return { id, active, diagonals: !!opts.diagonals };
}

const center = (N - 1) / 2; // 3.5

export const SHAPES = {
  // All 64 cells active.
  square: make("square", () => true),

  // Centered triangle widening downward: row r has (2r+1) active cells, centered,
  // clamped to the 8-wide board.
  pyramid: make("pyramid", (r, c) => {
    const half = r; // cells either side of center on this row
    return c >= center - half && c <= center + half;
  }),

  // Manhattan-distance diamond: wide middle, pinched corners. Diagonals clearable.
  diamond: make("diamond", (r, c) => {
    return Math.abs(r - center) + Math.abs(c - center) <= 4.5;
  }, { diagonals: true }),

  // A plus/cross: central columns and central rows only. Diagonals off.
  cross: make("cross", (r, c) => {
    const inCol = c === 3 || c === 4;
    const inRow = r === 3 || r === 4;
    return inCol || inRow;
  }),

  // Hourglass: wide top and bottom, pinched middle.
  hourglass: make("hourglass", (r, c) => {
    const d = Math.abs(r - center); // 0.5 .. 3.5
    // width grows with distance from center row
    const half = Math.floor(d) + 1; // middle rows narrow, edge rows wide
    return c >= center - half && c <= center + half;
  }),

  // Frame: only the outer ring, hollow center.
  frame: make("frame", (r, c) => {
    return r === 0 || r === N - 1 || c === 0 || c === N - 1;
  }),

  // Chevron / V: an upward-opening V band.
  chevron: make("chevron", (r, c) => {
    const dist = Math.abs(c - center);
    // active where the row is near the V arms: row grows toward the bottom center
    return Math.abs((N - 1 - r) - dist) <= 1;
  }),

  // Arrow: a downward-pointing arrow (triangle head + a short shaft).
  arrow: make("arrow", (r, c) => {
    const head = r <= 4 && c >= center - r && c <= center + r; // widening triangle
    const shaft = r >= 5 && (c === 3 || c === 4);
    return head || shaft;
  }),

  // Octagon: square with the four corners clipped.
  octagon: make("octagon", (r, c) => {
    const corner = (r + c < 2) || (r + (N - 1 - c) < 2) ||
                   ((N - 1 - r) + c < 2) || ((N - 1 - r) + (N - 1 - c) < 2);
    return !corner;
  }, { diagonals: true }),

  // Zigzag: diagonal staircase bands across the board.
  zigzag: make("zigzag", (r, c) => {
    return ((r + c) % 4 === 0) || ((r + c) % 4 === 1);
  }),

  // Bowtie: two triangles meeting at the center (pinched horizontally in the middle rows).
  bowtie: make("bowtie", (r, c) => {
    const half = Math.abs(r - center) + 0.5; // narrow at center rows, wide at top/bottom
    return c >= center - half && c <= center + half && (c <= 3 ? c >= center - half : c <= center + half);
  }),

  // Columns: alternating vertical stripes (tall bars with gaps between).
  bars: make("bars", (r, c) => {
    return c === 1 || c === 2 || c === 5 || c === 6;
  }),

  // Butterfly: diamond with a notch, symmetric wings.
  butterfly: make("butterfly", (r, c) => {
    const d = Math.abs(r - center) + Math.abs(c - center);
    const wing = d <= 4.5;
    const notch = Math.abs(c - center) < 0.6 && Math.abs(r - center) > 1.5; // hollow vertical center
    return wing && !notch;
  }, { diagonals: true })
};

// Level order: shape id + goal (lines to clear) + move limit.
// Early levels are deliberately generous so the opening is welcoming; difficulty
// ramps gradually. The sequence rotates through many shapes for variety.
export const LEVELS = [
  { shape: "square",    goal: 3, moves: 22 },  // easy warm-up
  { shape: "bars",      goal: 3, moves: 20 },
  { shape: "pyramid",   goal: 4, moves: 20 },
  { shape: "octagon",   goal: 4, moves: 18 },
  { shape: "diamond",   goal: 4, moves: 18 },
  { shape: "chevron",   goal: 4, moves: 18 },
  { shape: "hourglass", goal: 5, moves: 18 },
  { shape: "arrow",     goal: 5, moves: 16 },
  { shape: "zigzag",    goal: 5, moves: 16 },
  { shape: "cross",     goal: 5, moves: 16 },
  { shape: "butterfly", goal: 5, moves: 16 },
  { shape: "frame",     goal: 6, moves: 16 }
];

// After the base list, levels loop with escalating goals; moves stay generous so
// it gets harder through goals/shape, not by starving the player of moves.
export function levelConfig(levelIndex) {
  const base = LEVELS[levelIndex % LEVELS.length];
  const loop = Math.floor(levelIndex / LEVELS.length); // 0 on first pass
  return {
    shape: base.shape,
    goal: base.goal + loop * 2,
    moves: base.moves + loop * 2 // more moves each loop to match the higher goal
  };
}

// Build the list of clearable lines for a shape's active grid.
// Each line is an array of {r,c} of active cells. A line clears when all its cells
// are filled. Only lines with 2+ active cells count (a single cell is not a "line").
export function clearableLines(shape) {
  const lines = [];
  const A = shape.active;

  // rows
  for (let r = 0; r < N; r++) {
    const cells = [];
    for (let c = 0; c < N; c++) if (A[r][c]) cells.push({ r, c });
    if (cells.length >= 2) lines.push({ kind: "row", cells });
  }
  // cols
  for (let c = 0; c < N; c++) {
    const cells = [];
    for (let r = 0; r < N; r++) if (A[r][c]) cells.push({ r, c });
    if (cells.length >= 2) lines.push({ kind: "col", cells });
  }
  // diagonals (only when enabled)
  if (shape.diagonals) {
    const d1 = [], d2 = [];
    for (let i = 0; i < N; i++) {
      if (A[i][i]) d1.push({ r: i, c: i });
      if (A[i][N - 1 - i]) d2.push({ r: i, c: N - 1 - i });
    }
    if (d1.length >= 2) lines.push({ kind: "diag", cells: d1 });
    if (d2.length >= 2) lines.push({ kind: "diag", cells: d2 });
  }
  return lines;
}
