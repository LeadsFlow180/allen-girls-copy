import type { Metadata } from "next";

// ============================================================
// GRADE PAGE TEMPLATE — this is /grade-4.
// To create /grade-3, /grade-5, /grade-6: copy this folder,
// then update GRADE, the skills lists, and the FAQ answers.
// Everything else (structure, schema, styling) stays the same.
// ============================================================

const GRADE = 4;

export const metadata: Metadata = {
  title: `4th Grade Learning — Math, Reading & Science Adventures`,
  description:
    "What kids learn in 4th grade — multi-digit multiplication, fractions, deeper reading comprehension — and how Allen Girls Adventures turns those state standards into adventures your 9–10 year old chooses to play.",
  alternates: { canonical: "/grade-4" },
};

const faqs = [
  {
    q: "What should a 4th grader know in math?",
    a: "By the end of 4th grade, most state standards expect students to multiply multi-digit numbers, divide with remainders, compare and add fractions with like denominators, understand decimal notation, and solve multi-step word problems. Fourth grade is also the year math anxiety most often takes root — because the jump from facts to multi-step reasoning is real.",
  },
  {
    q: "How does Allen Girls Adventures cover 4th grade standards?",
    a: "Every mission maps to specific grade 4 state standards across math, ELA, science, and social studies. Kids experience it as an adventure with the three Allen sisters; parents and teachers see the underlying standards, skills, and mastery evidence in their dashboard.",
  },
  {
    q: "My 4th grader is behind. Can this help them catch up?",
    a: "Yes — difficulty adapts inside missions, support escalates across attempts (hint first, stronger scaffolds after), and mastery is measured as evidence over time, not one test. Kids working below grade level get a real path back without ever being shamed or compared to peers.",
  },
  {
    q: "How much time per day should a 4th grader spend on it?",
    a: "Around 20–30 minutes a day, 3–5 days a week, is the sweet spot for supplemental learning at this age — enough for real progress, short enough to stay wanted rather than resented.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "4th Grade Learning with Allen Girls Adventures",
  about: {
    "@type": "Course",
    name: "Allen Girls Adventures — Grade 4",
    description:
      "Story-based, standards-aligned learning for 4th graders covering math, ELA, science, and social studies.",
    provider: {
      "@type": "EducationalOrganization",
      name: "Allen Girls Adventures",
    },
    educationalLevel: "Grade 4",
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

export default function Grade4Page() {
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
          <span className="mkEyebrow">🎒 Grade {GRADE} · Ages 9–10</span>
          <h1>
            4th Grade Learning That Feels Like
            <br />
            <span className="mkHi">an Adventure — Because It Is</span>
          </h1>
          <p className="mkHeroSub">
            Fourth grade is the year math gets serious and reading gets
            deep. It&apos;s also the year many kids decide they&apos;re
            &quot;not a math person.&quot; We built the antidote.
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
            <strong>What 4th graders learn:</strong> multi-digit
            multiplication and division, fractions and decimals, multi-step
            word problems, deeper reading comprehension with evidence from
            the text, informational writing, energy and ecosystems in
            science. Allen Girls Adventures bakes those state standards
            into missions your child chooses to play — about 20–30 minutes
            a day.
          </div>
        </div>
      </section>

      {/* What they learn, by subject */}
      <section className="mkSection mkSectionSoft">
        <div className="mkInner">
          <div className="mkCenter">
            <span className="mkKicker">The Grade {GRADE} Year</span>
            <h2>What Your 4th Grader Is Expected to Master</h2>
            <p className="mkLead" style={{ margin: "1rem auto 0" }}>
              Based on state standards for grade {GRADE} — and covered
              inside our adventure worlds:
            </p>
          </div>
          <div className="mkGrid mkGrid2">
            <div className="mkCard mkCardTopPurple">
              <span className="mkCardIcon">🔢</span>
              <h3>Math</h3>
              <p>
                Multi-digit multiplication and division · fraction
                equivalence and comparison · adding fractions · decimal
                notation · multi-step word problems · area, perimeter, and
                angles. This is the make-or-break year for math confidence —
                our missions turn multi-step reasoning into the tool that
                saves the day.
              </p>
            </div>
            <div className="mkCard mkCardTopPink">
              <span className="mkCardIcon">📚</span>
              <h3>Reading & Writing</h3>
              <p>
                Finding evidence in the text · summarizing · comparing
                firsthand and secondhand accounts · informational and
                opinion writing · vocabulary in context. Our story-first
                design means kids read with purpose on every screen — the
                comprehension is the mission.
              </p>
            </div>
            <div className="mkCard mkCardTopCyan">
              <span className="mkCardIcon">🔬</span>
              <h3>Science</h3>
              <p>
                Energy and motion · waves, light, and information ·
                earth&apos;s surface processes and hazards · natural
                resources and engineering design. Kids run real
                investigations inside missions — observing, predicting, and
                explaining like scientists.
              </p>
            </div>
            <div className="mkCard mkCardTop">
              <span className="mkCardIcon">🌎</span>
              <h3>Social Studies & Beyond</h3>
              <p>
                North America map systems · Canada and Mexico · Indigenous
                peoples and ancient civilizations of North America · U.S.
                expansion and regions · diversity, landmarks, and civic
                identity — plus the pieces report cards don&apos;t grade:
                teamwork, perseverance, and problem-solving.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why grade 4 is pivotal */}
      <section className="mkSection">
        <div className="mkInner">
          <div className="mkSplit">
            <div>
              <span className="mkKicker">Why Grade {GRADE} Matters So Much</span>
              <h2>The Year Kids Decide What Kind of Learner They Are</h2>
              <p className="mkLead">
                Fourth grade is famous among teachers as the year of the
                &quot;slump&quot;: texts get harder, math turns multi-step,
                and kids who coasted on memorization suddenly struggle. The
                risk isn&apos;t the missed skill — it&apos;s the story kids
                start telling themselves about it.
              </p>
              <ul className="mkChecks">
                <li>
                  Errors are treated as information, never failure — no red
                  X&apos;s, no peer comparison
                </li>
                <li>
                  Hints build thinking instead of giving answers, so wins
                  are real wins
                </li>
                <li>
                  Mastery is evidence over time — a bad day doesn&apos;t
                  erase progress
                </li>
                <li>
                  You see exactly where they are in your guardian dashboard,
                  in plain language
                </li>
              </ul>
            </div>
            <div className="mkCard" style={{ alignSelf: "start" }}>
              <span className="mkCardIcon">⏱️</span>
              <h3>A 4th Grade Week With AGA</h3>
              <p>
                20–30 minutes a day, 3–5 days a week. One mission arc
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
          <h2>4th Grade Questions, Answered</h2>
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
        <h2>Give Your 4th Grader a Reason to Love Learning</h2>
        <p>The first adventure is free. The confidence is permanent.</p>
        <div className="mkHeroCtas">
          <a className="mkBtn mkBtnWhite" href="/account/login">Start Free Today</a>
          <a className="mkBtn mkBtnGhost" href="/faq">Family FAQ</a>
        </div>
      </section>
    </main>
  );
}
