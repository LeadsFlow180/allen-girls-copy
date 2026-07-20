import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Learning Lab — Advice for Parents of Grades 3–6 Kids",
  description:
    "Practical, honest guidance for parents and teachers of kids in grades 3–6: learning app comparisons, math and reading help, AI safety, and how kids actually build skills.",
  alternates: { canonical: "/blog" },
};

// Add new posts to the TOP of this array. Each post lives at
// src/app/blog/<slug>/page.tsx
const posts = [
  {
    slug: "is-ai-safe-for-kids-learning-apps",
    title: "Is AI Safe for Kids? A Parent's Guide to AI in Learning Apps",
    description:
      "AI is showing up in nearly every learning app your child uses. Here's what's actually safe, what to watch for, and the questions to ask before you hand over your kid's screen time.",
    date: "2026-07-19",
    readMinutes: 8,
    tag: "Safety",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "The Learning Lab — Allen Girls Adventures",
  description:
    "Advice for parents and teachers of kids in grades 3–6 on learning apps, math and reading help, and safe technology.",
  blogPost: posts.map((p) => ({
    "@type": "BlogPosting",
    headline: p.title,
    datePublished: p.date,
    url: `https://www.allengirlsadventures.com/blog/${p.slug}`,
  })),
};

export default function BlogIndexPage() {
  return (
    <main className="mk">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="mkHero">
        <div className="mkHeroInner">
          <span className="mkEyebrow">🔬 The Learning Lab</span>
          <h1>
            Honest Answers for Parents of
            <br />
            <span className="mkHi">Grades 3–6 Kids</span>
          </h1>
          <p className="mkHeroSub">
            No fluff, no fear-mongering. Practical guidance on learning
            apps, math and reading struggles, AI safety, and how kids
            actually build skills that stick.
          </p>
        </div>
      </section>

      <section className="mkSection">
        <div className="mkInner">
          <div className="mkGrid mkGrid2">
            {posts.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <article className="mkCard mkCardTopPink" style={{ height: "100%" }}>
                  <span
                    className="mkKicker"
                    style={{ marginBottom: "0.4rem" }}
                  >
                    {p.tag} · {p.readMinutes} min read
                  </span>
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mkCtaBand">
        <h2>While You Read, They Could Be Learning</h2>
        <p>The first Allen Girls adventure is free.</p>
        <div className="mkHeroCtas">
          <a className="mkBtn mkBtnWhite" href="/account/login">Start Free Today</a>
          <a className="mkBtn mkBtnGhost" href="/our-approach">How We Teach</a>
        </div>
      </section>
    </main>
  );
}
