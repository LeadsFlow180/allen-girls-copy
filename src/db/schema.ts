/** Drizzle-style table stubs for legacy lesson / (main) routes */

function table<T>() {
  return {
    $inferSelect: {} as T,
    $inferInsert: {} as Partial<T>,
  };
}

export type Course = {
  id: number;
  title: string;
  imageSrc: string;
};

export type UserProgressRow = {
  userId: string;
  userName: string;
  userImageSrc: string;
  hearts: number;
  points: number;
  activeCourseId: number | null;
};

export type Unit = {
  id: number;
  title: string;
  description: string;
  courseId: number;
  order: number;
};

export type Lesson = {
  id: number;
  title: string;
  unitId: number;
  order: number;
};

export type Challenge = {
  id: number;
  lessonId: number;
  type: "SELECT" | "ASSIST";
  question: string;
  order: number;
};

export type ChallengeOption = {
  id: number;
  challengeId: number;
  text: string;
  correct: boolean;
  imageSrc: string | null;
};

export type UserSubscription = {
  id: number;
  userId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  stripeCurrentPeriodEnd: Date | null;
};

export const courses = table<Course>();
export const userProgress = table<UserProgressRow>();
export const units = table<Unit>();
export const lessons = table<Lesson>();
export const challenges = table<Challenge>();
export const challengeOptions = table<ChallengeOption>();
export const userSubscription = table<UserSubscription>();
