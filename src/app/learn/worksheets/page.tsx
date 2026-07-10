const WORKSHEET_URL = "https://claude.site/public/artifacts/27994eee-d273-4a9d-a0dc-c58ef25e1846/embed";
const WORKSHEET_OPEN_URL = "https://claude.site/public/artifacts/27994eee-d273-4a9d-a0dc-c58ef25e1846";

export default function LearnWorksheetsPage() {
  return (
    <main className="page-shell kid-shell">
      <section className="page-header">
        <p className="eyebrow">Brain Boosters</p>
        <h1 className="page-title">Worksheets &amp; Activities</h1>
        <p className="page-subtitle">
          Fun printable worksheets and activities to boost learning.
        </p>
      </section>

      <section
        style={{
          padding: "0 1rem 2rem",
          maxWidth: "100%",
          minHeight: "640px",
        }}
      >
        <div
          style={{
            width: "100%",
            minHeight: 600,
            borderRadius: "12px",
            border: "2px solid var(--primary)",
            overflow: "hidden",
            background: "#f8fafc",
          }}
        >
          <iframe
            src={WORKSHEET_URL}
            title="Claude Artifact - Worksheets"
            width="100%"
            height={600}
            frameBorder={0}
            allow="clipboard-write"
            allowFullScreen
            style={{ display: "block", width: "100%", minHeight: "600px" }}
          />
        </div>
        <p className="font-nunito" style={{ marginTop: "1rem", fontSize: "0.95rem", color: "#64748b" }}>
          Can&apos;t see the worksheet?{" "}
          <a
            href={WORKSHEET_OPEN_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "underline" }}
          >
            Open it in a new tab →
          </a>
        </p>
      </section>
    </main>
  );
}
