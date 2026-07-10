import { createClient } from "@supabase/supabase-js";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const COURSE_CODE = process.env.SEED_LANGUAGE_CODE || "es";
const COURSE_TITLE_BY_CODE = {
  es: "Spanish",
  fr: "French",
  ar: "Arabic",
  ur: "Urdu",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  en: "English",
};
const COURSE_TITLE = process.env.SEED_COURSE_TITLE || COURSE_TITLE_BY_CODE[COURSE_CODE] || "Spanish";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your shell."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const STEP_KINDS = ["start", "lesson", "chest", "practice", "review"];

const SECTION_THEMES = [
  {
    title: "Section 1",
    slug: "section-1-greetings",
    description: "Build confident first greetings and short introductions.",
    units: [
      "First greetings",
      "Meet new friends",
      "In class",
      "Family hellos",
      "Cafe manners",
      "Time greetings",
      "Feeling check-ins",
      "Neighborhood chat",
      "Hobby introductions",
      "Greetings review",
    ],
  },
  {
    title: "Section 2",
    slug: "section-2-daily-conversations",
    description: "Handle everyday mini-conversations with natural phrases.",
    units: [
      "Morning routine",
      "At school entrance",
      "Asking simple questions",
      "Giving simple answers",
      "Polite requests",
      "Thanking and replying",
      "Saying sorry",
      "Checking understanding",
      "Short phone chat",
      "Conversation review",
    ],
  },
  {
    title: "Section 3",
    slug: "section-3-people-and-places",
    description: "Talk about people, places, and what is around you.",
    units: [
      "My family",
      "My classroom",
      "My home",
      "My neighborhood",
      "At the park",
      "At the store",
      "In the city",
      "Where is it?",
      "Giving directions",
      "People and places review",
    ],
  },
  {
    title: "Section 4",
    slug: "section-4-food-and-daily-life",
    description: "Use practical language for food, routines, and preferences.",
    units: [
      "Breakfast words",
      "Lunch and dinner",
      "Ordering food",
      "Favorite snacks",
      "At the market",
      "Healthy choices",
      "Daily schedule",
      "Weekend plans",
      "Simple comparisons",
      "Food and life review",
    ],
  },
  {
    title: "Section 5",
    slug: "section-5-school-and-learning",
    description: "Communicate in class with useful school expressions.",
    units: [
      "Class objects",
      "Classroom actions",
      "Homework talk",
      "Subjects and timetables",
      "Asking teacher help",
      "Group work language",
      "Project presentation",
      "Study habits",
      "Test day phrases",
      "School review",
    ],
  },
  {
    title: "Section 6",
    slug: "section-6-emotions-and-opinions",
    description: "Express emotions, opinions, and personal preferences.",
    units: [
      "Basic feelings",
      "How are you today?",
      "Likes and dislikes",
      "What do you think?",
      "Agreeing politely",
      "Disagreeing politely",
      "Giving reasons",
      "Making suggestions",
      "Encouraging others",
      "Emotions review",
    ],
  },
  {
    title: "Section 7",
    slug: "section-7-world-and-culture",
    description: "Speak about travel, culture, weather, and celebrations.",
    units: [
      "Weather talk",
      "Travel basics",
      "At the station",
      "Asking for help",
      "Cultural greetings",
      "Festivals and events",
      "Shopping language",
      "Simple storytelling",
      "Past plans",
      "World review",
    ],
  },
  {
    title: "Section 8",
    slug: "section-8-communication-mastery",
    description: "Consolidate learning with practical communication scenarios.",
    units: [
      "Real-life roleplay",
      "School interview",
      "Making invitations",
      "Problem solving talk",
      "Team collaboration",
      "Personal goals",
      "Giving short speeches",
      "Reflecting progress",
      "Final preparation",
      "Final review challenge",
    ],
  },
];

