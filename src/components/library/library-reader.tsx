"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import type { LibraryNovel } from "@/lib/library/library-catalog";
import { novelHasTextEdition } from "@/lib/library/novel-pdf-edition";

import { LibraryPageReader } from "./library-page-reader";

const LibraryFlipbookReader = dynamic(
  () => import("./library-flipbook-reader").then((m) => m.LibraryFlipbookReader),
  {
    ssr: false,
    loading: () => (
      <div style={{ padding: "2rem", textAlign: "center", color: "#e9d5ff" }}>
        Opening flip book…
      </div>
    ),
  },
);

type Props = {
  novel: LibraryNovel;
  onClose: () => void;
  mode?: "text" | "pdf";
};

export function LibraryReader({ novel, onClose, mode: initialMode = "text" }: Props) {
  const [mode, setMode] = useState<"text" | "pdf">(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [novel.id, initialMode]);

  if (mode === "pdf") {
    return (
      <LibraryFlipbookReader
        novel={novel}
        onClose={onClose}
        onReadOnline={novelHasTextEdition(novel) ? () => setMode("text") : undefined}
      />
    );
  }

  return <LibraryPageReader novel={novel} onClose={onClose} />;
}
