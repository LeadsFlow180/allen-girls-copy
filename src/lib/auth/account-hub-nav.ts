export type AccountRole = "parent" | "student" | "teacher" | "super_admin";

export type HubNavItem = {
  id: string;
  href: string;
  label: string;
  shortLabel: string;
  emoji: string;
  /** Shown on this page when active */
  pageTitle: string;
  pageLead: string;
  howTo: string[];
};

const PARENT_NAV: HubNavItem[] = [
  {
    id: "account",
    href: "/account",
    label: "Home",
    shortLabel: "Home",
    emoji: "",
    pageTitle: "Family Controls",
    pageLead: "Your guardian dashboard for managing learners and viewing progress.",
    howTo: [
      "Open Family profiles to see every learner linked to your account.",
      "Use Add learner to create a new child sign-in.",
      "View Progress for slides, quizzes, quests, and skills.",
    ],
  },
  {
    id: "family",
    href: "/parent/children",
    label: "Family profiles",
    shortLabel: "Family",
    emoji: "",
    pageTitle: "Family profiles",
    pageLead: "Every learner linked to your account — verified, pending, and ready to learn.",
    howTo: [
      "Tap Add learner to create a new child sign-in.",
      "Each child uses their own email and password.",
      "Use Approve code if a child signed up alone and shared their learner code.",
    ],
  },
  {
    id: "add-child",
    href: "/parent/children/new",
    label: "Add learner",
    shortLabel: "Add",
    emoji: "",
    pageTitle: "Add learner",
    pageLead: "Create a verified child account with name, email, and password.",
    howTo: [
      "Enter their display name and a unique email.",
      "Choose a password and share it securely with your child.",
      "They sign in at Account, then start at the Learn hub.",
    ],
  },
  {
    id: "dashboard",
    href: "/parent/dashboard",
    label: "Progress",
    shortLabel: "Progress",
    emoji: "",
    pageTitle: "Progress dashboard",
    pageLead: "Review each child's placement, points, slides, quizzes, and missions.",
    howTo: [
      "Expand a child card to view detailed progress.",
      "Data appears after your child plays while signed in.",
      "Return to Family profiles to add another learner.",
    ],
  },
  {
    id: "reports",
    href: "/parent/reports",
    label: "Reports",
    shortLabel: "Reports",
    emoji: "",
    pageTitle: "Games report",
    pageLead: "Weekly games summary with download — sessions, accuracy, and points.",
    howTo: [
      "Pick 7, 14, or 30 days.",
      "Download CSV to share or keep for your records.",
      "Numbers update when learners play while signed in.",
    ],
  },
  {
    id: "approve",
    href: "/account/approve-learner",
    label: "Approve code",
    shortLabel: "Code",
    emoji: "",
    pageTitle: "Approve learner code",
    pageLead: "Enter the code from a self-enrolled child to link them to your account.",
    howTo: [
      "Ask your child for the 8-character code on their waiting screen.",
      "Enter it here to link and verify them.",
      "They can refresh or sign in again to unlock Learn and Rewards.",
    ],
  },
];

const STUDENT_NAV: HubNavItem[] = [
  {
    id: "account",
    href: "/account",
    label: "Dashboard",
    shortLabel: "Home",
    emoji: "🎒",
    pageTitle: "Dashboard",
    pageLead: "Your learner home — progress and shortcuts to learning.",
    howTo: [],
  },
  {
    id: "learn",
    href: "/learn/explore",
    label: "Learn",
    shortLabel: "Learn",
    emoji: "✨",
    pageTitle: "Learn",
    pageLead: "Open the world map to continue lessons, slides, and quizzes.",
    howTo: [],
  },
  {
    id: "achievements",
    href: "/learn/achievements",
    label: "Rewards",
    shortLabel: "Rewards",
    emoji: "🏆",
    pageTitle: "Rewards",
    pageLead: "View XP, badges, streaks, and achievements.",
    howTo: [],
  },
];

const STUDENT_PENDING_NAV: HubNavItem[] = [
  {
    id: "pending",
    href: "/account/pending-approval",
    label: "Pending approval",
    shortLabel: "Pending",
    emoji: "⏳",
    pageTitle: "Waiting for parent approval",
    pageLead:
      "Share the code below with your parent or guardian. They enter it in Family Controls to activate your account.",
    howTo: [],
  },
];

