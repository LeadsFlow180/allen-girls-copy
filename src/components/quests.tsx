import Image from "next/image";
import Link from "next/link";

import { Progress } from "@/components/ui/progress";
import { QUESTS } from "@/constants";

type QuestsProps = {
  points: number;
};

export function Quests({ points }: QuestsProps) {
  const quest = QUESTS[0];
  const progress = Math.min(100, (points / quest.value) * 100);

  return (
    <div className="space-y-4 rounded-xl border-2 p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold">Quests</h2>
        <Link href="/quests" className="text-sm font-semibold text-sky-600">
          View all
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <Image src="/points.svg" alt="" width={40} height={40} />
        <div className="flex-1">
          <p className="text-sm font-bold">{quest.title}</p>
          <Progress value={progress} className="mt-2 h-2" />
        </div>
      </div>
    </div>
  );
}
