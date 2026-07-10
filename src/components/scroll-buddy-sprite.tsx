"use client";

import { useEffect, useState } from "react";
import type { StaticImageData } from "next/image";
import { imageToTransparentDataUrl } from "@/lib/images/strip-checkerboard-background";

const cache = new Map<string, string>();

type ScrollBuddySpriteProps = {
  src: StaticImageData;
  className?: string;
  alt?: string;
};

export function ScrollBuddySprite({
  src,
  className,
  alt = "",
}: ScrollBuddySpriteProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(() =>
    cache.get(src.src) ?? null,
  );

  useEffect(() => {
    const cached = cache.get(src.src);
    if (cached) {
      setDataUrl(cached);
      return;
    }

    let cancelled = false;
    const img = new window.Image();
    img.decoding = "async";
    img.onload = () => {
      if (cancelled) return;
      try {
        const url = imageToTransparentDataUrl(img);
        cache.set(src.src, url);
        setDataUrl(url);
      } catch {
        setDataUrl(src.src);
      }
    };
    img.onerror = () => {
      if (!cancelled) setDataUrl(src.src);
    };
    img.src = src.src;

    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!dataUrl) {
    return <span className={className} aria-hidden />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- processed canvas data URL
    <img src={dataUrl} alt={alt} className={className} draggable={false} />
  );
}
