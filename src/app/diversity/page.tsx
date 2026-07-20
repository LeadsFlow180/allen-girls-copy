import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diversity & Representation | Every Kid Belongs in the Story",
  description:
    "How Allen Girls Adventures reflects diversity in its stories: culturally distinctive lead characters, worlds inspired by real cultures and histories, and learning design where accommodations change access — never dignity.",
  alternates: { canonical: "/diversity" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Diversity and Representation at Allen Girls Adventures",
  description:
    "Allen Girls Adventures' commitment to representation: diverse lead characters, culturally rich worlds, and inclusive learning design for grades 3–6.",
};

export default function DiversityPage() {
  return (
    <main className="mk">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="mkHero">
        <div className="mkHeroInner">
          <span className="mkEyebrow">🌍 Diversity & Representation</span>
          <h1>
            Every Kid Belongs <span className="mkHi">in the Story.</span>
          </h1>
          <p className="mkHeroSub">
            Representation isn&apos;t a checkbox at Allen Girls Adventures —
            it&apos;s the starting point. Our heroes, our worlds, and our
            learning design were built so every child can see themselves
            leading the adventure.
          </p>
        </div>
      </section>

      <section className="mkSection">
        <div className="mkInner">
          <div className="mkCenter">
            <span className="mkKicker">Our Heroes</span>
            <h2>Three Black Girls Lead Every Adventure</h2>
            <p className="mkLead" style={{ margin: "1rem auto 0" }}>
              Natalia, Alana, and Maya Allen aren&apos;t sidekicks, best
              friends, or the diverse addition to someone else&apos;s team.
              They are the Mind, the Voice, and the Heart of this universe —
              the planners, the problem-solvers, and the brave ones.
            </p>
          </div>
          <div className="mkGrid mkGrid3">
            <div className="mkCard mkCardTopPurple">
              <span className="mkCardIcon">🧠</span>
              <h3>Smart Is the Default</h3>
              <p>
                Our girls lead with strategy, math, observation, and empathy.
                Kids watch Black girls being brilliant as the normal state of
                the world — because it is.
              </p>
            </div>
            <div className="mkCard mkCardTopPink">
              <span className="mkCardIcon">👨‍👩‍👧‍👧</span>
              <h3>Family at the Center</h3>
              <p>
                Loving parents, a wise grandfather, a busy neighborhood.
                Around The Way is a joyful, real home base — not a hardship
                backdrop.
              </p>
            </div>
            <div className="mkCard mkCardTop">
              <span className="mkCardIcon">🤝</span>
              <h3>A Real Cast, Not a Quota</h3>
              <p>
                From the neighborhood crew to the mentors across our worlds,
                our supporting cast reflects many cultures and backgrounds —
                each written as a full person with strengths, flaws, and
                growth of their own.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mkSection mkSectionSoft">
        <div className="mkInner">
          <div className="mkSplit">
            <div>
              <span className="mkKicker">Our Worlds</span>
              <h2>Cultures Are Content, Not Costumes</h2>
              <p className="mkLead">
                Culture makes up a dedicated slice of our curriculum by
                design. Across eight adventure worlds — from ancient legends
                to future cities — kids explore histories, traditions, and
                communities with the same respect we&apos;d want for our own.
              </p>
              <ul className="mkChecks">
                <li>Worlds inspired by real histories and civilizations</li>
                <li>Cultural learning woven into missions, not tacked on</li>
                <li>Characters speak for themselves — never as stereotypes</li>
                <li>Social-emotional learning in every adventure arc</li>
              </ul>
            </div>
            <div className="mkCard" style={{ alignSelf: "start" }}>
              <span className="mkCardIcon">♿</span>
              <h3>Inclusion Reaches the Learning, Too</h3>
              <p>
                Our rule is simple: <strong>accommodations change access,
                not dignity.</strong> Multiple kinds of intelligence matter
                here — visual thinkers, verbal thinkers, hands-on builders,
                and careful observers all get real paths to mastery.
              </p>
              <p style={{ marginTop: "0.8rem" }}>
                And our No-Shame Rule protects every learner: no public
                failure, no peer comparison, no child left in a loop that
                makes them feel small.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mkSection">
        <div className="mkInnerNarrow mkCenter">
          <span className="mkKicker">Why It Matters</span>
          <h2>When Kids See Themselves, They Believe in Themselves</h2>
          <p className="mkLead">
            Research and common sense agree: children work harder, take more
            risks, and persist longer when the heroes of the story look like
            them and their friends. Representation isn&apos;t separate from
            academic outcomes. It fuels them.
          </p>
        </div>
      </section>

      <section className="mkCtaBand">
        <h2>Meet the Girls Leading the Way</h2>
        <p>Natalia, Alana, Maya — and their robotic best buddy, S.P.A.R.K.</p>
        <div className="mkHeroCtas">
          <a className="mkBtn mkBtnWhite" href="/characters">Meet the Characters</a>
          <a className="mkBtn mkBtnGhost" href="/about">Our Story</a>
        </div>
      </section>
    </main>
  );
}
