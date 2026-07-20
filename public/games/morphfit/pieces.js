// Block Blast style polyomino pieces. No rotation (keeps placement tight and clean).
// Each piece is a list of {r,c} offsets from its top-left origin, plus a color index
// into the palette (assigned at draw time, so here we only define shapes).

export const PIECES = [
  { id: "1x1",   cells: [[0,0]] },
  { id: "1x2",   cells: [[0,0],[0,1]] },
  { id: "2x1",   cells: [[0,0],[1,0]] },
  { id: "1x3",   cells: [[0,0],[0,1],[0,2]] },
  { id: "3x1",   cells: [[0,0],[1,0],[2,0]] },
  { id: "1x4",   cells: [[0,0],[0,1],[0,2],[0,3]] },
  { id: "4x1",   cells: [[0,0],[1,0],[2,0],[3,0]] },
  { id: "2x2",   cells: [[0,0],[0,1],[1,0],[1,1]] },
  { id: "2x3",   cells: [[0,0],[0,1],[0,2],[1,0],[1,1],[1,2]] },
  { id: "3x3",   cells: [[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]] },
  { id: "Ltri",  cells: [[0,0],[1,0],[1,1]] },
  { id: "Ltri2", cells: [[0,0],[0,1],[1,0]] },
  { id: "Ltri3", cells: [[0,1],[1,0],[1,1]] },
  { id: "Ltri4", cells: [[0,0],[0,1],[1,1]] },
  { id: "Ltet",  cells: [[0,0],[1,0],[2,0],[2,1]] },
  { id: "Jtet",  cells: [[0,1],[1,1],[2,1],[2,0]] },
  { id: "Ttet",  cells: [[0,0],[0,1],[0,2],[1,1]] },
  { id: "Stet",  cells: [[0,1],[0,2],[1,0],[1,1]] },
  { id: "Ztet",  cells: [[0,0],[0,1],[1,1],[1,2]] }
];

// Normalize a piece into {w,h,cells:[{r,c}]} for convenience.
export function pieceInfo(def) {
  let maxR = 0, maxC = 0;
  const cells = def.cells.map(([r, c]) => {
    if (r > maxR) maxR = r;
    if (c > maxC) maxC = c;
    return { r, c };
  });
  return { id: def.id, cells, w: maxC + 1, h: maxR + 1, size: cells.length };
}