const PHRASE_LIBRARY_BY_LANG = {
  es: [
    ["Hello", "Hola"],
    ["Good morning", "Buenos dias"],
    ["Goodbye", "Adios"],
    ["Thank you", "Gracias"],
    ["Please", "Por favor"],
    ["How are you?", "Como estas?"],
    ["I am fine", "Estoy bien"],
    ["My name is Ana", "Me llamo Ana"],
    ["Nice to meet you", "Mucho gusto"],
    ["See you later", "Hasta luego"],
    ["Where is the school?", "Donde esta la escuela?"],
    ["I like reading", "Me gusta leer"],
    ["I do not understand", "No entiendo"],
    ["Can you help me?", "Puedes ayudarme?"],
    ["What time is it?", "Que hora es?"],
    ["I am hungry", "Tengo hambre"],
    ["I am happy", "Estoy feliz"],
    ["I am tired", "Estoy cansada"],
    ["It is raining", "Esta lloviendo"],
    ["The class starts now", "La clase empieza ahora"],
  ],
  fr: [
    ["Hello", "Bonjour"],
    ["Good morning", "Bonjour"],
    ["Goodbye", "Au revoir"],
    ["Thank you", "Merci"],
    ["Please", "S'il vous plait"],
    ["How are you?", "Comment ca va ?"],
    ["I am fine", "Je vais bien"],
    ["My name is Ana", "Je m'appelle Ana"],
    ["Nice to meet you", "Ravi de vous rencontrer"],
    ["See you later", "A plus tard"],
    ["Where is the school?", "Ou est l'ecole ?"],
    ["I like reading", "J'aime lire"],
    ["I do not understand", "Je ne comprends pas"],
    ["Can you help me?", "Pouvez-vous m'aider ?"],
    ["What time is it?", "Quelle heure est-il ?"],
    ["I am hungry", "J'ai faim"],
    ["I am happy", "Je suis heureuse"],
    ["I am tired", "Je suis fatiguee"],
    ["It is raining", "Il pleut"],
    ["The class starts now", "Le cours commence maintenant"],
  ],
  ar: [
    ["Hello", "Marhaban"],
    ["Good morning", "Sabah al-khayr"],
    ["Goodbye", "Ma'a as-salama"],
    ["Thank you", "Shukran"],
    ["Please", "Min fadlak"],
    ["How are you?", "Kayfa haluk?"],
    ["I am fine", "Ana bikhayr"],
    ["My name is Ana", "Ismi Ana"],
    ["Nice to meet you", "Tasharrafna"],
    ["See you later", "Araaka لاحiqan"],
    ["Where is the school?", "Ayna al-madrasa?"],
    ["I like reading", "Uhibb al-qira'a"],
    ["I do not understand", "La afham"],
    ["Can you help me?", "Hal yumkinuk musaadati?"],
    ["What time is it?", "Kam as-sa'a?"],
    ["I am hungry", "Ana jai'a"],
    ["I am happy", "Ana sa'ida"],
    ["I am tired", "Ana mut'aba"],
    ["It is raining", "Al-jaw mumtir"],
    ["The class starts now", "Yabda' ad-dars al-an"],
  ],
  ur: [
    ["Hello", "Assalam o Alaikum"],
    ["Good morning", "Subah bakhair"],
    ["Goodbye", "Khuda hafiz"],
    ["Thank you", "Shukriya"],
    ["Please", "Barah-e-karam"],
    ["How are you?", "Aap kaise hain?"],
    ["I am fine", "Main theek hoon"],
    ["My name is Ana", "Mera naam Ana hai"],
    ["Nice to meet you", "Aap se mil kar khushi hui"],
    ["See you later", "Phir milte hain"],
    ["Where is the school?", "School kahan hai?"],
    ["I like reading", "Mujhe parhna pasand hai"],
    ["I do not understand", "Mujhe samajh nahi aaya"],
    ["Can you help me?", "Kya aap meri madad kar sakte hain?"],
    ["What time is it?", "Kitne baje hain?"],
    ["I am hungry", "Mujhe bhook lagi hai"],
    ["I am happy", "Main khush hoon"],
    ["I am tired", "Main thak gayi hoon"],
    ["It is raining", "Barish ho rahi hai"],
    ["The class starts now", "Class ab shuru hoti hai"],
  ],
  de: [
    ["Hello", "Hallo"],
    ["Good morning", "Guten Morgen"],
    ["Goodbye", "Auf Wiedersehen"],
    ["Thank you", "Danke"],
    ["Please", "Bitte"],
    ["How are you?", "Wie geht es dir?"],
    ["I am fine", "Mir geht es gut"],
    ["My name is Ana", "Ich heisse Ana"],
    ["Nice to meet you", "Freut mich, dich kennenzulernen"],
    ["See you later", "Bis spaeter"],
    ["Where is the school?", "Wo ist die Schule?"],
    ["I like reading", "Ich lese gern"],
    ["I do not understand", "Ich verstehe nicht"],
    ["Can you help me?", "Kannst du mir helfen?"],
    ["What time is it?", "Wie spaet ist es?"],
    ["I am hungry", "Ich habe Hunger"],
    ["I am happy", "Ich bin gluecklich"],
    ["I am tired", "Ich bin muede"],
    ["It is raining", "Es regnet"],
    ["The class starts now", "Der Unterricht beginnt jetzt"],
  ],
  it: [
    ["Hello", "Ciao"],
    ["Good morning", "Buongiorno"],
    ["Goodbye", "Arrivederci"],
    ["Thank you", "Grazie"],
    ["Please", "Per favore"],
    ["How are you?", "Come stai?"],
    ["I am fine", "Sto bene"],
    ["My name is Ana", "Mi chiamo Ana"],
    ["Nice to meet you", "Piacere di conoscerti"],
    ["See you later", "A dopo"],
    ["Where is the school?", "Dove si trova la scuola?"],
    ["I like reading", "Mi piace leggere"],
    ["I do not understand", "Non capisco"],
    ["Can you help me?", "Puoi aiutarmi?"],
    ["What time is it?", "Che ore sono?"],
    ["I am hungry", "Ho fame"],
    ["I am happy", "Sono felice"],
    ["I am tired", "Sono stanca"],
    ["It is raining", "Sta piovendo"],
    ["The class starts now", "La lezione inizia adesso"],
  ],
  pt: [
    ["Hello", "Ola"],
    ["Good morning", "Bom dia"],
    ["Goodbye", "Adeus"],
    ["Thank you", "Obrigado"],
    ["Please", "Por favor"],
    ["How are you?", "Como voce esta?"],
    ["I am fine", "Estou bem"],
    ["My name is Ana", "Meu nome e Ana"],
    ["Nice to meet you", "Prazer em conhecer voce"],
    ["See you later", "Ate mais tarde"],
    ["Where is the school?", "Onde fica a escola?"],
    ["I like reading", "Eu gosto de ler"],
    ["I do not understand", "Eu nao entendo"],
    ["Can you help me?", "Voce pode me ajudar?"],
    ["What time is it?", "Que horas sao?"],
    ["I am hungry", "Estou com fome"],
    ["I am happy", "Estou feliz"],
    ["I am tired", "Estou cansada"],
    ["It is raining", "Esta chovendo"],
    ["The class starts now", "A aula comeca agora"],
  ],
  en: [
    ["Hello", "Hello"],
    ["Good morning", "Good morning"],
    ["Goodbye", "Goodbye"],
    ["Thank you", "Thank you"],
    ["Please", "Please"],
    ["How are you?", "How are you?"],
    ["I am fine", "I am fine"],
    ["My name is Ana", "My name is Ana"],
    ["Nice to meet you", "Nice to meet you"],
    ["See you later", "See you later"],
    ["Where is the school?", "Where is the school?"],
    ["I like reading", "I like reading"],
    ["I do not understand", "I do not understand"],
    ["Can you help me?", "Can you help me?"],
    ["What time is it?", "What time is it?"],
    ["I am hungry", "I am hungry"],
    ["I am happy", "I am happy"],
    ["I am tired", "I am tired"],
    ["It is raining", "It is raining"],
    ["The class starts now", "The class starts now"],
  ],
};

