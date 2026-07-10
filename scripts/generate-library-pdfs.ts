/**
 * Generates PDF editions for all library novels into public/library/pdfs/.
 * Run: npm run generate:library-pdfs
 */
import fs from "node:fs";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import { LIBRARY_NOVELS } from "../src/lib/library/library-catalog";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 54;
const FONT_SIZE = 11;
const LINE_HEIGHT = 15;
const MAX_WIDTH = PAGE_WIDTH - MARGIN * 2;

function wrapLine(text: string, font: Awaited<ReturnType<PDFDocument["embedFont"]>>) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(test, FONT_SIZE) <= MAX_WIDTH) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function paginateText(
  text: string,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
) {
  const pages: string[][] = [];
  let current: string[] = [];
  const maxLines = Math.floor((PAGE_HEIGHT - MARGIN * 2) / LINE_HEIGHT);

  const paragraphs = text.split(/\n\n+/);
  for (const paragraph of paragraphs) {
    const lines = wrapLine(paragraph.replace(/\n/g, " ").trim(), font);
    for (const ln of lines) {
      if (current.length >= maxLines) {
        pages.push(current);
        current = [];
      }
      current.push(ln);
    }
    if (current.length >= maxLines) {
      pages.push(current);
      current = [];
    } else if (current.length > 0) {
      current.push("");
    }
  }
  if (current.length) pages.push(current);
  return pages;
}

async function buildPdf(title: string, author: string, body: string) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.TimesRoman);
  const bold = await pdf.embedFont(StandardFonts.TimesRomanBold);

  const cover = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  cover.drawText(title, {
    x: MARGIN,
    y: PAGE_HEIGHT - 120,
    size: 22,
    font: bold,
    color: rgb(0.48, 0.13, 0.77),
  });
  cover.drawText(author, {
    x: MARGIN,
    y: PAGE_HEIGHT - 155,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  cover.drawText("Allen Girls Adventures · Library Labyrinth Edition", {
    x: MARGIN,
    y: PAGE_HEIGHT - 185,
    size: 10,
    font,
    color: rgb(0.45, 0.45, 0.45),
  });

  const pageContents = paginateText(body, font);
  for (const lines of pageContents) {
    const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let y = PAGE_HEIGHT - MARGIN;
    for (const line of lines) {
      if (!line) {
        y -= LINE_HEIGHT * 0.6;
        continue;
      }
      page.drawText(line, { x: MARGIN, y, size: FONT_SIZE, font });
      y -= LINE_HEIGHT;
    }
  }

  return pdf.save();
}

async function main() {
  const outDir = path.join(process.cwd(), "public", "library", "pdfs");
  fs.mkdirSync(outDir, { recursive: true });

  for (const novel of LIBRARY_NOVELS) {
    const body = novel.spreads
      .flatMap((s) => [s.left, s.right])
      .filter(Boolean)
      .join("\n\n");

    const bytes = await buildPdf(novel.title, novel.author, body);
    const filename = `${novel.id}.pdf`;
    fs.writeFileSync(path.join(outDir, filename), bytes);
    console.log(`Wrote ${filename} (${novel.spreads.length} spreads)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
