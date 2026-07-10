"use client";

import Image from "next/image";
import type { StaticImageData } from "next/image";

import { LIBRARY_COVER_ASPECT } from "@/lib/library/library-art";

type Props = {
  src: string | StaticImageData;
  alt: string;
  className?: string;
  sizes?: string;
};

export function LibraryCoverImage({ src, alt, className, sizes }: Props) {
  if (typeof src === "string") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ width: "100%", height: "auto", aspectRatio: String(LIBRARY_COVER_ASPECT) }}
        loading="lazy"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={src.width}
      height={src.height}
      className={className}
      sizes={sizes ?? "(max-width: 560px) 48vw, (max-width: 900px) 32vw, 22vw"}
      quality={100}
    />
  );
}

export function resolveLibraryCoverSrc(
  novelId: string,
  coverUrl: string | null | undefined,
  staticCovers: Record<string, StaticImageData>,
): string | StaticImageData | null {
  if (coverUrl?.trim()) return coverUrl;
  return staticCovers[novelId] ?? null;
}