const TTS_LANG_BY_CODE = {
  es: "es-ES",
  fr: "fr-FR",
  ar: "ar-SA",
  ur: "ur-PK",
  de: "de-DE",
  it: "it-IT",
  pt: "pt-BR",
  en: "en-US",
};

const PHRASE_LIBRARY = PHRASE_LIBRARY_BY_LANG[COURSE_CODE] || PHRASE_LIBRARY_BY_LANG.es;
const TARGET_LANGUAGE = COURSE_CODE;
const TARGET_TTS_LANG = TTS_LANG_BY_CODE[COURSE_CODE] || "es-ES";

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function pickTriplet(sectionIndex, unitIndex) {
  const start = (sectionIndex * 7 + unitIndex * 3) % PHRASE_LIBRARY.length;
  return [
    PHRASE_LIBRARY[start],
    PHRASE_LIBRARY[(start + 4) % PHRASE_LIBRARY.length],
    PHRASE_LIBRARY[(start + 9) % PHRASE_LIBRARY.length],
  ];
}

function buildStepMeta(unitName, stepKind) {
  const map = {
    start: {
      title: `Start · ${unitName}`,
      description: `Quick warm-up to introduce ${unitName.toLowerCase()} vocabulary.`,
    },
    lesson: {
      title: `Lesson · ${unitName}`,
      description: `Core lesson for ${unitName.toLowerCase()} with guided multiple-choice practice.`,
    },
    chest: {
      title: `Reward · ${unitName}`,
      description: `Short reward checkpoint reinforcing key phrases before moving on.`,
    },
    practice: {
      title: `Practice · ${unitName}`,
      description: `Fast retrieval drills for ${unitName.toLowerCase()} expressions.`,
    },
    review: {
      title: `Review · ${unitName}`,
      description: `Mixed recap quiz to confirm mastery of ${unitName.toLowerCase()}.`,
    },
  };
  return map[stepKind];
}

