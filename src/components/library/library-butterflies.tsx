"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import Lottie from "lottie-react";
import { motion } from "framer-motion";

const LOTTIE_SOURCES = [
  "https://assets1.lottiefiles.com/packages/lf20_jcikwtux.json",
  "https://assets10.lottiefiles.com/packages/lf20_caom8mjg.json",
  "https://assets3.lottiefiles.com/packages/lf20_touohxv0.json",
];

type ButterflyFlight = {
  id: number;
  top: string;
  left: string;
  size: number;
  duration: number;
  delay: number;
  rotate: number;
  color: string;
  path: [number, number][];
};

const FLIGHTS: ButterflyFlight[] = [
  {
    id: 1,
    top: "8%",
    left: "4%",
    size: 72,
    duration: 22,
    delay: 0,
    rotate: -14,
    color: "#c4b5fd",
    path: [[0, 0], [130, -45], [260, 15], [390, -35], [520, 5]],
  },
  {
    id: 2,
    top: "22%",
    left: "78%",
    size: 56,
    duration: 26,
    delay: 3,
    rotate: 16,
    color: "#fbbf24",
    path: [[0, 0], [-95, 55], [-210, -15], [-330, 45], [-450, 0]],
  },
  {
    id: 3,
    top: "48%",
    left: "12%",
    size: 64,
    duration: 24,
    delay: 7,
    rotate: 8,
    color: "#f9a8d4",
    path: [[0, 0], [85, -65], [175, -25], [270, -75], [355, -35]],
  },
  {
    id: 4,
    top: "4%",
    left: "44%",
    size: 48,
    duration: 19,
    delay: 1.5,
    rotate: -6,
    color: "#e9d5ff",
    path: [[0, 0], [-65, 75], [45, 125], [150, 85], [235, 135]],
  },
  {
    id: 5,
    top: "68%",
    left: "58%",
    size: 52,
    duration: 27,
    delay: 5,
    rotate: 12,
    color: "#fde68a",
    path: [[0, 0], [-105, -35], [-190, 35], [-295, -5], [-375, 45]],
  },
];

async function loadButterflyLottie(): Promise<object | null> {
  for (const url of LOTTIE_SOURCES) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = (await res.json()) as { v?: string; layers?: unknown[] };
      if (data?.v && Array.isArray(data.layers)) return data;
    } catch {
      /* try next */
    }
  }
  return null;
}

function FlyingButterfly({
  flight,
  lottieData,
}: {
  flight: ButterflyFlight;
  lottieData: object | null;
}) {
  const xs = flight.path.map((p) => p[0]);
  const ys = flight.path.map((p) => p[1]);

  return (
    <motion.div
      className="lib-butterfly"
      style={{
        top: flight.top,
        left: flight.left,
        width: flight.size,
        height: flight.size,
        rotate: flight.rotate,
      }}
      initial={{ x: 0, y: 0, opacity: 0 }}
      animate={{ x: xs, y: ys, opacity: [0, 0.92, 0.92, 0.7, 0] }}
      transition={{
        duration: flight.duration,
        delay: flight.delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {lottieData ? (
        <Lottie animationData={lottieData} loop className="lib-butterfly-lottie" />
      ) : (
        <motion.div
          className="lib-butterfly-icon"
          animate={{ scaleX: [1, 0.72, 1], y: [0, -3, 0] }}
          transition={{ duration: 0.45, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon
            icon="game-icons:butterfly"
            width={flight.size}
            height={flight.size}
            style={{ color: flight.color, filter: "drop-shadow(0 0 10px rgba(245,197,24,0.55))" }}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

export function LibraryButterflies() {
  const [lottieData, setLottieData] = useState<object | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadButterflyLottie().then((data) => {
      if (!cancelled && data) setLottieData(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="lib-fx-layer lib-butterflies" aria-hidden>
      {FLIGHTS.map((flight) => (
        <FlyingButterfly key={flight.id} flight={flight} lottieData={lottieData} />
      ))}
    </div>
  );
}
