import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partners & Sponsors | Work With Allen Girls Adventures",
  description:
    "Partner with Allen Girls Adventures: sponsorships, school and district pilots, licensing, media, and community partnerships for a story-based learning platform serving grades 3–6.",
  alternates: { canonical: "/partners" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Partner with Allen Girls Adventures",
  about: {
    "@type": "EducationalOrganization",
    name: "Allen Girls Adventures",
  },
};

export default function PartnersPage() {
  return (
    <main className="mk">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="mkHero">
        <div className="mkHeroInner">
          <span className="mkEyebrow">🤝 Partners & Sponsors</span>
          <h1>
            Help Us Put Real Learning
            <br />
            <span className="mkHi">in More Kids&apos; Hands.</span>
          </h1>
          <p className="mkHeroSub">
            Allen Girls Adventures is a growing story-learning universe —
            platform, games, and animated content — serving students in
            grades 3–6. If your organization believes kids deserve better
            than boring, let&apos;s talk.
          </p>
          <div className="mkHeroCtas">
            <a className="mkBtn mkBtnPink" href="#contact">Start a Conversation</a>
          </div>
        </div>
      </section>

      <section className="mkSection">
        <div className="mkInner">
          <div className="mkCenter">
            <span className="mkKicker">Ways to Partner</span>
            <h2>Where We&apos;re Looking for Partners</h2>
          </div>
          <div className="mkGrid mkGrid2">
            <div className="mkCard mkCardTopPink">
              <span className="mkCardIcon">🎗️</span>
              <h3>Sponsorships</h3>
              <p>
                Sponsor access for schools, community programs, and families
                who need it most. Sponsorship packages can fund classrooms,
                grade levels, or entire school communities — with reporting
                that shows real learning impact, not just logins.
              </p>
            </div>
            <div className="mkCard mkCardTopPurple">
              <span className="mkCardIcon">🏫</span>
              <h3>School & District Pilots</h3>
              <p>
                We partner with schools and districts on structured pilots
                for grades 3–6: clear goals, standards-aligned content,
                teacher dashboards, and an honest read-out at the end.
              </p>
            </div>
            <div className="mkCard mkCardTop">
              <span className="mkCardIcon">🎬</span>
              <h3>Media & Content</h3>
              <p>
                The Allen Girls universe spans games, stories, and animated
                content built for reuse across platforms. We&apos;re open to
                conversations with media, streaming, and publishing partners
                who share our standards for kids&apos; content.
              </p>
            </div>
            <div className="mkCard mkCardTopCyan">
              <span className="mkCardIcon">🌟</span>
              <h3>Community & Nonprofit</h3>
              <p>
                Libraries, after-school programs, mentoring organizations,
                and community groups: we build partnerships that meet kids
                where they already are.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mkSection mkSectionSoft">
        <div className="mkInner">
          <div className="mkSplit">
            <div>
              <span className="mkKicker">Why Partner With AGA</span>
              <h2>A Brand Partners Can Stand Behind</h2>
              <ul className="mkChecks">
                <li>
                  <strong>Culturally distinctive lead characters</strong> —
                  three Black girl heroes leading a universe kids love
                </li>
                <li>
                  <strong>Story-first, standards-aligned learning</strong> for
                  grades 3–6 across math, ELA, science, and social studies
                </li>
                <li>
                  <strong>Safe-by-design AI</strong> — no open-ended chat
                  with children, no student PII sent to AI systems
                </li>
                <li>
                  <strong>Low-device deployment</strong> — works on the
                  browsers and Chromebooks communities already have
                </li>
                <li>
                  <strong>Transmedia universe</strong> — platform, games, and
                  animation built from one canon
                </li>
              </ul>
            </div>
            <div className="mkCard" style={{ alignSelf: "start" }}>
              <span className="mkCardIcon">🛡️</span>
              <h3>Our One Non-Negotiable</h3>
              <p>
                Commercial partnerships can never dilute child safety,
                educational rigor, or the integrity of our characters and
                stories. We put that in writing before we put anything else
                in writing. If that&apos;s your standard too, we&apos;ll get
                along great.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mkSection" id="contact">
        <div className="mkInnerNarrow mkCenter">
          <span className="mkKicker">Get in Touch</span>
          <h2>Start a Partnership Conversation</h2>
          <p className="mkLead">
            Tell us who you are, what you have in mind, and the communities
            you serve. We read every inquiry and respond to serious partners
            quickly.
          </p>
          <div className="mkHeroCtas">
            {/* TODO: swap to partners@ domain email once domain mail is set up */}
            <a
              className="mkBtn mkBtnPink"
              href="mailto:allengirlsadventures@gmail.com?subject=Partnership%20Inquiry"
            >
              allengirlsadventures@gmail.com
            </a>
          </div>
          <p style={{ marginTop: "1.4rem", fontSize: "0.95rem", opacity: 0.8 }}>
            Educators requesting a demo: mention your school or district and
            preferred grade levels (3–6) so we can route you fast.
          </p>
        </div>
      </section>

      <section className="mkCtaBand">
        <h2>Built With Purpose. Growing With Partners.</h2>
        <p>Learn more about the mission before you reach out.</p>
        <div className="mkHeroCtas">
          <a className="mkBtn mkBtnWhite" href="/about">Our Story</a>
          <a className="mkBtn mkBtnGhost" href="/our-approach">Our Approach</a>
        </div>
      </section>
    </main>
  );
}