function buildQuestions(sectionIndex, unitIndex, stepKind, unitName) {
  const phrases = pickTriplet(sectionIndex, unitIndex);
  const optionKeys = ["a", "b", "c"];
  const questionTypes = ["multiple_choice", "fill_blank", "column_match"];
  return phrases.map((pair, idx) => {
    const [english, spanish] = pair;
    const distractor1 = phrases[(idx + 1) % phrases.length][1];
    const distractor2 = phrases[(idx + 2) % phrases.length][1];
    const shuffledAnswers = [spanish, distractor1, distractor2];
    const correctIndex = (sectionIndex + unitIndex + idx) % shuffledAnswers.length;
    [shuffledAnswers[0], shuffledAnswers[correctIndex]] = [
      shuffledAnswers[correctIndex],
      shuffledAnswers[0],
    ];

    const questionType = questionTypes[idx % questionTypes.length];
    const prompt =
      questionType === "fill_blank"
        ? `Fill in the blank: In ${unitName.toLowerCase()}, "${english}" in ${COURSE_TITLE} is _____.`
        : questionType === "column_match"
        ? `Column match: Choose the ${COURSE_TITLE} phrase that matches "${english}".`
        : `In ${unitName.toLowerCase()}, choose the best ${COURSE_TITLE} phrase for "${english}".`;

    return {
      slug: slugify(`${stepKind}-${unitName}-${idx + 1}`),
      question_type: questionType,
      from_language: "en",
      to_language: TARGET_LANGUAGE,
      prompt,
      explanation: `"${spanish}" is the most natural ${COURSE_TITLE} match for "${english}" in this context.`,
      tts_text: spanish,
      tts_lang: TARGET_TTS_LANG,
      options: shuffledAnswers.map((answerText, optionIndex) => ({
        option_key: optionKeys[optionIndex],
        answer_text: answerText,
        is_correct: answerText === spanish,
        sort_order: optionIndex + 1,
      })),
    };
  });
}

