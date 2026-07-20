import type { Metadata } from "next";

// ============================================================
// GRADE PAGE — this is /grade-5.
// Mirrors /grade-4 structure; content aligned to AGA-CUR-001
// Master Curriculum Registry (Grade 5: 19 modules / 95 lessons).
// ============================================================

const GRADE = 5;

export const metadata: Metadata = {
  title: `5th Grade Learning — Math, Reading & Science Adventures`,
  description:
    "What kids learn in 5th grade — fraction and decimal operations, volume, the coordinate plane, and reading with textual evidence — and how Allen Girls Adventures turns those state standards into adventures your 10–11 year old chooses to play.",
  alternates: { canonical: "/grade-5" },
};

const faqs = [
  {
    q: "What should a 5th grader know in math?",
    a: "By the end of 5th grade, most state standards expect students to add, subtract, multiply, and divide fractions; multiply multi-digit whole numbers fluently and divide with two-digit divisors; read, compare, and operate on decimals to the thousandths; find the volume of solid figures; graph points on the coordinate plane; and use order of operations. Fifth grade is the year math becomes genuinely abstract — the last on-ramp before middle school.",
  },
  {
    q: "How does Allen Girls Adventures cover 5th grade standards?",
    a: "Every mission maps to specific grade 5 state standards across math, ELA, science, and social studies. Kids experience it as an adventure with the three Allen sisters; parents and teachers see the underlying standards, skills, and mastery evidence in their dashboard.",
  },
  {
    q: "My 5th grader is behind. Can this help them catch up?",
    a: "Yes — difficulty adapts inside missions, support escalates across attempts (a hint first, stronger scaffolds after), and mastery is measured as evidence over time, not one test. Kids working below grade level get a real path forward without ever being shamed or compared to peers.",
  },
  {
    q: "How much time per day should a 5th grader spend on it?",
    a: "Around 25–30 minutes a day, 3–5 days a week, is the sweet spot for supplemental learning at this age — enough for real progress, short enough to stay wanted rather than resented.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "5th Grade Learning with Allen Girls Adventures",
  about: {
    "@type": "Course",
    name: "Allen Girls Adventures — Grade 5",
    description:
      "Story-based, standards-aligned learning for 5th graders covering math, ELA, science, and social studies.",
    provider: {
      "@type": "EducationalOrganization",
      name: "Allen Girls Adventures",
    },
    educationalLevel: "Grade 5",
  },
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function Grade5Page() {
  return (
    <main className="mk">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <section className="mkHero">
        <div className="mkHeroInner">
          <span className="mkEyebrow">🎒 Grade {GRADE} · Ages 10–11</span>
          <h1>
            5th Grade Learning That Feels Like
            <br />
            <span className="mkHi">an Adventure — Because It Is</span>
          </h1>
          <p className="mkHeroSub">
            Fifth grade is the last stop before middle school — where
            fractions, decimals, and evidence-based reading all come together.
            The kids who arrive confident here thrive there. We built the
            bridge.
          </p>
          <div className="mkHeroCtas">
            <a className="mkBtn mkBtnPink" href="/account/login">
              Start Free Today
            </a>
            <a className="mkBtn mkBtnGhost" href="/our-approach">
              How We Teach
            </a>
          </div>
        </div>
      </section>

      {/* Answer capsule */}
      <section className="mkSection">
        <div className="mkInnerNarrow">
          <div className="mkQuote">
            <strong>What 5th graders learn:</strong> all four operations with
            fractions and decimals, multi-digit multiplication and division,
            volume, the coordinate plane, reading with accurate textual
            evidence, opinion and research writing, and systems thinking in
            science. Allen Girls Adventures bakes those state standards into
            missions your child chooses to play — about 25–30 minutes a day.
          </div>
        </div>
      </section>

      {/* What they learn, by subject */}
      <section className="mkSection mkSectionSoft">
        <div className="mkInner">
          <div className="mkCenter">
            <span className="mkKicker">The Grade {GRADE} Year</span>
            <h2>What Your 5th Grader Is Expected to Master</h2>
            <p className="mkLead" style={{ margin: "1rem auto 0" }}>
              Based on state standards for grade {GRADE} — and covered inside
              our adventure worlds:
            </p>
          </div>
          <div className="mkGrid mkGrid2">
            <div className="mkCard mkCardTopPurple">
              <span className="mkCardIcon">🔢</span>
              <h3>Math</h3>
              <p>
                Operations and algebraic thinking · multi-digit whole-number
                operations in base ten · adding, subtracting, multiplying, and
                dividing fractions · decimals to the thousandths ·
                measurement, data, and volume · geometry and coordinate-plane
                reasoning. This is the year math turns abstract — our missions
                make that leap feel like unlocking a superpower.
              </p>
            </div>
            <div className="mkCard mkCardTopPink">
              <span className="mkCardIcon">📚</span>
              <h3>Reading &amp; Writing</h3>
              <p>
                Quoting accurately from text · determining theme · comparing
                and contrasting stories and sources · summarizing · opinion,
                informational, and narrative writing · vocabulary and research
                communication. Our story-first design means kids read closely
                and cite evidence on every screen.
              </p>
            </div>
            <div className="mkCard mkCardTopCyan">
              <span className="mkCardIcon">🔬</span>
              <h3>Science</h3>
              <p>
                Earth and space systems · life science and ecosystems ·
                matter, reactions, and forces · engineering and human-impact
                systems. Kids run real investigations inside missions —
                modeling systems, predicting outcomes, and explaining evidence
                like scientists.
              </p>
            </div>
            <div className="mkCard mkCardTop">
              <span className="mkCardIcon">🌎</span>
              <h3>Social Studies &amp; Beyond</h3>
              <p>
                Early colonization and the growth of the colonies · revolution
                and independence · the Constitution and government · the
                growth of the republic and westward expansion · slavery, the
                Civil War, Reconstruction, and the civil-rights legacy — plus
                teamwork, perseverance, and problem-solving woven into every
                adventure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why grade 5 is pivotal */}
      <section className="mkSection">
        <div className="mkInner">
          <div className="mkSplit">
            <div>
              <span className="mkKicker">Why Grade {GRADE} Matters So Much</span>
              <h2>The Launchpad Into Middle School</h2>
              <p className="mkLead">
                Fifth grade is the final year of elementary school — and the
                gatekeeper to middle-school math and science. Ratios, algebra,
                and lab science are right around the corner, and they all
                stand on the fraction, decimal, and reasoning skills built
                this year. Confidence here decides how the next three years
                go.
              </p>
              <ul className="mkChecks">
                <li>
                  Errors are treated as information, never failure — no red
                  X&apos;s, no peer comparison
                </li>
                <li>
                  Hints build thinking instead of giving answers, so wins are
                  real wins
                </li>
                <li>
                  Mastery is evidence over time — a bad day doesn&apos;t erase
                  progress
                </li>
                <li>
                  You see exactly where they are in your guardian dashboard,
                  in plain language
                </li>
              </ul>
            </div>
            <div className="mkCard" style={{ alignSelf: "start" }}>
              <span className="mkCardIcon">⏱️</span>
              <h3>A 5th Grade Week With AGA</h3>
              <p>
                25–30 minutes a day, 3–5 days a week. One mission arc
                typically spans a week: learn the skill inside the story,
                practice it with S.P.A.R.K.&apos;s support, then apply it to
                beat the challenge. Spiral review brings old skills back in
                new worlds so nothing fades before middle school.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mkSection mkSectionSoft">
        <div className="mkInnerNarrow">
          <span className="mkKicker">Parents Ask</span>
          <h2>5th Grade Questions, Answered</h2>
          <div className="mkFaq">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mkCtaBand">
        <h2>Give Your 5th Grader a Reason to Love Learning</h2>
        <p>The first adventure is free. The confidence is permanent.</p>
        <div className="mkHeroCtas">
          <a className="mkBtn mkBtnWhite" href="/account/login">Start Free Today</a>
          <a className="mkBtn mkBtnGhost" href="/faq">Family FAQ</a>
        </div>
      </section>
    </main>
  );
}
