/** Remove Gemini-style fake transparency (checkerboard baked into PNG pixels). */
function isBackgroundPixel(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const sat = max === 0 ? 0 : (max - min) / max;
  const neutral = Math.abs(r - g) < 14 && Math.abs(g - b) < 14;

  if (!neutral) return false;

  // White checker cells
  if (lum >= 235 && sat <= 0.08) return true;
  // Light / mid gray checker cells
  if (lum >= 155 && lum < 235 && sat <= 0.1) return true;
  if (lum >= 95 && lum < 155 && sat <= 0.08) return true;

  return false;
}

export function stripCheckerboardBackground(imageData: ImageData): ImageData {
  const { width, height, data } = imageData;
  const out = new Uint8ClampedArray(data);
  const visited = new Uint8Array(width * height);
  const queue: number[] = [];

  const idx = (x: number, y: number) => y * width + x;

  const isBgAt = (x: number, y: number) => {
    const i = idx(x, y) * 4;
    return isBackgroundPixel(data[i], data[i + 1], data[i + 2]);
  };

  const seed = (x: number, y: number) => {
    const p = idx(x, y);
    if (!visited[p] && isBgAt(x, y)) {
      visited[p] = 1;
      queue.push(x, y);
    }
  };

  for (let x = 0; x < width; x++) {
    seed(x, 0);
    seed(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    seed(0, y);
    seed(width - 1, y);
  }

  while (queue.length > 0) {
    const y = queue.pop()!;
    const x = queue.pop()!;
    const p = idx(x, y);
    const i = p * 4;
    out[i + 3] = 0;

    const neighbors: [number, number][] = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ];

    for (const [nx, ny] of neighbors) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const np = idx(nx, ny);
      if (!visited[np] && isBgAt(nx, ny)) {
        visited[np] = 1;
        queue.push(nx, ny);
      }
    }
  }

  return new ImageData(out, width, height);
}

export function imageToTransparentDataUrl(img: HTMLImageElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return img.src;

  ctx.drawImage(img, 0, 0);
  const raw = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const cleaned = stripCheckerboardBackground(raw);
  ctx.putImageData(cleaned, 0, 0);
  return canvas.toDataURL("image/png");
}
