import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — Learning Platform for Grades 3–6",
  description:
    "Answers to common questions about Allen Girls Adventures: grades and subjects covered, standards alignment, child safety, AI policy, pricing, school use, and how the platform works for parents and teachers.",
  alternates: { canonical: "/faq" },
};

const faqs: { q: string; a: string }[] = [
  {
    q: "What is Allen Girls Adventures?",
    a: "Allen Girls Adventures is a story-based learning platform for elementary students in grades 3–6. Kids join three sisters — Natalia, Alana, and Maya — on missions across adventure worlds where standards-aligned math, reading, science, and social studies skills are required to solve the story's problems.",
  },
  {
    q: "What grades and ages is it for?",
    a: "The platform is designed for grades 3, 4, 5, and 6 — roughly ages 8 to 12. Content difficulty adapts within missions, and mastery is tracked against grade-level standards behind the scenes.",
  },
  {
    q: "Is Allen Girls Adventures aligned to state standards?",
    a: "Yes. Missions are aligned to state learning standards for grades 3–6 across math, ELA, science, and social studies. Kids see mission language on screen, while teachers and guardians can see the underlying standards, skills, and mastery evidence.",
  },
  {
    q: "How is this different from Khan Academy, IXL, or Prodigy?",
    a: "Most platforms attach games or videos to practice questions. In Allen Girls Adventures, the learning is required to advance the story — remove the skill and the mission can't be solved. We also combine subjects in single missions, use a no-shame support ladder instead of scores and streaks, and measure mastery as evidence over time rather than one lucky answer. See our full comparison at /compare.",
  },
  {
    q: "Does the app use AI with my child? Is it safe?",
    a: "S.P.A.R.K., the in-story robot buddy, is intentionally bounded: no open-ended chat, no answer-giving, and no shame or disappointment language. Your child's real name, school, and location are never transmitted to AI systems. Guardians create and control kid accounts.",
  },
  {
    q: "What happens when my child gets an answer wrong?",
    a: "Nothing shaming. First attempt is independent; second attempt earns a constructive hint; third attempt brings stronger visual scaffolds or manipulatives. Errors are treated as information that helps the mission adapt — the platform never compares your child to peers or locks them in a failure loop.",
  },
  {
    q: "Can teachers and schools use Allen Girls Adventures?",
    a: "Yes. Teachers get dashboards with standards mapping, mastery evidence, attempt history, accommodations, and intervention recommendations. The platform runs in the browser on Chromebooks and shared devices. Schools and districts can request a pilot through our Partners page.",
  },
  {
    q: "What subjects are covered?",
    a: "Our curriculum balance is roughly 40% STEM, 20% ELA, 20% social-emotional learning, 10% culture, and 10% life skills — and missions often combine subjects the way real problems do.",
  },
  {
    q: "How do parents see progress?",
    a: "Your guardian dashboard translates the adventure into plain language: skills mastered, current focus, where your child is being supported, and how progress lines up with their grade level.",
  },
  {
    q: "Is there a free way to try it?",
    a: "Yes — create a free guardian account, add your child, and start the first adventure at no cost.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function FaqPage() {
  return (
    <main className="mk">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="mkHero">
        <div className="mkHeroInner">
          <span className="mkEyebrow">❓ Frequently Asked Questions</span>
          <h1>
            Real Questions. <span className="mkHi">Straight Answers.</span>
          </h1>
          <p className="mkHeroSub">
            Everything parents, guardians, and educators ask us most — about
            grades, standards, safety, AI, and how the adventure actually
            teaches.
          </p>
        </div>
      </section>

      <section className="mkSection">
        <div className="mkInnerNarrow">
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
        <h2>Still Curious? The First Mission Is Free.</h2>
        <p>The fastest answer is watching your child not want to stop.</p>
        <div className="mkHeroCtas">
          <a className="mkBtn mkBtnWhite" href="/account/login">Start Free Today</a>
          <a className="mkBtn mkBtnGhost" href="/families">For Families</a>
        </div>
      </section>
    </main>
  );
}
