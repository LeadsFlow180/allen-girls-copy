import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Parents & Guardians | Safe Learning App for Grades 3–6",
  description:
    "A safe, story-based learning platform for kids in grades 3–6. Standards-aligned math, reading, and science your child chooses to play — with clear progress reports for parents and guardians, and no open-ended AI chat.",
  alternates: { canonical: "/families" },
  openGraph: {
    title: "Allen Girls Adventures for Families",
    description:
      "Learning your child asks for. Progress you can actually understand.",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Allen Girls Adventures for Parents and Guardians",
  audience: { "@type": "PeopleAudience", suggestedMinAge: 8, suggestedMaxAge: 12 },
  about: {
    "@type": "Product",
    name: "Allen Girls Adventures Family Plan",
    description:
      "Story-based learning for children in grades 3–6 with family progress visibility and child-safe design.",
  },
};

export default function FamiliesPage() {
  return (
    <main className="mk">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="mkHero">
        <div className="mkHeroInner">
          <span className="mkEyebrow">💜 For Parents & Guardians</span>
          <h1>
            Learning Your Child <span className="mkHi">Asks For.</span>
            <br />
            Progress You Can Actually Understand.
          </h1>
          <p className="mkHeroSub">
            No more homework battles over &quot;boring&quot; practice apps.
            Allen Girls Adventures bakes grade 3–6 math, reading, and science
            into adventures your child won&apos;t want to put down — and
            shows you their real progress in plain language.
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

      {/* The problem/solution */}
      <section className="mkSection">
        <div className="mkInner">
          <div className="mkCenter">
            <span className="mkKicker">Why Families Choose AGA</span>
            <h2>The App They Beg For Is Also the One That Works</h2>
          </div>
          <div className="mkGrid mkGrid3">
            <div className="mkCard mkCardTopPink">
              <span className="mkCardIcon">📖</span>
              <h3>Stories First, Always</h3>
              <p>
                Your child joins Natalia, Alana, and Maya — three sisters
                solving real problems across amazing worlds. The learning is
                required to move the story forward, so kids stay in because
                they <em>want</em> to know what happens next.
              </p>
            </div>
            <div className="mkCard mkCardTopPurple">
              <span className="mkCardIcon">🎓</span>
              <h3>Real Standards Underneath</h3>
              <p>
                Every mission is aligned to state learning standards for
                grades 3, 4, 5, and 6 — math, reading, science, and social
                studies. The fun is the wrapper. The rigor is real.
              </p>
            </div>
            <div className="mkCard mkCardTop">
              <span className="mkCardIcon">💪</span>
              <h3>Confidence, Not Shame</h3>
              <p>
                Kids never see &quot;WRONG&quot; in red letters. Mistakes
                become &quot;more data needed,&quot; hints build thinking
                instead of giving answers, and every child gets a real path
                to winning the skill.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Guardian visibility */}
      <section className="mkSection mkSectionSoft">
        <div className="mkInner">
          <div className="mkSplit">
            <div>
              <span className="mkKicker">Your Guardian Dashboard</span>
              <h2>Know Exactly How They&apos;re Doing — Without a Decoder Ring</h2>
              <p className="mkLead">
                Your family dashboard translates the adventure into answers
                to the questions you actually have:
              </p>
              <ul className="mkChecks">
                <li>What skills has my child mastered — and what&apos;s next?</li>
                <li>Where are they struggling, and how is the app helping?</li>
                <li>How does their progress line up with their grade level?</li>
                <li>How can I support them at home without doing it for them?</li>
              </ul>
            </div>
            <div className="mkCard" style={{ alignSelf: "start" }}>
              <span className="mkCardIcon">🛡️</span>
              <h3>Safety Isn&apos;t a Feature. It&apos;s the Foundation.</h3>
              <ul className="mkChecks" style={{ marginTop: "0.9rem" }}>
                <li>No open-ended AI chat with children — ever</li>
                <li>No ads targeted at your child</li>
                <li>
                  Your child&apos;s real name, school, and location are never
                  transmitted to AI systems
                </li>
                <li>Kid accounts are created and controlled by you</li>
                <li>Age-appropriate content for ages 8–12, reviewed by design</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Representation teaser */}
      <section className="mkSection">
        <div className="mkInner mkCenter">
          <span className="mkKicker">Kids Belong in the Story</span>
          <h2>Heroes Who Look Like Your Child — and Her Friends</h2>
          <p className="mkLead">
            The Allen sisters lead every adventure, and the worlds they
            explore are filled with characters, cultures, and communities
            drawn from real life. When kids see themselves in the story, they
            believe the story about themselves.
          </p>
          <div className="mkHeroCtas">
            <a className="mkBtn mkBtnPurple" href="/diversity">
              How We Reflect Every Kid
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mkCtaBand">
        <h2>Try the First Adventure Free</h2>
        <p>
          Create your guardian account, add your child, and watch what
          happens when learning tastes like a brownie.
        </p>
        <div className="mkHeroCtas">
          <a className="mkBtn mkBtnWhite" href="/account/login">
            Create a Free Account
          </a>
          <a className="mkBtn mkBtnGhost" href="/faq">
            Family FAQ
          </a>
        </div>
      </section>
    </main>
  );
}
