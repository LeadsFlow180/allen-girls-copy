import { createClient } from "@supabase/supabase-js";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const COURSE_CODE = process.env.SEED_LANGUAGE_CODE || "es";
const COURSE_TITLE = process.env.SEED_COURSE_TITLE || "Spanish";

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

const SECTION = {
  title: "Section 1",
  slug: "section-1-greetings",
  description: "Build confident first greetings and short introductions.",
};

const UNIT_PACKS = [
  { name: "First greetings", prompts: [["Hello", "Hola"], ["Good morning", "Buenos dias"], ["Goodbye", "Adios"]] },
  { name: "Meet new friends", prompts: [["My name is Sara", "Me llamo Sara"], ["Nice to meet you", "Mucho gusto"], ["And you?", "Y tu?"]] },
  { name: "In class", prompts: [["Where is the class?", "Donde esta la clase?"], ["I do not understand", "No entiendo"], ["Can you repeat, please?", "Puedes repetir, por favor?"]] },
  { name: "Family hellos", prompts: [["This is my mother", "Esta es mi madre"], ["This is my brother", "Este es mi hermano"], ["How is your family?", "Como esta tu familia?"]] },
  { name: "Cafe manners", prompts: [["A water, please", "Un agua, por favor"], ["Thank you very much", "Muchas gracias"], ["How much is it?", "Cuanto cuesta?"]] },
  { name: "Time greetings", prompts: [["Good afternoon", "Buenas tardes"], ["Good evening", "Buenas noches"], ["See you tomorrow", "Hasta manana"]] },
  { name: "Feeling check-ins", prompts: [["I am happy", "Estoy feliz"], ["I am tired", "Estoy cansada"], ["I am fine", "Estoy bien"]] },
  { name: "Neighborhood chat", prompts: [["The park is near", "El parque esta cerca"], ["Where do you live?", "Donde vives?"], ["I live here", "Vivo aqui"]] },
  { name: "Hobby introductions", prompts: [["I like reading", "Me gusta leer"], ["I play football", "Juego futbol"], ["What do you like?", "Que te gusta?"]] },
  { name: "Greetings review", prompts: [["Please", "Por favor"], ["Thank you", "Gracias"], ["See you later", "Hasta luego"]] },
];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function buildStepMeta(unitName, stepKind) {
  const map = {
    start: { title: `Start · ${unitName}`, description: `Quick warm-up for ${unitName.toLowerCase()}.` },
    lesson: { title: `Lesson · ${unitName}`, description: `Core phrase learning for ${unitName.toLowerCase()}.` },
    chest: { title: `Reward · ${unitName}`, description: `Short checkpoint with reward style prompts.` },
    practice: { title: `Practice · ${unitName}`, description: `Quick retrieval practice for the key expressions.` },
    review: { title: `Review · ${unitName}`, description: `Mixed recap before unlocking the next unit.` },
  };
  return map[stepKind];
}

function getPromptOrderForStep(stepKind) {
  const orderMap = {
    start: [0, 1, 2],
    lesson: [1, 2, 0],
    chest: [2, 0, 1],
    practice: [0, 2, 1],
    review: [1, 0, 2],
  };
  return orderMap[stepKind] ?? [0, 1, 2];
}

function buildStepPrompt(unitName, stepKind, english, spanish, index) {
  const lowerUnit = unitName.toLowerCase();
  const promptMap = {
    start: `Warm-up ${index + 1}: In ${lowerUnit}, choose the Spanish phrase for "${english}".`,
    lesson: `Lesson ${index + 1}: Which answer best translates "${english}" in ${lowerUnit}?`,
    chest: `Chest check ${index + 1}: Pick the reward phrase that means "${english}".`,
    practice: `Practice ${index + 1}: Fast pick - select "${english}" in Spanish.`,
    review: `Boss review ${index + 1}: Final check - what is "${english}" in Spanish?`,
  };
  const explanationMap = {
    start: `"${spanish}" is your core warm-up phrase for this mission.`,
    lesson: `"${spanish}" is the best lesson translation in this context.`,
    chest: `"${spanish}" unlocks this chest checkpoint answer.`,
    practice: `"${spanish}" is correct. Keep practicing speed and accuracy.`,
    review: `"${spanish}" is correct. You are ready for the boss-level recap.`,
  };

  return {
    prompt: promptMap[stepKind] ?? `Choose the best Spanish phrase for "${english}".`,
    explanation: explanationMap[stepKind] ?? `Correct answer: "${spanish}".`,
  };
}

