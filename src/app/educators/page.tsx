import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Educators & District Leaders | Standards-Aligned Grades 3–6",
  description:
    "Standards-aligned supplemental learning for grades 3–6 with full teacher transparency: standards mapping, mastery evidence, attempt history, accommodations, and intervention recommendations. Works on low-cost school devices.",
  alternates: { canonical: "/educators" },
  openGraph: {
    title: "Allen Girls Adventures for Schools & Districts",
    description:
      "Story-based, standards-aligned learning for grades 3–6 with real teacher reporting.",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Allen Girls Adventures for Educators and District Leaders",
  audience: [
    { "@type": "EducationalAudience", educationalRole: "teacher" },
    { "@type": "EducationalAudience", educationalRole: "administrator" },
  ],
  about: {
    "@type": "Product",
    name: "Allen Girls Adventures School Platform",
    description:
      "Supplemental story-based learning platform for grades 3–6, aligned to state standards, with teacher dashboards showing standards, mastery evidence, and intervention recommendations.",
  },
};

export default function EducatorsPage() {
  return (
    <main className="mk">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="mkHero">
        <div className="mkHeroInner">
          <span className="mkEyebrow">🏫 For Educators & District Leaders</span>
          <h1>
            Engagement Your Students Choose.
            <br />
            <span className="mkHi">Data Your Teachers Trust.</span>
          </h1>
          <p className="mkHeroSub">
            Allen Girls Adventures is a supplemental learning platform for
            grades 3–6, aligned to state standards in math, ELA, science, and
            social studies — wrapped in stories students finish on purpose.
          </p>
          <div className="mkHeroCtas">
            <a className="mkBtn mkBtnPink" href="/partners#contact">
              Request a District Demo
            </a>
            <a className="mkBtn mkBtnGhost" href="/our-approach">
              See Our Method
            </a>
          </div>
        </div>
      </section>

      {/* Transparency */}
      <section className="mkSection">
        <div className="mkInner">
          <div className="mkCenter">
            <span className="mkKicker">Teacher Transparency</span>
            <h2>Students See a Mission. You See Everything.</h2>
            <p className="mkLead" style={{ margin: "1rem auto 0" }}>
              Kid-facing screens use motivating mission language. Your
              dashboard keeps full professional terminology — nothing is
              hidden behind the game layer.
            </p>
          </div>
          <div className="mkGrid mkGrid3">
            <div className="mkCard mkCardTopPurple">
              <span className="mkCardIcon">🎯</span>
              <h3>Standards & Skills</h3>
              <p>
                Every mission maps to specific state standards for grades
                3–6, visible at the item level — not vague topic tags.
              </p>
            </div>
            <div className="mkCard mkCardTopPink">
              <span className="mkCardIcon">🧾</span>
              <h3>Mastery Evidence</h3>
              <p>
                Mastery is measured as evidence across time, distinguishing
                fluency, reasoning, and true understanding — not one lucky
                answer.
              </p>
            </div>
            <div className="mkCard mkCardTop">
              <span className="mkCardIcon">🔁</span>
              <h3>Attempt History</h3>
              <p>
                See every attempt, hint used, and scaffold triggered, so you
                know exactly where a student&apos;s thinking broke down.
              </p>
            </div>
            <div className="mkCard mkCardTopCyan">
              <span className="mkCardIcon">♿</span>
              <h3>Accommodations</h3>
              <p>
                Accommodations change access, never dignity. Supports are
                built into the experience and documented for your records.
              </p>
            </div>
            <div className="mkCard mkCardTopPink">
              <span className="mkCardIcon">🚨</span>
              <h3>Intervention Signals</h3>
              <p>
                Misconception-aware items flag <em>why</em> students miss, and
                the system recommends targeted next steps.
              </p>
            </div>
            <div className="mkCard mkCardTopPurple">
              <span className="mkCardIcon">📈</span>
              <h3>Class & School Views</h3>
              <p>
                Roll up progress by class, grade, and building for the
                conversations district leaders actually need to have.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why it works in class */}
      <section className="mkSection mkSectionSoft">
        <div className="mkInner">
          <div className="mkSplit">
            <div>
              <span className="mkKicker">Built for Real Classrooms</span>
              <h2>Designed Around How Schools Actually Run</h2>
              <ul className="mkChecks">
                <li>
                  <strong>Low-device friendly:</strong> runs in the browser on
                  the Chromebooks and shared devices you already own.
                </li>
                <li>
                  <strong>Gradual release built in:</strong> missions move
                  from Learn It → Try It Together → Your Turn → Apply,
                  matching the instructional model your teachers use.
                </li>
                <li>
                  <strong>Support without answer-giving:</strong> hints and
                  scaffolds escalate across attempts, but the platform never
                  hands students the answer.
                </li>
                <li>
                  <strong>No-shame design:</strong> no public failure, no
                  peer comparison, no humiliating loops — engagement stays
                  intact for your most fragile learners.
                </li>
                <li>
                  <strong>Cross-curricular missions:</strong> reading, math,
                  science, and social reasoning combine the way real problems
                  do.
                </li>
              </ul>
            </div>
            <div className="mkCard" style={{ alignSelf: "start" }}>
              <span className="mkCardIcon">🤖</span>
              <h3>Safe, Bounded AI — By Design</h3>
              <p>
                S.P.A.R.K., our in-story helper, is deliberately limited:
                no open-ended chat, no answer-giving, no collection or
                transmission of student names, schools, or locations. AI
                supports thinking. It never replaces it — and it never
                free-talks with children.
              </p>
              <p style={{ marginTop: "0.8rem" }}>
                Ask us for our full AI safety and student privacy
                documentation during your demo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mkCtaBand">
        <h2>Bring the Adventure to Your District</h2>
        <p>
          Pilot programs available for individual classrooms, schools, and
          full districts. Let&apos;s talk about your goals for grades 3–6.
        </p>
        <div className="mkHeroCtas">
          <a className="mkBtn mkBtnWhite" href="/partners#contact">
            Request a Demo
          </a>
          <a className="mkBtn mkBtnGhost" href="/faq">
            Educator FAQ
          </a>
        </div>
      </section>
    </main>
  );
}
