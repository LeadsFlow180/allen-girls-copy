import type { Metadata } from "next";

// ============================================================
// GRADE PAGE — this is /grade-6.
// Mirrors /grade-4 structure; content aligned to AGA-CUR-001
// Master Curriculum Registry (Grade 6: 20 modules / 100 lessons).
// ============================================================

const GRADE = 6;

export const metadata: Metadata = {
  title: `6th Grade Learning — Math, Reading & Science Adventures`,
  description:
    "What kids learn in 6th grade — ratios and unit rates, negative numbers, expressions and equations, and reading with cited evidence — and how Allen Girls Adventures turns those state standards into adventures your 11–12 year old chooses to play.",
  alternates: { canonical: "/grade-6" },
};

const faqs = [
  {
    q: "What should a 6th grader know in math?",
    a: "By the end of 6th grade, most state standards expect students to understand ratios and unit rates, divide fractions by fractions, work with the full number system including negative numbers, write and solve one-variable expressions and equations, find area, surface area, and volume, and analyze statistical data. Sixth grade is the true beginning of pre-algebra — the language of every math class that follows.",
  },
  {
    q: "How does Allen Girls Adventures cover 6th grade standards?",
    a: "Every mission maps to specific grade 6 state standards across math, ELA, science, and social studies. Kids experience it as an adventure with the three Allen sisters; parents and teachers see the underlying standards, skills, and mastery evidence in their dashboard.",
  },
  {
    q: "My 6th grader is behind. Can this help them catch up?",
    a: "Yes — difficulty adapts inside missions, support escalates across attempts (a hint first, stronger scaffolds after), and mastery is measured as evidence over time, not one test. Middle-schoolers working below grade level get a real path forward without ever being shamed or compared to peers.",
  },
  {
    q: "How much time per day should a 6th grader spend on it?",
    a: "Around 30 minutes a day, 3–5 days a week, is the sweet spot for supplemental learning at this age — enough for real progress on middle-school skills, short enough to stay something they choose rather than resent.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "6th Grade Learning with Allen Girls Adventures",
  about: {
    "@type": "Course",
    name: "Allen Girls Adventures — Grade 6",
    description:
      "Story-based, standards-aligned learning for 6th graders covering math, ELA, science, and social studies.",
    provider: {
      "@type": "EducationalOrganization",
      name: "Allen Girls Adventures",
    },
    educationalLevel: "Grade 6",
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

export default function Grade6Page() {
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
          <span className="mkEyebrow">🎒 Grade {GRADE} · Ages 11–12</span>
          <h1>
            6th Grade Learning That Feels Like
            <br />
            <span className="mkHi">an Adventure — Because It Is</span>
          </h1>
          <p className="mkHeroSub">
            Sixth grade is the first year of middle school — pre-algebra,
            argument writing, and lab science all arrive at once. It&apos;s a
            lot. We make it feel like a quest instead of a leap.
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
            <strong>What 6th graders learn:</strong> ratios and unit rates,
            dividing fractions, negative numbers, one-variable expressions and
            equations, area, surface area and volume, statistics, reading with
            cited textual evidence, argument writing, and systems-level
            science. Allen Girls Adventures bakes those state standards into
            missions your child chooses to play — about 30 minutes a day.
          </div>
        </div>
      </section>

      {/* What they learn, by subject */}
      <section className="mkSection mkSectionSoft">
        <div className="mkInner">
          <div className="mkCenter">
            <span className="mkKicker">The Grade {GRADE} Year</span>
            <h2>What Your 6th Grader Is Expected to Master</h2>
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
                Ratios and unit rates · the number system, including negative
                numbers and dividing fractions · writing and solving
                expressions and equations · geometry with area, surface area,
                and volume · statistics and probability foundations. This is
                where pre-algebra begins — our missions turn variables and
                ratios into tools that crack the code.
              </p>
            </div>
            <div className="mkCard mkCardTopPink">
              <span className="mkCardIcon">📚</span>
              <h3>Reading &amp; Writing</h3>
              <p>
                Citing textual evidence · determining central idea · analyzing
                how structure shapes meaning · argument, informational, and
                narrative writing · vocabulary and research communication. Our
                story-first design means kids build and defend claims with
                evidence on every screen.
              </p>
            </div>
            <div className="mkCard mkCardTopCyan">
              <span className="mkCardIcon">🔬</span>
              <h3>Science</h3>
              <p>
                Earth systems, weather, and geologic change · cells, body
                systems, and organism responses · matter, energy, and chemical
                change · engineering design and human-impact systems. Kids run
                real investigations inside missions — building models, testing
                variables, and arguing from evidence like scientists.
              </p>
            </div>
            <div className="mkCard mkCardTop">
              <span className="mkCardIcon">🌎</span>
              <h3>Social Studies &amp; Beyond</h3>
              <p>
                Civics, government, and informed citizenship · human origins
                and the Paleolithic and Neolithic eras · ancient river-valley
                civilizations · classical civilizations and their legacies ·
                post-classical exchange and empires — plus teamwork,
                perseverance, and problem-solving woven into every adventure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why grade 6 is pivotal */}
      <section className="mkSection">
        <div className="mkInner">
          <div className="mkSplit">
            <div>
              <span className="mkKicker">Why Grade {GRADE} Matters So Much</span>
              <h2>The First Year of Middle School</h2>
              <p className="mkLead">
                Sixth grade changes everything: more teachers, more
                independence, and the start of pre-algebra and evidence-based
                argument. Kids who enter with strong fraction, ratio, and
                reading-for-evidence skills settle in fast — the ones with
                gaps can quietly fall behind before anyone notices. This is the
                year confidence and study habits set the trajectory.
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
              <h3>A 6th Grade Week With AGA</h3>
              <p>
                About 30 minutes a day, 3–5 days a week. One mission arc
                typically spans a week: learn the skill inside the story,
                practice it with S.P.A.R.K.&apos;s support, then apply it to
                beat the challenge. Spiral review brings old skills back in new
                worlds so nothing fades under the middle-school workload.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mkSection mkSectionSoft">
        <div className="mkInnerNarrow">
          <span className="mkKicker">Parents Ask</span>
          <h2>6th Grade Questions, Answered</h2>
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
        <h2>Give Your 6th Grader a Reason to Love Learning</h2>
        <p>The first adventure is free. The confidence is permanent.</p>
        <div className="mkHeroCtas">
          <a className="mkBtn mkBtnWhite" href="/account/login">Start Free Today</a>
          <a className="mkBtn mkBtnGhost" href="/faq">Family FAQ</a>
        </div>
      </section>
    </main>
  );
}
