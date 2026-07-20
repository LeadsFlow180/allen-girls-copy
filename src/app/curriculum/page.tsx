import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Curriculum — 78 Modules, 390 Lessons Across Grades 3–6",
  description:
    "The full Allen Girls Adventures curriculum: 78 modules and 390 lessons across grades 3–6, aligned to Common Core (Math & ELA), the C3 Social Studies Framework, and Massachusetts Curriculum Frameworks — all baked into story-based adventures.",
  alternates: { canonical: "/curriculum" },
};

// ============================================================
// Source of truth: AGA-CUR-001 Master Curriculum Registry v3.0
// If the registry changes, update this data object to match.
// ============================================================
type GradeData = {
  grade: number;
  ages: string;
  modules: number;
  lessons: number;
  subjects: { name: string; icon: string; items: string[] }[];
};

const grades: GradeData[] = [
  {
    grade: 3,
    ages: "8–9",
    modules: 20,
    lessons: 100,
    subjects: [
      {
        name: "Math",
        icon: "🔢",
        items: [
          "Operations, Multiplication, Division & Patterns",
          "Place Value, Rounding, Addition & Subtraction",
          "Fractions",
          "Measurement & Data",
          "Geometry",
        ],
      },
      {
        name: "English Language Arts",
        icon: "📚",
        items: [
          "Reading Literature",
          "Reading Informational Text",
          "Writing",
          "Language & Conventions",
          "Speaking & Listening / Integrated Language",
        ],
      },
      {
        name: "Science",
        icon: "🔬",
        items: [
          "Life Science",
          "Earth & Space Science",
          "Physical Science",
          "Engineering & Design",
          "Integrated Science Inquiry",
        ],
      },
      {
        name: "Social Studies",
        icon: "🌎",
        items: [
          "Communities & Citizenship",
          "Geography & Map Skills",
          "Economics & Resources",
          "History & Change Over Time",
          "Integrated Social Studies Inquiry",
        ],
      },
    ],
  },
  {
    grade: 4,
    ages: "9–10",
    modules: 19,
    lessons: 95,
    subjects: [
      {
        name: "Math",
        icon: "🔢",
        items: [
          "Number & Operations in Base Ten",
          "Number & Operations — Fractions",
          "Measurement & Data",
          "Geometry",
        ],
      },
      {
        name: "English Language Arts",
        icon: "📚",
        items: [
          "Reading Literature",
          "Reading Informational Text",
          "Writing",
          "Language & Vocabulary",
          "Speaking / Listening / Research",
        ],
      },
      {
        name: "Science",
        icon: "🔬",
        items: [
          "Energy & Motion",
          "Waves, Light & Information",
          "Earth's Surface Processes & Hazards",
          "Natural Resources & Engineering Design",
        ],
      },
      {
        name: "Social Studies",
        icon: "🌎",
        items: [
          "North America Map Systems",
          "Canada",
          "Mexico",
          "Indigenous Peoples & Ancient Civilizations of North America",
          "U.S. Expansion & Regions",
          "Diversity, Landmarks & Civic Identity",
        ],
      },
    ],
  },
  {
    grade: 5,
    ages: "10–11",
    modules: 19,
    lessons: 95,
    subjects: [
      {
        name: "Math",
        icon: "🔢",
        items: [
          "Operations & Algebraic Thinking",
          "Number & Operations in Base Ten",
          "Number & Operations — Fractions",
          "Measurement, Data & Volume",
          "Geometry & Coordinate Reasoning",
        ],
      },
      {
        name: "English Language Arts",
        icon: "📚",
        items: [
          "Reading Literature",
          "Reading Informational Text",
          "Writing",
          "Language & Vocabulary",
          "Speaking, Listening & Research Communication",
        ],
      },
      {
        name: "Science",
        icon: "🔬",
        items: [
          "Earth & Space Systems",
          "Life Science & Ecosystems",
          "Matter, Reactions & Forces",
          "Engineering & Human Impact Systems",
        ],
      },
      {
        name: "Social Studies",
        icon: "🌎",
        items: [
          "Early Colonization & Growth of Colonies",
          "Revolution & Independence",
          "Constitution & Government",
          "Growth of the Republic & Westward Expansion",
          "Slavery, Civil War, Reconstruction & Civil Rights Legacy",
        ],
      },
    ],
  },
  {
    grade: 6,
    ages: "11–12",
    modules: 20,
    lessons: 100,
    subjects: [
      {
        name: "Math",
        icon: "🔢",
        items: [
          "Ratios & Unit Rates",
          "The Number System",
          "Expressions & Equations",
          "Geometry",
          "Statistics & Probability Foundations",
        ],
      },
      {
        name: "English Language Arts",
        icon: "📚",
        items: [
          "Reading Literature",
          "Reading Informational Text",
          "Writing",
          "Language & Vocabulary",
          "Speaking, Listening & Research Communication",
        ],
      },
      {
        name: "Science",
        icon: "🔬",
        items: [
          "Earth Systems, Weather & Geologic Change",
          "Cells, Body Systems & Organism Responses",
          "Matter, Energy & Chemical Change",
          "Engineering Design & Human Impact Systems",
        ],
      },
      {
        name: "Social Studies",
        icon: "🌎",
        items: [
          "Civics, Government & Informed Citizenship",
          "Human Origins & the Paleolithic / Neolithic Eras",
          "Ancient River Valley Civilizations",
          "Classical Civilizations & Their Legacies",
          "Post-Classical Exchange, Empires & Continuity / Change",
        ],
      },
    ],
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Allen Girls Adventures Curriculum — Grades 3–6",
  about: grades.map((g) => ({
    "@type": "Course",
    name: `Allen Girls Adventures — Grade ${g.grade}`,
    description: `${g.modules} modules and ${g.lessons} lessons covering math, ELA, science, and social studies for grade ${g.grade}.`,
    educationalLevel: `Grade ${g.grade}`,
    provider: {
      "@type": "EducationalOrganization",
      name: "Allen Girls Adventures",
    },
  })),
};

export default function CurriculumPage() {
  return (
    <main className="mk">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="mkHero">
        <div className="mkHeroInner">
          <span className="mkEyebrow">📖 Our Curriculum</span>
          <h1>
            78 Modules. 390 Lessons.
            <br />
            <span className="mkHi">All Baked Into the Adventure.</span>
          </h1>
          <p className="mkHeroSub">
            Every mission in Allen Girls Adventures runs on a real academic
            spine: a complete grades 3–6 curriculum across math, English
            language arts, science, and social studies — aligned to the
            standards school systems across the U.S. actually use.
          </p>
          <div className="mkHeroCtas">
            <a className="mkBtn mkBtnPink" href="/account/login">
              Start Free Today
            </a>
            <a className="mkBtn mkBtnGhost" href="/our-approach">
              How We Teach It
            </a>
          </div>
        </div>
      </section>

      {/* Standards alignment */}
      <section className="mkSection">
        <div className="mkInner mkCenter">
          <span className="mkKicker">Standards Alignment</span>
          <h2>Built on the Standards Schools Use</h2>
          <p className="mkLead" style={{ margin: "1rem auto 0" }}>
            Our curriculum registry maps every module and lesson to
            recognized academic standards, so what your child learns in an
            adventure lines up with what they&apos;re expected to master in
            school:
          </p>
          <div className="mkGrid mkGrid3">
            <div className="mkCard mkCardTopPurple">
              <span className="mkCardIcon">➗</span>
              <h3>Common Core — Math & ELA</h3>
              <p>
                Math and English language arts modules align to the Common
                Core State Standards used across most U.S. school systems.
              </p>
            </div>
            <div className="mkCard mkCardTopPink">
              <span className="mkCardIcon">🏛️</span>
              <h3>C3 Framework — Social Studies</h3>
              <p>
                Social studies follows the College, Career & Civic Life
                (C3) Framework: inquiry, evidence, and informed civic
                thinking.
              </p>
            </div>
            <div className="mkCard mkCardTop">
              <span className="mkCardIcon">🧪</span>
              <h3>State Curriculum Frameworks</h3>
              <p>
                Science and cross-subject coverage follows rigorous state
                curriculum frameworks, including the Massachusetts
                Curriculum Frameworks.
              </p>
            </div>
          </div>
          <div className="mkChips" style={{ justifyContent: "center" }}>
            <span className="mkChip">Grade 3 · 20 Modules · 100 Lessons</span>
            <span className="mkChip">Grade 4 · 19 Modules · 95 Lessons</span>
            <span className="mkChip">Grade 5 · 19 Modules · 95 Lessons</span>
            <span className="mkChip">Grade 6 · 20 Modules · 100 Lessons</span>
          </div>
        </div>
      </section>

      {/* Per-grade breakdown */}
      {grades.map((g, i) => (
        <section
          key={g.grade}
          className={`mkSection${i % 2 === 0 ? " mkSectionSoft" : ""}`}
          id={`grade-${g.grade}`}
        >
          <div className="mkInner">
            <div className="mkCenter">
              <span className="mkKicker">
                Grade {g.grade} · Ages {g.ages} · {g.modules} Modules ·{" "}
                {g.lessons} Lessons
              </span>
              <h2>Grade {g.grade} Curriculum</h2>
            </div>
            <div className="mkGrid mkGrid2">
              {g.subjects.map((s) => (
                <div className="mkCard mkCardTopPurple" key={s.name}>
                  <span className="mkCardIcon">{s.icon}</span>
                  <h3>{s.name}</h3>
                  <ul className="mkChecks" style={{ marginTop: "0.8rem" }}>
                    {s.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mkCenter" style={{ marginTop: "1.5rem" }}>
              <a className="mkBtn mkBtnGhost" href={`/grade-${g.grade}`}>
                See the full Grade {g.grade} page →
              </a>
            </div>
          </div>
        </section>
      ))}

      {/* How it's taught */}
      <section className="mkSection">
        <div className="mkInnerNarrow mkCenter">
          <span className="mkKicker">The Difference</span>
          <h2>A Curriculum Kids Never See — and Never Escape</h2>
          <p className="mkLead">
            Worlds and curriculum are deliberately independent in our
            engine: kids freely choose which adventure world to explore,
            while a structured learning progression runs underneath every
            mission. They experience Natalia, Alana, and Maya saving the
            day. The registry tracks modules, skills, and mastery evidence
            the whole time — visible to parents and teachers, invisible to
            the fun.
          </p>
          <div className="mkHeroCtas">
            <a className="mkBtn mkBtnPurple" href="/educators">
              For Educators
            </a>
            <a className="mkBtn mkBtnPink" href="/families">
              For Families
            </a>
          </div>
        </div>
      </section>

      <section className="mkCtaBand">
        <h2>See the Curriculum in Action</h2>
        <p>The first mission is free — the learning is built in.</p>
        <div className="mkHeroCtas">
          <a className="mkBtn mkBtnWhite" href="/account/login">Start Free Today</a>
          <a className="mkBtn mkBtnGhost" href="/faq">Questions? Read the FAQ</a>
        </div>
      </section>
    </main>
  );
}
