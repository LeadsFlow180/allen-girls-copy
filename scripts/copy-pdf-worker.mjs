import fs from "node:fs";
import path from "node:path";

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

const workerSrc = path.join("node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs");
const workerDest = path.join("public", "library", "pdf.worker.min.mjs");
fs.mkdirSync(path.dirname(workerDest), { recursive: true });
fs.copyFileSync(workerSrc, workerDest);
console.log("Copied pdf.worker.min.mjs → public/library/");

copyDir(
  path.join("node_modules", "pdfjs-dist", "standard_fonts"),
  path.join("public", "library", "standard_fonts"),
);
console.log("Copied standard_fonts → public/library/standard_fonts/");

copyDir(
  path.join("node_modules", "pdfjs-dist", "cmaps"),
  path.join("public", "library", "cmaps"),
);
console.log("Copied cmaps → public/library/cmaps/");
