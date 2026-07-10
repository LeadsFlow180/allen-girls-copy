import Image from "next/image";
import Link from "next/link";

import type { Course } from "@/db/schema";
import { Button } from "@/components/ui/button";

type UserProgressProps = {
  activeCourse: Course;
  hearts: number;
  points: number;
  hasActiveSubscription: boolean;
};

export function UserProgress({
  activeCourse,
  hearts,
  points,
  hasActiveSubscription,
}: UserProgressProps) {
  return (
    <div className="flex flex-col gap-y-4 rounded-xl border-2 p-4">
      <Link href="/courses">
        <div className="flex items-center gap-x-3">
          <Image src={activeCourse.imageSrc} alt="" height={32} width={40} />
          <h3 className="text-sm font-bold">{activeCourse.title}</h3>
        </div>
      </Link>
      <div className="flex items-center justify-between gap-x-2">
        <Image src="/points.svg" alt="Points" height={22} width={22} />
        <p className="text-neutral-600">{points} XP</p>
      </div>
      <div className="flex items-center justify-between gap-x-2">
        <Image src="/heart.svg" alt="Hearts" height={22} width={22} />
        <p className="text-neutral-600">
          {hasActiveSubscription ? "Unlimited" : hearts}
        </p>
      </div>
      {!hasActiveSubscription && (
        <Button asChild variant="default" className="w-full">
          <Link href="/shop">Upgrade</Link>
        </Button>
      )}
    </div>
  );
}
