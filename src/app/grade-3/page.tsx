import type { Metadata } from "next";

// ============================================================
// GRADE PAGE — this is /grade-3.
// Mirrors /grade-4 structure; content aligned to AGA-CUR-001
// Master Curriculum Registry (Grade 3: 20 modules / 100 lessons).
// ============================================================

const GRADE = 3;

export const metadata: Metadata = {
  title: `3rd Grade Learning — Math, Reading & Science Adventures`,
  description:
    "What kids learn in 3rd grade — multiplication and division, fractions as numbers, and reading for key ideas — and how Allen Girls Adventures turns those state standards into adventures your 8–9 year old chooses to play.",
  alternates: { canonical: "/grade-3" },
};

const faqs = [
  {
    q: "What should a 3rd grader know in math?",
    a: "By the end of 3rd grade, most state standards expect students to multiply and divide within 100, understand fractions as numbers on a number line, tell and write time, measure and find area, round to the nearest 10 and 100, and solve two-step word problems. Third grade is the year multiplication and fractions arrive — the foundation almost all later math is built on.",
  },
  {
    q: "How does Allen Girls Adventures cover 3rd grade standards?",
    a: "Every mission maps to specific grade 3 state standards across math, ELA, science, and social studies. Kids experience it as an adventure with the three Allen sisters; parents and teachers see the underlying standards, skills, and mastery evidence in their dashboard.",
  },
  {
    q: "My 3rd grader is behind. Can this help them catch up?",
    a: "Yes — difficulty adapts inside missions, support escalates across attempts (a hint first, stronger scaffolds after), and mastery is measured as evidence over time, not one test. Kids working below grade level get a real path forward without ever being shamed or compared to peers.",
  },
  {
    q: "How much time per day should a 3rd grader spend on it?",
    a: "Around 15–20 minutes a day, 3–5 days a week, is the sweet spot at this age — long enough for real progress, short enough to stay something they want to do rather than a chore.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "3rd Grade Learning with Allen Girls Adventures",
  about: {
    "@type": "Course",
    name: "Allen Girls Adventures — Grade 3",
    description:
      "Story-based, standards-aligned learning for 3rd graders covering math, ELA, science, and social studies.",
    provider: {
      "@type": "EducationalOrganization",
      name: "Allen Girls Adventures",
    },
    educationalLevel: "Grade 3",
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

export default function Grade3Page() {
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
          <span className="mkEyebrow">🎒 Grade {GRADE} · Ages 8–9</span>
          <h1>
            3rd Grade Learning That Feels Like
            <br />
            <span className="mkHi">an Adventure — Because It Is</span>
          </h1>
          <p className="mkHeroSub">
            Third grade is where multiplication, fractions, and real reading
            begin. It&apos;s a huge leap — and the year a child&apos;s
            confidence takes root. We built the launchpad.
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
            <strong>What 3rd graders learn:</strong> multiplication and
            division within 100, fractions as numbers, area and measurement,
            two-step word problems, reading for key ideas and evidence,
            paragraph writing, and hands-on science inquiry. Allen Girls
            Adventures bakes those state standards into missions your child
            chooses to play — about 15–20 minutes a day.
          </div>
        </div>
      </section>

      {/* What they learn, by subject */}
      <section className="mkSection mkSectionSoft">
        <div className="mkInner">
          <div className="mkCenter">
            <span className="mkKicker">The Grade {GRADE} Year</span>
            <h2>What Your 3rd Grader Is Expected to Master</h2>
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
                Multiplication and division within 100 · place value,
                rounding, and multi-digit addition and subtraction ·
                fractions as numbers · measurement, time, and data · area and
                geometry. Third grade is where math shifts from counting to
                real reasoning — our missions make multiplication the key
                that unlocks the story.
              </p>
            </div>
            <div className="mkCard mkCardTopPink">
              <span className="mkCardIcon">📚</span>
              <h3>Reading &amp; Writing</h3>
              <p>
                Reading literature and informational text · asking and
                answering questions with evidence · finding the main idea ·
                writing clear paragraphs · grammar and conventions ·
                speaking and listening. Our story-first design means kids
                read with purpose on every screen.
              </p>
            </div>
            <div className="mkCard mkCardTopCyan">
              <span className="mkCardIcon">🔬</span>
              <h3>Science</h3>
              <p>
                Life science · earth and space science · physical science ·
                engineering and design · hands-on science inquiry. Kids
                observe, predict, and explain inside missions — thinking
                like real scientists, not memorizing facts.
              </p>
            </div>
            <div className="mkCard mkCardTop">
              <span className="mkCardIcon">🌎</span>
              <h3>Social Studies &amp; Beyond</h3>
              <p>
                Communities and citizenship · geography and map skills ·
                economics and resources · history and change over time —
                plus the pieces report cards don&apos;t grade: teamwork,
                perseverance, and problem-solving, woven into every adventure
                with Natalia, Alana, and Maya.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why grade 3 is pivotal */}
      <section className="mkSection">
        <div className="mkInner">
          <div className="mkSplit">
            <div>
              <span className="mkKicker">Why Grade {GRADE} Matters So Much</span>
              <h2>The Year the Building Blocks Get Laid</h2>
              <p className="mkLead">
                Third grade is a turning point: kids move from &quot;learning
                to read&quot; to &quot;reading to learn,&quot; and math jumps
                from counting into multiplication and fractions. Get these
                foundations solid and everything after is easier. Miss them,
                and gaps compound for years.
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
              <h3>A 3rd Grade Week With AGA</h3>
              <p>
                15–20 minutes a day, 3–5 days a week. One mission arc
                typically spans a week: learn the skill inside the story,
                practice it with S.P.A.R.K.&apos;s support, then apply it to
                beat the challenge. Spiral review brings old skills back in
                new worlds so nothing fades.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mkSection mkSectionSoft">
        <div className="mkInnerNarrow">
          <span className="mkKicker">Parents Ask</span>
          <h2>3rd Grade Questions, Answered</h2>
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
        <h2>Give Your 3rd Grader a Reason to Love Learning</h2>
        <p>The first adventure is free. The confidence is permanent.</p>
        <div className="mkHeroCtas">
          <a className="mkBtn mkBtnWhite" href="/account/login">Start Free Today</a>
          <a className="mkBtn mkBtnGhost" href="/faq">Family FAQ</a>
        </div>
      </section>
    </main>
  );
}
