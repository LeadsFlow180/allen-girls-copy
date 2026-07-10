import type {
  Course,
  Challenge,
  ChallengeOption,
  Lesson,
  userSubscription,
} from "./schema";

export type UserProgressWithCourse = {
  userId: string;
  userName: string;
  userImageSrc: string;
  hearts: number;
  points: number;
  activeCourseId: number | null;
  activeCourse: Course | null;
};

export type LessonWithChallenges = Lesson & {
  challenges: (Challenge & {
    completed: boolean;
    challengeOptions: ChallengeOption[];
  })[];
};

const DEMO_COURSES: Course[] = [
  { id: 1, title: "Spanish", imageSrc: "/es.svg" },
  { id: 2, title: "French", imageSrc: "/fr.svg" },
];

const DEMO_USER: UserProgressWithCourse = {
  userId: "demo-user",
  userName: "Explorer",
  userImageSrc: "/mascot.svg",
  hearts: 5,
  points: 0,
  activeCourseId: 1,
  activeCourse: DEMO_COURSES[0],
};

const DEMO_LESSON: LessonWithChallenges = {
  id: 1,
  title: "Intro",
  unitId: 1,
  order: 1,
  challenges: [
    {
      id: 1,
      lessonId: 1,
      type: "SELECT",
      question: "How do you say hello?",
      order: 1,
      completed: false,
      challengeOptions: [
        { id: 1, challengeId: 1, text: "Hola", correct: true, imageSrc: null },
        { id: 2, challengeId: 1, text: "Adiós", correct: false, imageSrc: null },
        { id: 3, challengeId: 1, text: "Gracias", correct: false, imageSrc: null },
      ],
    },
  ],
};

export async function getCourses(): Promise<Course[]> {
  return DEMO_COURSES;
}

export async function getUserProgress(): Promise<UserProgressWithCourse | null> {
  return DEMO_USER;
}

export async function getUserSubscription(): Promise<
  (typeof userSubscription.$inferSelect & { isActive: boolean }) | null
> {
  return {
    id: 1,
    userId: DEMO_USER.userId,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    stripePriceId: null,
    stripeCurrentPeriodEnd: null,
    isActive: false,
  };
}

export async function getTopTenUsers(): Promise<UserProgressWithCourse[]> {
  return [DEMO_USER];
}

export async function getLesson(
  lessonId?: number,
): Promise<LessonWithChallenges | null> {
  if (lessonId === undefined || lessonId === 1) return DEMO_LESSON;
  return null;
}
