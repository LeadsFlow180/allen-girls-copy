/** Accent colors for 3D course cards */
export const COURSE_ACCENT: Record<string, string> = {
  es: "#58cc02",
  fr: "#1cb0f6",
  ja: "#ff4b4b",
  de: "#7c22c5",
  ko: "#e8357a",
  it: "#ff9600",
  pt: "#22c55e",
  ru: "#6366f1",
  tr: "#ef4444",
  nl: "#f59e0b",
  sv: "#0ea5e9",
  pl: "#ec4899",
  zh: "#dc2626",
  ar: "#059669",
  hi: "#d97706",
  ur: "#14b8a6",
  en: "#3b82f6",
};

export function getCourseAccent(code: string): string {
  return COURSE_ACCENT[code] ?? "#1cb0f6";
}
