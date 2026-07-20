import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Learning Platforms for Grades 3–6 | AGA vs Khan Academy, IXL & Prodigy",
  description:
    "Comparing learning apps for elementary students? See how Allen Girls Adventures differs from Khan Academy, IXL, Prodigy Math, and Clever-connected tools — story-first learning, no-shame design, and standards-aligned mastery for grades 3–6.",
  alternates: { canonical: "/compare" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Compare Elementary Learning Platforms — Allen Girls Adventures",
  description:
    "An honest comparison of learning platforms for grades 3–6, including how Allen Girls Adventures differs from Khan Academy, IXL, and Prodigy Math.",
};

export default function ComparePage() {
  return (
    <main className="mk">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="mkHero">
        <div className="mkHeroInner">
          <span className="mkEyebrow">⚖️ Honest Comparison</span>
          <h1>
            Choosing a Learning App
            <br />
            <span className="mkHi">for Grades 3–6?</span>
          </h1>
          <p className="mkHeroSub">
            Khan Academy, IXL, Prodigy Math, and Clever-connected classroom
            tools all do real things well. Here&apos;s an honest look at
            where each shines — and where Allen Girls Adventures is
            deliberately different.
          </p>
        </div>
      </section>

      <section className="mkSection">
        <div className="mkInner">
          <div className="mkCenter">
            <span className="mkKicker">The Short Version</span>
            <h2>Practice Apps Drill Skills. We Make Skills Necessary.</h2>
            <p className="mkLead" style={{ margin: "1rem auto 0" }}>
              Most platforms attach a game or a video to practice questions.
              Our missions are built the other way around: the learning is
              required to solve the story&apos;s problem, so kids engage
              because they want to — not because points are dangling.
            </p>
          </div>

          <div className="mkTableWrap">
            <table className="mkTable">
              <thead>
                <tr>
                  <th>What Matters</th>
                  <th>Typical Practice Platforms*</th>
                  <th>Allen Girls Adventures</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Role of the story</td>
                  <td>Reward wrapper around question sets</td>
                  <td>
                    <span className="mkTagYes">Learning is required to
                    advance the story</span>
                  </td>
                </tr>
                <tr>
                  <td>Subjects per session</td>
                  <td>Usually one subject at a time</td>
                  <td>
                    <span className="mkTagYes">Math, reading, science &
                    social reasoning combine in missions</span>
                  </td>
                </tr>
                <tr>
                  <td>What a wrong answer does</td>
                  <td>Marks it wrong; may lower a score or streak</td>
                  <td>
                    <span className="mkTagYes">Treats errors as data;
                    escalates hints and scaffolds without giving answers</span>
                  </td>
                </tr>
                <tr>
                  <td>Emotional design</td>
                  <td>Scores, streaks, and leaderboards vary by platform</td>
                  <td>
                    <span className="mkTagYes">No-shame rule: no peer
                    comparison, no failure loops</span>
                  </td>
                </tr>
                <tr>
                  <td>How mastery is judged</td>
                  <td>Often percent-correct on recent items</td>
                  <td>
                    <span className="mkTagYes">Evidence across time —
                    fluency, reasoning, and mastery tracked separately</span>
                  </td>
                </tr>
                <tr>
                  <td>Representation</td>
                  <td>Varies; heroes are often generic or customizable</td>
                  <td>
                    <span className="mkTagYes">Three Black girl leads and
                    culturally rich worlds by design</span>
                  </td>
                </tr>
                <tr>
                  <td>AI with kids</td>
                  <td>Some now offer open-ended AI tutors/chat</td>
                  <td>
                    <span className="mkTagYes">Bounded, in-story helper
                    only — no open-ended chat, no answer-giving, no student
                    PII to AI</span>
                  </td>
                </tr>
                <tr>
                  <td>Standards alignment (grades 3–6)</td>
                  <td>Generally strong on major platforms</td>
                  <td>
                    <span className="mkTagYes">Aligned to state standards,
                    with teacher-visible mapping</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: "1rem", fontSize: "0.88rem", opacity: 0.75 }}>
            *General patterns across popular practice-first platforms.
            Individual products differ and evolve — always evaluate current
            versions against your own goals.
          </p>
        </div>
      </section>

      <section className="mkSection mkSectionSoft">
        <div className="mkInner">
          <div className="mkCenter">
            <span className="mkKicker">Platform by Platform</span>
            <h2>Where Each Tool Fits</h2>
          </div>
          <div className="mkGrid mkGrid2">
            <div className="mkCard mkCardTopPurple">
              <h3>Khan Academy</h3>
              <p>
                Excellent free video lessons and practice across a huge range
                of topics — a strong reference library. AGA is different by
                design: instead of watch-then-practice, kids learn inside a
                continuing story where the skill is the key to the next door.
                Many families use both: Khan as the encyclopedia, AGA as the
                adventure kids ask for.
              </p>
            </div>
            <div className="mkCard mkCardTopPink">
              <h3>IXL</h3>
              <p>
                Deep, comprehensive skill practice with fine-grained
                coverage. Where IXL drills breadth, AGA builds the thinking
                arc — noticing, explaining, justifying, and transferring —
                inside missions, with a no-shame support ladder for kids who
                get discouraged by falling scores.
              </p>
            </div>
            <div className="mkCard mkCardTop">
              <h3>Prodigy Math</h3>
              <p>
                A popular math game kids enjoy. The key difference: in
                Prodigy-style designs, questions interrupt the game. In AGA,
                the learning <em>is</em> the game — remove the skill and the
                mission can&apos;t be solved. We also span ELA, science, and
                social studies, not math alone.
              </p>
            </div>
            <div className="mkCard mkCardTopCyan">
              <h3>Clever & Classroom Rostering</h3>
              <p>
                Clever is sign-on and rostering infrastructure, not a
                curriculum — teachers use it to reach tools like ours.
                Schools evaluating AGA: talk to us about rostering and
                single sign-on options for your district during a pilot
                conversation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mkSection">
        <div className="mkInnerNarrow mkCenter">
          <span className="mkKicker">The Bottom Line</span>
          <h2>If Your Child Loves the Practice App, Keep It</h2>
          <p className="mkLead">
            Seriously. Tools that work deserve to stay. But if your child
            dreads practice time, guesses to make questions stop, or has
            started saying &quot;I&apos;m just bad at math&quot; — the
            problem may be the serving, not the student. That&apos;s the
            exact problem we built Allen Girls Adventures to solve.
          </p>
        </div>
      </section>

      <section className="mkCtaBand">
        <h2>Taste the Difference Yourself</h2>
        <p>One free mission tells you more than any comparison table.</p>
        <div className="mkHeroCtas">
          <a className="mkBtn mkBtnWhite" href="/account/login">Start Free Today</a>
          <a className="mkBtn mkBtnGhost" href="/our-approach">See Our Method</a>
        </div>
      </section>
    </main>
  );
}
