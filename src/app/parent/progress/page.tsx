export default function ParentProgressPage() {
  return (
    <main className="page-shell parent-shell">
      <section className="page-header">
        <p className="eyebrow">Reports</p>
        <h1 className="page-title">Progress & Insights</h1>
        <p className="page-subtitle">
          Clear, friendly summaries of how your child is growing over time.
        </p>
      </section>

      <section className="space-y-4">
        <div className="report-row">
          <h2 className="report-title">At-a-Glance</h2>
          <p className="report-text">
            A simple overview of strengths, current focus areas, and time on
            task.
          </p>
        </div>
        <div className="report-row">
          <h2 className="report-title">Subject Breakdown</h2>
          <p className="report-text">
            Math, reading, and science progress shown in everyday language—not
            test scores.
          </p>
        </div>
        <div className="report-row">
          <h2 className="report-title">Recommendations</h2>
          <p className="report-text">
            Suggestions for the next week of play and practice, generated
            behind the scenes.
          </p>
        </div>
      </section>
    </main>
  );
}

