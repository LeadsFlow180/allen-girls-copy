export type PdfFlipSpread = {
  left: number | null;
  right: number | null;
};

export function buildPdfFlipSpreads(totalPages: number): PdfFlipSpread[] {
  if (totalPages <= 0) return [];

  const spreads: PdfFlipSpread[] = [{ left: null, right: 1 }];

  for (let page = 2; page <= totalPages; page += 2) {
    spreads.push({
      left: page,
      right: page + 1 <= totalPages ? page + 1 : null,
    });
  }

  return spreads;
}
