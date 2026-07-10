"use client";

import { useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { ShopCatalogItem } from "@/lib/learn/shop-catalog";

import { StoreProductCard } from "./store-product-card";
import styles from "./magical-store.module.css";

type Props = {
  items: ShopCatalogItem[];
  selectedId: string | null;
  ownedIds: Set<string>;
  onSelect: (item: ShopCatalogItem, index: number) => void;
  onScrollProgress: (progress: number) => void;
};

function isItemOwned(item: ShopCatalogItem, ownedIds: Set<string>): boolean {
  return ownedIds.has(item.id);
}

export function StoreCarousel({
  items,
  selectedId,
  ownedIds,
  onSelect,
  onScrollProgress,
}: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
    slidesToScroll: 1,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onScroll = () => {
      onScrollProgress(emblaApi.scrollProgress());
    };

    emblaApi.on("scroll", onScroll);
    emblaApi.on("reInit", onScroll);
    onScroll();

    return () => {
      emblaApi.off("scroll", onScroll);
      emblaApi.off("reInit", onScroll);
    };
  }, [emblaApi, onScrollProgress]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
  }, [emblaApi, items]);

  return (
    <div className={styles.carouselShell}>
      <button
        type="button"
        className={`${styles.carouselNav} ${styles.carouselNavPrev}`}
        aria-label="Previous items"
        onClick={scrollPrev}
      >
        <ChevronLeft size={18} />
      </button>

      <div className={styles.carouselViewport} ref={emblaRef}>
        <div className={styles.carouselTrack}>
          {items.map((item) => (
            <div key={item.id} className={styles.carouselSlide}>
              <StoreProductCard
                item={item}
                selected={selectedId === item.id}
                owned={isItemOwned(item, ownedIds)}
                onSelect={() => {
                  const index = items.findIndex((i) => i.id === item.id);
                  onSelect(item, index);
                  emblaApi?.scrollTo(index);
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        className={`${styles.carouselNav} ${styles.carouselNavNext}`}
        aria-label="Next items"
        onClick={scrollNext}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