const TEACHER_NAV: HubNavItem[] = [
  {
    id: "account",
    href: "/account",
    label: "Home",
    shortLabel: "Home",
    emoji: "🏫",
    pageTitle: "Educator Command Center",
    pageLead: "Your classroom tools — built for teachers, not parents or students.",
    howTo: [
      "Open Classroom dashboard to see linked students.",
      "Use Add student when a learner shares their approval code with you.",
    ],
  },
  {
    id: "classroom",
    href: "/teacher/dashboard",
    label: "Classroom",
    shortLabel: "Class",
    emoji: "📋",
    pageTitle: "Classroom dashboard",
    pageLead: "Manage students linked to your teacher account.",
    howTo: ["Review student progress from your dashboard.", "Link new students with their learner code."],
  },
  {
    id: "reports",
    href: "/teacher/reports",
    label: "Reports",
    shortLabel: "Reports",
    emoji: "📊",
    pageTitle: "Games report",
    pageLead: "Weekly class games summary with CSV download.",
    howTo: [
      "Pick 7, 14, or 30 days.",
      "Download CSV for conferences or your records.",
      "Data appears after students play while signed in.",
    ],
  },
  {
    id: "link-student",
    href: "/teacher/link-student",
    label: "Add student",
    shortLabel: "Add",
    emoji: "➕",
    pageTitle: "Add a student",
    pageLead: "Connect a learner using the code from their account page.",
    howTo: ["Ask the student for their approval code.", "Enter it here to link them to your class."],
  },
];

const SUPER_ADMIN_NAV: HubNavItem[] = [
  {
    id: "admin",
    href: "/admin",
    label: "Super Admin",
    shortLabel: "Admin",
    emoji: "🛡️",
    pageTitle: "Super Admin",
    pageLead: "Manage all users, library stories, and platform operations.",
    howTo: [
      "Review every account, role, and learning progress.",
      "Upload and edit library stories from the Library section.",
    ],
  },
  {
    id: "library",
    href: "/admin/library",
    label: "Library",
    shortLabel: "Library",
    emoji: "📚",
    pageTitle: "Library Command Center",
    pageLead: "Upload stories, replace covers, and manage the shared catalog.",
    howTo: [
      "Click Upload all 42 to Supabase to sync built-in books.",
      "Use New story to add books with custom covers and chapters.",
    ],
  },
];

export function getHubNavForRole(role: AccountRole, options?: { studentPending?: boolean }): HubNavItem[] {
  if (role === "super_admin") return SUPER_ADMIN_NAV;
  if (role === "parent") return PARENT_NAV;
  if (role === "teacher") return TEACHER_NAV;
  if (options?.studentPending) return STUDENT_PENDING_NAV;
  return STUDENT_NAV;
}

/** Whether this hub tab should show as active for the current URL. */
export function isHubNavItemActive(pathname: string, item: HubNavItem, role: AccountRole): boolean {
  if (pathname === item.href) return true;

  if (role === "student") {
    if (item.id === "learn") {
      return pathname.startsWith("/learn") && !pathname.startsWith("/learn/achievements");
    }
    if (item.id === "achievements") {
      return pathname.startsWith("/learn/achievements");
    }
  }

  if (role === "parent") {
    if (item.id === "family") {
      return (
        pathname === "/parent/children" ||
        (pathname.startsWith("/parent/children/") && pathname !== "/parent/children/new")
      );
    }
    if (item.id === "add-child") return pathname === "/parent/children/new";
    if (item.id === "dashboard") return pathname.startsWith("/parent/dashboard");
    if (item.id === "reports") {
      return pathname.startsWith("/parent/reports") || pathname.startsWith("/parent/progress");
    }
  }

  if (role === "teacher") {
    if (item.id === "classroom") return pathname.startsWith("/teacher/dashboard");
    if (item.id === "reports") return pathname.startsWith("/teacher/reports");
    if (item.id === "link-student") return pathname.startsWith("/teacher/link-student");
  }

  if (role === "super_admin") {
    if (item.id === "library") return pathname.startsWith("/admin/library");
    if (item.id === "admin") return pathname === "/admin" || pathname.startsWith("/admin/users");
  }

  return false;
}

export function getActiveHubItem(role: AccountRole, pathname: string, studentPending?: boolean): HubNavItem {
  const nav = getHubNavForRole(role, { studentPending });
  const matched = nav.find((item) => isHubNavItemActive(pathname, item, role));
  if (matched) return matched;

  if (pathname === "/parent/children/new") {
    return nav.find((item) => item.id === "add-child") ?? nav[0];
  }
  if (pathname.startsWith("/parent/")) {
    return nav.find((item) => item.id === "family") ?? nav[0];
  }
  return nav[0];
}
