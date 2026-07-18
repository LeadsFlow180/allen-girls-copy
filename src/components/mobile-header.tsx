"use client";

import Link from "next/link";

export function MobileHeader() {
  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-[50px] items-center border-b bg-white px-4 lg:hidden">
      <Link href="/worlds" className="text-lg font-bold text-lime-600">
        Allen Girls Adventures
      </Link>
    </header>
  );
}