function buildQuestions(unitName, stepKind, prompts) {
  const order = getPromptOrderForStep(stepKind);
  const orderedPrompts = order.map((idx) => prompts[idx % prompts.length]);
  const optionKeys = ["a", "b", "c"];
  const questionTypes = ["multiple_choice", "fill_blank", "column_match"];

  return orderedPrompts.map((pair, index) => {
    const [english, spanish] = pair;
    const d1 = orderedPrompts[(index + 1) % orderedPrompts.length][1];
    const d2 = orderedPrompts[(index + 2) % orderedPrompts.length][1];
    const promptMeta = buildStepPrompt(unitName, stepKind, english, spanish, index);
    const shuffledAnswers = [spanish, d1, d2];
    const correctIndex = (index + stepKind.length) % shuffledAnswers.length;
    [shuffledAnswers[0], shuffledAnswers[correctIndex]] = [
      shuffledAnswers[correctIndex],
      shuffledAnswers[0],
    ];

    const questionType = questionTypes[index % questionTypes.length];
    const prompt =
      questionType === "fill_blank"
        ? `Fill in the blank: In ${unitName.toLowerCase()}, "${english}" in Spanish is _____.`
        : questionType === "column_match"
        ? `Column match: Choose the Spanish phrase that matches "${english}".`
        : promptMeta.prompt;

    return {
      slug: slugify(`${stepKind}-${unitName}-${index + 1}`),
      question_type: questionType,
      prompt,
      explanation: promptMeta.explanation,
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

async function seedCuratedSectionOne() {
  const courseId = await getCourseId();
  console.log(`Seeding curated ${SECTION.title} for "${COURSE_TITLE}" (${COURSE_CODE})...`);

  const { data: sectionRow, error: sectionErr } = await supabase
    .from("learning_sections")
    .upsert(
      {
        language_course_id: courseId,
        slug: slugify(SECTION.slug),
        title: SECTION.title,
        description: SECTION.description,
        sort_order: 1,
        is_published: true,
      },
      { onConflict: "language_course_id,slug" }
    )
    .select("id")
    .single();
  if (sectionErr) throw sectionErr;

  for (let u = 0; u < UNIT_PACKS.length; u += 1) {
    const unit = UNIT_PACKS[u];
    const unitSlug = slugify(`unit-${u + 1}-${unit.name}`);

    const { data: unitRow, error: unitErr } = await supabase
      .from("learning_units")
      .upsert(
        {
          learning_section_id: sectionRow.id,
          slug: unitSlug,
          title: `Unit ${u + 1} · ${unit.name}`,
          description: `Curated phrase set for ${unit.name.toLowerCase()}.`,
          reward_xp: 10,
          sort_order: u + 1,
          is_published: true,
        },
        { onConflict: "learning_section_id,slug" }
      )
      .select("id")
      .single();
    if (unitErr) throw unitErr;

    for (let s = 0; s < STEP_KINDS.length; s += 1) {
      const kind = STEP_KINDS[s];
      const meta = buildStepMeta(unit.name, kind);
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
            sort_order: s + 1,
            is_published: true,
          },
          { onConflict: "learning_unit_id,slug" }
        )
        .select("id")
        .single();
      if (stepErr) throw stepErr;

      const { error: clearErr } = await supabase.from("learning_questions").delete().eq("learning_step_id", stepRow.id);
      if (clearErr) throw clearErr;

      const questions = buildQuestions(unit.name, kind, unit.prompts);
      for (let q = 0; q < questions.length; q += 1) {
        const question = questions[q];
        const { data: qRow, error: qErr } = await supabase
          .from("learning_questions")
          .insert({
            learning_step_id: stepRow.id,
            slug: question.slug,
            question_type: "multiple_choice",
            from_language: "en",
            to_language: "es",
            prompt: question.prompt,
            explanation: question.explanation,
            tts_text: question.options[0].answer_text,
            tts_lang: "es-ES",
            sort_order: q + 1,
            content_source: "curated.section1.v2",
            quality_status: "reviewed",
            review_notes: "Curated starter pack v2 with step-specific question variety.",
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

        const { error: optionsErr } = await supabase.from("learning_question_options").insert(optionsRows);
        if (optionsErr) throw optionsErr;
      }
    }
  }

  console.log("Curated Section 1 seed complete (10 units x 5 steps x 3 questions).");
}

seedCuratedSectionOne().catch((error) => {
  console.error("Curated seed failed:", error.message || error);
  process.exit(1);
});
