import { WeeklyGamesReportPanel } from "@/components/reports/weekly-games-report";

export const metadata = {
  title: "Games report | Family Controls",
  description: "Weekly games summary for your linked learners.",
};

export default function ParentReportsPage() {
  return (
    <WeeklyGamesReportPanel
      apiPath="/api/parent/reports"
      audience="parent"
      emptyHint="No learners linked yet. Add a child in Family profiles, then their game activity will appear here."
    />
  );
}
