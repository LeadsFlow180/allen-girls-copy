import Link from "next/link";

export default function ParentPage() {
  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      {/* HERO — match home purple gradient */}
      <section style={{
        background: "linear-gradient(135deg, #7c22c5 0%, #5a18a0 50%, #e8357a 100%)",
        padding: "4rem 2rem 3.5rem",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div className="hero-eyebrow font-nunito" style={{ margin: "0 auto 1rem", display: "inline-flex" }}>
            👩‍👧 For Parents & Guardians
          </div>
          <h1 className="font-fredoka" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", color: "#fff", lineHeight: 1.15, marginBottom: "0.75rem" }}>
            Safe, Smart &amp; Built for Families
          </h1>
          <p className="font-nunito" style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.9)", lineHeight: 1.65, marginBottom: "2rem" }}>
            Allen Girls Adventures is designed for kids — and built for the parents who care about
            what their kids are learning, who they&apos;re learning from, and how their data is protected.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/learn" className="btn-hero-primary">▶ Start Free Trial</Link>
            <Link href="/parent/progress" className="btn-hero-secondary">📊 View Progress Reports</Link>
          </div>
        </div>
      </section>

      {/* TRUST BADGES — brand purple */}
      <div style={{ background: "var(--primary)", display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}>
        {[
          { icon: "🔒", title: "100% COPPA Compliant", desc: "We never collect data from children under 13." },
          { icon: "📴", title: "Zero Ads, Ever",       desc: "No advertising on the platform. Period." },
          { icon: "🤝", title: "No Data Sold",          desc: "Your family's data stays private — always." },
          { icon: "👁️", title: "Full Parental Control", desc: "Manage everything from your dashboard." },
        ].map((b) => (
          <div key={b.title} className="feature-box">
            <div className="feature-box-icon">{b.icon}</div>
            <div className="feature-box-title">{b.title}</div>
            <p className="feature-box-text">{b.desc}</p>
          </div>
        ))}
      </div>

      {/* HOW IT WORKS */}
      <section className="section section-dark">
        <div className="section-inner">
          <p className="section-label font-nunito">⚙️ The Platform</p>
          <h2 className="section-title font-fredoka">How Allen Girls Adventures Works</h2>
          <p className="section-subtitle font-nunito">Simple for kids. Powerful for parents. Built on real curriculum.</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: "1.5rem", marginTop: "1rem" }}>
            {[
              { step: "1", icon: "🎯", title: "Personalized Learning Path", desc: "When your child signs up, a short quiz places them at exactly the right level — not too easy, not too hard." },
              { step: "2", icon: "👧🏾", title: "Meet Their Guide", desc: "Based on their quiz and subject interests, they're matched with an Allen Girl guide who accompanies them through the platform." },
              { step: "3", icon: "🎮", title: "Adventures & Activities", desc: "Episodes, games, quizzes, and creative projects reinforce real K–5 curriculum standards in a fun, interactive way." },
              { step: "4", icon: "📊", title: "Parents Stay Informed", desc: "Your dashboard shows exactly what your child has completed, where they're excelling, and where they need more support." },
            ].map((s) => (
              <div key={s.step} style={{
                borderRadius: "1.25rem", padding: "1.75rem",
                background: "rgba(255,255,255,0.05)", border: "2px solid rgba(255,255,255,0.1)",
              }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>{s.icon}</div>
                <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--aga-yellow2)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                  Step {s.step}
                </div>
                <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#fff", marginBottom: "0.5rem" }}>{s.title}</div>
                <p style={{ fontSize: "0.875rem", color: "#94a3b8", lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section section-purple">
        <div className="section-inner" style={{ textAlign: "center" }}>
          <p className="section-label font-nunito">💰 Simple Pricing</p>
          <h2 className="section-title font-fredoka">No Surprises. No Upsells.</h2>
          <p className="section-subtitle" style={{ margin: "0 auto 3rem" }}>
            One flat price for the whole family. Cancel anytime.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: "1.5rem", maxWidth: "900px", margin: "0 auto" }}>
            {[
              {
                name: "Free Trial", price: "$0", period: "for 30 days",
                features: ["Full platform access", "All 4 adventure guides", "500+ activities", "Parent dashboard included"],
                cta: "Start Free", color: "#22c55e", primary: false,
              },
              {
                name: "Family Plan", price: "$7.99", period: "/ month",
                features: ["Everything in Free", "Up to 3 kid profiles", "Progress reports & analytics", "New episodes monthly", "Priority support"],
                cta: "Get Started", color: "var(--aga-yellow)", primary: true,
              },
              {
                name: "Annual Plan", price: "$59.99", period: "/ year (save 38%)",
                features: ["Everything in Family", "Locked-in price", "Downloadable activity packs", "Early access to new content"],
                cta: "Best Value", color: "#a855f7", primary: false,
              },
            ].map((p) => (
              <div key={p.name} style={{
                borderRadius: "1.5rem", padding: "2rem 1.75rem",
                background: p.primary ? "rgba(245,197,24,0.15)" : "rgba(255,255,255,0.05)",
                border: `2px solid ${p.primary ? p.color : "rgba(255,255,255,0.12)"}`,
                transform: p.primary ? "scale(1.04)" : "none",
              }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: p.color, marginBottom: "0.75rem" }}>
                  {p.name}
                </div>
                <div style={{ fontSize: "2.6rem", fontWeight: 900, color: "#fff", lineHeight: 1 }}>{p.price}</div>
                <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "1.5rem" }}>{p.period}</div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.75rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {p.features.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.875rem", color: "#e0e7ff" }}>
                      <span style={{ color: p.color }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/learn" style={{
                  display: "block", padding: "0.85rem", borderRadius: "999px", textAlign: "center",
                  background: p.primary ? p.color : "transparent",
                  color: p.primary ? "var(--aga-navy)" : "#fff",
                  fontWeight: 800, textDecoration: "none", fontSize: "0.9rem",
                  border: `2px solid ${p.color}`,
                  textTransform: "uppercase", letterSpacing: "0.04em",
                }}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section section-darker">
        <div className="section-inner" style={{ maxWidth: "750px" }}>
          <p className="section-label">❓ FAQ</p>
          <h2 className="section-title">Parents Ask Us…</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "2rem" }}>
            {[
              { q: "What grade levels does this cover?", a: "Allen Girls Adventures is built for Kindergarten through 5th grade (ages 5–12), with content that adapts to each child's level." },
              { q: "Is the content aligned to school curriculum?", a: "Yes — all activities are aligned to Common Core Math, ELA standards, and NGSS Science standards. It's designed to reinforce what kids learn in school." },
              { q: "Can I manage multiple kids?", a: "Absolutely. The Family Plan allows up to 3 child profiles, each with their own personalized guide and progress tracking." },
              { q: "What happens after the free trial?", a: "You'll get a reminder 3 days before the trial ends. You can choose a paid plan or cancel — no automatic charges without your consent." },
              { q: "Is it safe for my young child?", a: "Yes. The platform is fully COPPA compliant. We don't collect personal data from children, display no ads, and all content is reviewed by educators." },
            ].map((faq) => (
              <div key={faq.q} style={{
                borderRadius: "1rem", padding: "1.25rem 1.5rem",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              }}>
                <div style={{ fontWeight: 800, color: "#fff", marginBottom: "0.5rem" }}>{faq.q}</div>
                <p style={{ fontSize: "0.875rem", color: "#94a3b8", lineHeight: 1.65, margin: 0 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-strip">
        <div style={{ position: "relative", zIndex: 1, maxWidth: "650px", margin: "0 auto", textAlign: "center" }}>
          <h2 className="font-fredoka" style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", color: "#fff", lineHeight: 1.2, marginBottom: "0.75rem" }}>
            Start Your Family&apos;s Adventure Today
          </h2>
          <p className="font-nunito" style={{ fontSize: "1rem", color: "rgba(255,255,255,0.9)", marginBottom: "1.5rem" }}>
            30 days free. No credit card. Cancel anytime.
          </p>
          <Link href="/learn" className="btn-hero-primary">▶ &nbsp;Start Free Trial</Link>
        </div>
      </section>
    </div>
  );
}
