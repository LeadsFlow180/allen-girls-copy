type ContentBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const WHITE_THRESHOLD = 242;
const SAMPLE_STEP = 3;
const MIN_CONTENT_RATIO = 0.12;

function isBlankPixel(r: number, g: number, b: number, a: number): boolean {
  if (a < 12) return true;
  return r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD;
}

export function findCanvasContentBounds(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
): ContentBounds {
  const { data } = context.getImageData(0, 0, width, height);

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y += SAMPLE_STEP) {
    for (let x = 0; x < width; x += SAMPLE_STEP) {
      const index = (y * width + x) * 4;
      if (isBlankPixel(data[index], data[index + 1], data[index + 2], data[index + 3])) {
        continue;
      }

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX <= minX || maxY <= minY) {
    return { x: 0, y: 0, width, height };
  }

  const padX = Math.max(2, Math.round((maxX - minX) * 0.01));
  const padY = Math.max(2, Math.round((maxY - minY) * 0.01));

  const x = Math.max(0, minX - padX);
  const y = Math.max(0, minY - padY);
  const right = Math.min(width, maxX + padX);
  const bottom = Math.min(height, maxY + padY);
  const cropWidth = right - x;
  const cropHeight = bottom - y;

  if (cropWidth / width < MIN_CONTENT_RATIO || cropHeight / height < MIN_CONTENT_RATIO) {
    return { x: 0, y: 0, width, height };
  }

  return { x, y, width: cropWidth, height: cropHeight };
}

export function cropCanvasToContent(source: HTMLCanvasElement): HTMLCanvasElement {
  const context = source.getContext("2d");
  if (!context) return source;

  const bounds = findCanvasContentBounds(context, source.width, source.height);
  if (bounds.width === source.width && bounds.height === source.height) {
    return source;
  }

  const cropped = document.createElement("canvas");
  cropped.width = bounds.width;
  cropped.height = bounds.height;

  const croppedContext = cropped.getContext("2d");
  if (!croppedContext) return source;

  croppedContext.drawImage(
    source,
    bounds.x,
    bounds.y,
    bounds.width,
    bounds.height,
    0,
    0,
    bounds.width,
    bounds.height,
  );

  return cropped;
}
