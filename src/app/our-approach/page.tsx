import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Approach | Story-Based Learning for Grades 3–6",
  description:
    "How Allen Girls Adventures teaches math, ELA, and science for grades 3–6: standards-aligned lessons baked into real adventures, an 8-step Thinking Arc, and mastery built on evidence — not one lucky answer.",
  alternates: { canonical: "/our-approach" },
  openGraph: {
    title: "Our Approach — Learning, Baked In | Allen Girls Adventures",
    description:
      "Standards-aligned learning for grades 3–6, baked into stories kids actually want to finish.",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Our Approach — Allen Girls Adventures",
  description:
    "The Allen Girls Adventures learning method: story-first, standards-aligned education for grades 3–6 built on an 8-step Thinking Arc and evidence-based mastery.",
  about: {
    "@type": "EducationalOrganization",
    name: "Allen Girls Adventures",
    description:
      "A story-based learning platform for elementary students in grades 3–6, aligned to state standards in math, ELA, science, and social studies.",
  },
};

export default function OurApproachPage() {
  return (
    <main className="mk">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="mkHero">
        <div className="mkHeroInner">
          <span className="mkEyebrow">🧁 How We Teach</span>
          <h1>
            We Don&apos;t Boil the Broccoli.
            <br />
            <span className="mkHi">We Bake It In.</span>
          </h1>
          <p className="mkHeroSub">
            Most learning apps hand kids plain broccoli and call it dinner.
            We bake real, standards-aligned learning into adventures kids
            actually want to finish — so the skills go down easy and stick
            for good.
          </p>
          <div className="mkHeroCtas">
            <a className="mkBtn mkBtnPink" href="/account/login">
              Start Free Today
            </a>
            <a className="mkBtn mkBtnGhost" href="/educators">
              For Educators
            </a>
          </div>
        </div>
      </section>

      {/* Learning must be necessary */}
      <section className="mkSection">
        <div className="mkInner mkCenter">
          <span className="mkKicker">The Core Promise</span>
          <h2>Learning Is Never a Side Quest</h2>
          <p className="mkLead">
            In every Allen Girls Adventures mission, the learning is
            <strong> required to solve the problem</strong>. Kids don&apos;t
            answer ten math questions to unlock a game — the math IS how they
            open the gate, decode the signal, or save the day. When learning
            is necessary, kids stop asking &quot;why do I need this?&quot;
            They already know.
          </p>
          <div className="mkQuote">
            <strong>Our rule:</strong> if a skill could be removed from the
            story without the mission falling apart, it doesn&apos;t belong
            in the mission. Academic broccoli goes <em>inside</em> the
            narrative brownie — never served cold on the side.
          </div>
        </div>
      </section>

      {/* Thinking Arc — signature element */}
      <section className="mkSection mkSectionSoft">
        <div className="mkInner mkCenter">
          <span className="mkKicker">The Thinking Arc</span>
          <h2>We Teach Kids How to Think, Not Just What to Click</h2>
          <p className="mkLead">
            Every learner moves through the same eight-step arc — from
            noticing a pattern to defending a decision with evidence in a
            brand-new situation. That&apos;s the difference between getting
            an answer and owning a skill.
          </p>
          <div className="mkArc">
            <div className="mkArcStep"><strong>Notice</strong><span>Spot what matters</span></div>
            <div className="mkArcStep"><strong>Identify</strong><span>Name what you see</span></div>
            <div className="mkArcStep"><strong>Compare</strong><span>Find the difference</span></div>
            <div className="mkArcStep"><strong>Explain</strong><span>Say why it works</span></div>
            <div className="mkArcStep"><strong>Apply</strong><span>Use it for real</span></div>
            <div className="mkArcStep"><strong>Justify</strong><span>Defend your choice</span></div>
            <div className="mkArcStep"><strong>Revise</strong><span>Fix and improve</span></div>
            <div className="mkArcStep"><strong>Transfer</strong><span>Use it anywhere</span></div>
          </div>
        </div>
      </section>

      {/* How support works */}
      <section className="mkSection">
        <div className="mkInner">
          <div className="mkCenter">
            <span className="mkKicker">Support Without Spoilers</span>
            <h2>Help That Builds Kids Up — Never Hands Answers Over</h2>
            <p className="mkLead" style={{ margin: "1rem auto 0" }}>
              Productive struggle is where growth happens. Confusion without
              support is where kids give up. Our system knows the difference.
            </p>
          </div>
          <div className="mkGrid mkGrid3">
            <div className="mkCard mkCardTop">
              <span className="mkCardIcon">1️⃣</span>
              <h3>First Try: Independence</h3>
              <p>
                Kids get a real chance to work it out on their own. S.P.A.R.K.
                stays quiet and lets them think.
              </p>
            </div>
            <div className="mkCard mkCardTopPink">
              <span className="mkCardIcon">2️⃣</span>
              <h3>Second Try: A Smart Hint</h3>
              <p>
                A constructive nudge points kids toward the idea — not the
                answer. The thinking still belongs to them.
              </p>
            </div>
            <div className="mkCard mkCardTopCyan">
              <span className="mkCardIcon">3️⃣</span>
              <h3>Third Try: Stronger Scaffolds</h3>
              <p>
                Visual tools and manipulatives appear so kids can build the
                concept with their hands and eyes — and win it for real.
              </p>
            </div>
          </div>
          <div className="mkQuote">
            <strong>The No-Shame Rule:</strong> our platform never expresses
            disappointment, never compares a child to their peers, and never
            traps a learner in a humiliating loop. Errors aren&apos;t
            failures here — they&apos;re information that helps the mission
            adapt.
          </div>
        </div>
      </section>

      {/* Mastery */}
      <section className="mkSection mkSectionSoft">
        <div className="mkInner">
          <div className="mkSplit">
            <div>
              <span className="mkKicker">Real Mastery</span>
              <h2>Evidence Over Lucky Guesses</h2>
              <p className="mkLead">
                One right answer can be luck. We measure mastery as
                <strong> evidence across time</strong> — tracking fluency,
                reasoning, and true understanding as three different things,
                because they are.
              </p>
              <ul className="mkChecks">
                <li>Standards-aligned to state requirements for grades 3–6</li>
                <li>Misconception-aware questions that reveal <em>why</em> a child missed</li>
                <li>Spiral review so skills resurface across new worlds</li>
                <li>Mission bands for kids; precise standards data for adults</li>
              </ul>
            </div>
            <div className="mkGrid" style={{ marginTop: 0 }}>
              <div className="mkCard mkCardTopPurple">
                <span className="mkCardIcon">🗣️</span>
                <h3>Kids Hear Mission Language</h3>
                <p>
                  No &quot;tests.&quot; No &quot;scores.&quot; No
                  &quot;wrong.&quot; Kids run diagnostics, earn mission
                  energy, and gather more data. The rigor is identical — the
                  fear is gone.
                </p>
              </div>
              <div className="mkCard mkCardTop">
                <span className="mkCardIcon">📊</span>
                <h3>Adults See the Full Picture</h3>
                <p>
                  Behind the adventure, teachers and guardians see standards,
                  skills, attempt history, and mastery evidence in plain
                  professional terms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Whole child */}
      <section className="mkSection">
        <div className="mkInner mkCenter">
          <span className="mkKicker">The Whole Learner</span>
          <h2>More Than Math Drills</h2>
          <p className="mkLead">
            Reading, math, science, and social reasoning combine in single
            missions — the way real problems actually work. Our curriculum
            balance is intentional:
          </p>
          <div className="mkChips" style={{ justifyContent: "center" }}>
            <span className="mkChip">40% STEM</span>
            <span className="mkChip">20% ELA</span>
            <span className="mkChip">20% Social-Emotional</span>
            <span className="mkChip">10% Culture</span>
            <span className="mkChip">10% Life Skills</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mkCtaBand">
        <h2>See the Difference in One Mission</h2>
        <p>
          Start free and watch your child choose to keep learning — because
          the adventure won&apos;t finish without them.
        </p>
        <div className="mkHeroCtas">
          <a className="mkBtn mkBtnWhite" href="/account/login">
            Start Free Today
          </a>
          <a className="mkBtn mkBtnGhost" href="/compare">
            How We Compare
          </a>
        </div>
      </section>
    </main>
  );
}
