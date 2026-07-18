import { WeeklyGamesReportPanel } from "@/components/reports/weekly-games-report";

export const metadata = {
  title: "Games report | Classroom",
  description: "Weekly games summary for your linked students.",
};

export default function TeacherReportsPage() {
  return (
    <WeeklyGamesReportPanel
      apiPath="/api/teacher/reports"
      audience="teacher"
      emptyHint="No students linked yet. Use Add student with a learner code, then their game activity will appear here."
    />
  );
}
