import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Bold Girls. Big Adventures.",
  description:
    "Allen Girls Adventures is a story-based learning platform for grades 3–6. Meet the mission behind Natalia, Alana, Maya, and S.P.A.R.K. — and the family-built company making learning something kids choose.",
  alternates: { canonical: "/about" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Allen Girls Adventures",
  slogan: "Bold Girls. Big Adventures.",
  description:
    "A story-based educational platform for elementary students in grades 3–6, combining standards-aligned curriculum with original characters, worlds, and games.",
  knowsAbout: [
    "elementary math",
    "elementary reading",
    "elementary science",
    "grades 3-6 education",
    "story-based learning",
    "game-based learning",
  ],
};

export default function AboutPage() {
  return (
    <main className="mk">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="mkHero">
        <div className="mkHeroInner">
          <span className="mkEyebrow">✨ About Allen Girls Adventures</span>
          <h1>
            Bold Girls. <span className="mkHi">Big Adventures.</span>
            <br />
            Real Learning.
          </h1>
          <p className="mkHeroSub">
            We&apos;re a family-built education company on a simple mission:
            make grades 3–6 learning something kids choose — not something
            they survive.
          </p>
        </div>
      </section>

      <section className="mkSection">
        <div className="mkInnerNarrow">
          <span className="mkKicker">Our Story</span>
          <h2>It Started With a Question Every Parent Knows</h2>
          <p className="mkLead">
            Why will a child spend hours mastering a video game — memorizing
            maps, testing strategies, learning from every failure — and then
            melt down over ten minutes of math practice?
          </p>
          <p className="mkLead">
            We realized the problem was never the child. It was the serving.
            Games give kids a reason to think hard: a world they care about,
            a problem that matters, and a real chance to win. Most learning
            apps give them plain broccoli and a timer.
          </p>
          <p className="mkLead">
            So we built Allen Girls Adventures around three sisters —
            Natalia the Mind, Alana the Voice, and Maya the Heart — and
            worlds where standards-aligned learning is the key that unlocks
            every door. The broccoli is still in there. We just learned how
            to bake.
          </p>
        </div>
      </section>

      <section className="mkSection mkSectionSoft">
        <div className="mkInner mkCenter">
          <span className="mkKicker">What We Believe</span>
          <h2>The Promises Behind Every Adventure</h2>
          <div className="mkGrid mkGrid2">
            <div className="mkCard mkCardTopPink">
              <span className="mkCardIcon">🧠</span>
              <h3>Thinking Beats Clicking</h3>
              <p>
                We build kids who can notice, explain, defend, and transfer
                — not kids who guess until the buzzer stops. Fundamentals
                first, always.
              </p>
            </div>
            <div className="mkCard mkCardTopPurple">
              <span className="mkCardIcon">🤗</span>
              <h3>No Shame, Ever</h3>
              <p>
                Errors are information, not embarrassment. Our platform never
                compares kids to peers or locks them in failure loops.
              </p>
            </div>
            <div className="mkCard mkCardTop">
              <span className="mkCardIcon">🌍</span>
              <h3>Every Kid Belongs in the Story</h3>
              <p>
                Culturally distinctive lead characters and worlds that
                reflect real communities — because representation is part of
                rigor.
              </p>
            </div>
            <div className="mkCard mkCardTopCyan">
              <span className="mkCardIcon">🛡️</span>
              <h3>Safety Can&apos;t Be Traded</h3>
              <p>
                No open-ended AI chat with kids, no answer-giving bots, no
                selling out child safety for growth. This rule outranks
                every business decision we make.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mkSection">
        <div className="mkInnerNarrow mkCenter">
          <span className="mkKicker">Who We Serve</span>
          <h2>Built for Kids. Backed by Adults.</h2>
          <p className="mkLead">
            Students in grades 3–6 get the adventure. Parents and guardians
            get clear progress they can act on. Teachers and district leaders
            get standards, mastery evidence, and intervention signals.
            Everyone gets the same truth, told in the language they need.
          </p>
          <div className="mkHeroCtas">
            <a className="mkBtn mkBtnPurple" href="/families">For Families</a>
            <a className="mkBtn mkBtnPink" href="/educators">For Educators</a>
            <a className="mkBtn mkBtnPurple" href="/partners">For Partners</a>
          </div>
        </div>
      </section>

      <section className="mkCtaBand">
        <h2>Come See What Learning Tastes Like Now</h2>
        <p>Three sisters. Eight worlds. One free account away.</p>
        <div className="mkHeroCtas">
          <a className="mkBtn mkBtnWhite" href="/account/login">Start Free Today</a>
          <a className="mkBtn mkBtnGhost" href="/characters">Meet the Girls</a>
        </div>
      </section>
    </main>
  );
}