async function getCourseId() {
  const { data: lang, error: langErr } = await supabase
    .from("learning_languages")
    .select("id")
    .eq("code", COURSE_CODE)
    .maybeSingle();

  if (langErr) throw langErr;
  if (!lang) throw new Error(`No language found for code "${COURSE_CODE}". Run 007 migration first.`);

  const { data: course, error: courseErr } = await supabase
    .from("language_courses")
    .select("id")
    .eq("language_id", lang.id)
    .eq("title", COURSE_TITLE)
    .maybeSingle();

  if (courseErr) throw courseErr;
  if (!course) throw new Error(`No course "${COURSE_TITLE}" found for code "${COURSE_CODE}".`);
  return course.id;
}

async function seed() {
  const courseId = await getCourseId();
  console.log(
    `Seeding curriculum for course "${COURSE_TITLE}" (${COURSE_CODE}) with target language "${TARGET_LANGUAGE}"...`
  );

  for (let s = 0; s < SECTION_THEMES.length; s += 1) {
    const section = SECTION_THEMES[s];
    const sectionSlug = slugify(section.slug);

    const { data: sectionRow, error: sectionErr } = await supabase
      .from("learning_sections")
      .upsert(
        {
          language_course_id: courseId,
          slug: sectionSlug,
          title: section.title,
          description: section.description,
          sort_order: s + 1,
          is_published: true,
        },
        { onConflict: "language_course_id,slug" }
      )
      .select("id")
      .single();

    if (sectionErr) throw sectionErr;

    for (let u = 0; u < section.units.length; u += 1) {
      const unitName = section.units[u];
      const unitSlug = slugify(`unit-${u + 1}-${unitName}`);

      const { data: unitRow, error: unitErr } = await supabase
        .from("learning_units")
        .upsert(
          {
            learning_section_id: sectionRow.id,
            slug: unitSlug,
            title: `Unit ${u + 1} · ${unitName}`,
            description: `Build practical skill in ${unitName.toLowerCase()}.`,
            reward_xp: 10,
            sort_order: u + 1,
            is_published: true,
          },
          { onConflict: "learning_section_id,slug" }
        )
        .select("id")
        .single();

      if (unitErr) throw unitErr;

      for (let k = 0; k < STEP_KINDS.length; k += 1) {
        const kind = STEP_KINDS[k];
        const meta = buildStepMeta(unitName, kind);
        const stepSlug = slugify(`${unitSlug}-${kind}`);

        const { data: stepRow, error: stepErr } = await supabase
          .from("learning_steps")
          .upsert(
            {
              learning_unit_id: unitRow.id,
              slug: stepSlug,
              kind,
              title: meta.title,
              description: meta.description,
              sort_order: k + 1,
              is_published: true,
            },
            { onConflict: "learning_unit_id,slug" }
          )
          .select("id")
          .single();

        if (stepErr) throw stepErr;

        const { error: deleteQErr } = await supabase
          .from("learning_questions")
          .delete()
          .eq("learning_step_id", stepRow.id);
        if (deleteQErr) throw deleteQErr;

        const questions = buildQuestions(s, u, kind, unitName);
        for (let q = 0; q < questions.length; q += 1) {
          const question = questions[q];
          const { data: qRow, error: qErr } = await supabase
            .from("learning_questions")
            .insert({
              learning_step_id: stepRow.id,
              slug: question.slug,
              question_type: question.question_type,
              from_language: question.from_language,
              to_language: question.to_language,
              prompt: question.prompt,
              explanation: question.explanation,
              tts_text: question.tts_text,
              tts_lang: question.tts_lang,
              sort_order: q + 1,
            })
            .select("id")
            .single();

          if (qErr) throw qErr;

          const optionsRows = question.options.map((option) => ({
            learning_question_id: qRow.id,
            option_key: option.option_key,
            answer_text: option.answer_text,
            is_correct: option.is_correct,
            sort_order: option.sort_order,
          }));

          const { error: optErr } = await supabase
            .from("learning_question_options")
            .insert(optionsRows);
          if (optErr) throw optErr;
        }
      }
    }
    console.log(`Seeded ${section.title} (${section.units.length} units)`);
  }

  console.log("Curriculum seed complete: 8 sections x 10 units x 5 steps.");
}

seed().catch((error) => {
  console.error("Curriculum seed failed:", error.message || error);
  process.exit(1);
});
