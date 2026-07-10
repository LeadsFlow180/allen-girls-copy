/**
 * PLACEMENT ASSESSMENT — RUNTIME DATA
 *
 * Editorial source of truth — keep questions in sync with these files ONLY:
 *   src/data/lms/placement-test/AGA_Placement_Assessment_ELA_v3.docx
 *   src/data/lms/placement-test/AGA_Placement_Assessment_Math_v1.docx
 *
 * Story Intel passages live in `ELA_STORY_INTEL` below; mirror the docx text when you revise.
 *
 * Do NOT add, remove, or edit questions here without first updating
 * the master documents above.
 */

export interface PlacementItem {
  id: string;
  section: "ela" | "math";
  /** Shown in a “read first” box before the prompt when set (paired Story Intel items). */
  passageTitle?: string;
  passage?: string;
  prompt: string;
  choices: string[];
  correctIndex: number; // 0-based
}

/** Story Intel — shared passages (keep in sync with placement-test ELA master doc). */
const ELA_STORY_INTEL = {
  passageA: {
    title: "The Wet Drawing",
    text: `Maya had just finished her best drawing yet — a bright rocket ship soaring past stars. She set it on the craft table and went to rinse her paintbrush. A sudden gust slipped through the open window. When she turned around, the paper was gone.

"Where's my drawing?" Maya asked, scanning the room.

Natalia glanced at the window, then pointed. "Maybe check outside?"

Maya hurried onto the porch. Her drawing was pressed against the railing, fluttering in the breeze. When she lifted it, one corner felt cold and damp from the morning dew.

Alana jogged over beside her. "Good thing it didn't fly all the way down the street," she said.

Maya hugged the paper carefully. "Next time I'm taping the corners," she promised.`,
  },
  passageB: {
    title: "The Footprints in the Dust",
    text: `Saturday morning was supposed to be simple. The sisters had agreed to organize markers and old posters in the basement storage room before lunch.

Maya was sliding a box onto a shelf when she froze. A line of small footprints crossed the dusty floor — too neat to be theirs, and too narrow for any of the adults who usually came down here.

She crouched low and studied the print. "These toes are tiny," she murmured. "Like whoever made them was in a hurry."

Natalia knelt beside her. Together they followed the trail along the base of the wall until the prints stopped at a seam in the paneling. Natalia pressed gently. The panel clicked inward, revealing a narrow gap behind the wall.

S.P.A.R.K.'s lights pulsed once, scanning the opening.

Alana let out a long breath. "So nobody disappeared," she said, relieved.

Natalia was already leaning closer. "They found a door," she said quietly — and the adventure felt like it had only just begun.`,
  },
  passageC: {
    title: "The Message in the Ceiling",
    text: `The sound began during cleanup.

Maya was stacking game boxes when she heard tapping overhead — three quick taps, then one longer scrape, then the pattern repeated. She tilted her head. "Maybe it's the heater?" she asked.

Natalia shook her head. "Heaters don't count like that. That's a pattern."

Alana dragged a chair to the center of the room and reached toward a ceiling panel. Dust drifted down as she wiggled the edge. "I think something is stuck," she said.

"Or someone hid something up there," Natalia added, eyes sharp.

When the panel shifted, a glint of silver showed — not duct tape, not wiring, but a stiff sheet of paper covered in tight, strange symbols. S.P.A.R.K. had been quietly scanning the ceiling the whole time.

Natalia stared at the find. "That is definitely not ordinary paper," she whispered.`,
  },
  passageD: {
    title: "The Wrong Turn",
    text: `The path through Crystal Tundra was supposed to be straightforward: follow the tall blue stones north until the signal relay came into view.

Halfway there, the trail split. One branch looked freshly packed, the snow smooth and bright. The other was older, scuffed by many boots and sled runners.

"This one looks safer," Alana said, nodding toward the newer path. "Clear markers, clean snow — easy to follow."

Natalia hesitated. "Or maybe nobody uses it because something's wrong with it," she countered. "Fresh doesn't always mean good. What if someone dragged gear through here yesterday and covered up a problem?"

Maya knelt between the two trails, brushing snow aside with her mittened hand. Her expression changed as she studied the map again.

Before she could speak, S.P.A.R.K. cut in with a weather alert: strong winds would sweep across the tundra within the hour.

On the map, the newer route crossed a narrow stone bridge stretched over a deep frozen ravine. The older route looped wider — longer, but gentler.

Maya stood slowly, voice steady. "The path that seems newest could actually be the most dangerous," she said.`,
  },
} as const;

export const placementItems: PlacementItem[] = [

  // ─────────────────────────────────────────────────────────
  // ELA — SIGNAL CLARITY SCAN
  // ─────────────────────────────────────────────────────────

  // Skill Group 1: Grammar & Conventions

  {
    id: "ela-sc-g1-q1",
    section: "ela",
    prompt: "Which sentence uses the correct verb tense?",
    choices: [
      "Yesterday, Maya will discover a hidden map inside the old library.",
      "Yesterday, Maya discovered a hidden map inside the old library.",
      "Yesterday, Maya has discovered a hidden map inside the old library.",
      "Yesterday, Maya is discovering a hidden map inside the old library.",
    ],
    correctIndex: 1,
  },

  {
    id: "ela-sc-g1-q2",
    section: "ela",
    prompt: "Which sentence correctly uses punctuation in dialogue?",
    choices: [
      '"We have to move now" said Natalia, "or we\'ll miss our window."',
      '"We have to move now," said Natalia, "or we\'ll miss our window."',
      '"We have to move now" said Natalia "or we\'ll miss our window."',
      '"We have to move now," said Natalia "or we\'ll miss our window."',
    ],
    correctIndex: 1,
  },

  {
    id: "ela-sc-g1-stretch",
    section: "ela",
    prompt: 'Read this sentence: "When Natalia and Maya found the old map, she wasn\'t sure where it led." What is the problem with this sentence, and which revision fixes it?',
    choices: [
      'The verb tense is wrong. Fix: "When Natalia and Maya find the old map, she wasn\'t sure where it led."',
      'The pronoun "she" is vague — it\'s unclear which girl is referred to. Fix: "When Natalia and Maya found the old map, Natalia wasn\'t sure where it led."',
      'The word "old" is in the wrong place. Fix: "When Natalia and Maya found the map old, she wasn\'t sure where it led."',
      "There is no problem. The sentence is correct as written.",
    ],
    correctIndex: 1,
  },

  // Skill Group 2: Vocabulary & Word Meaning

  {
    id: "ela-sc-g2-q1",
    section: "ela",
    prompt: 'Read this sentence: "Alana was persistent — even after three failed attempts, she kept working on the puzzle until she finally solved it." What does persistent most likely mean?',
    choices: [
      "Easily frustrated and ready to quit",
      "Continuing to try even when things are difficult",
      "Moving quickly to finish before others",
      "Asking for help from a trusted teammate",
    ],
    correctIndex: 1,
  },

  {
    id: "ela-sc-g2-q2",
    section: "ela",
    prompt: "The word reactivate contains the prefix re- and the root active. What does reactivate most likely mean?",
    choices: [
      "To make something active for the very first time",
      "To make something active again",
      "To stop something from being active",
      "To study how something becomes active",
    ],
    correctIndex: 1,
  },

  {
    id: "ela-sc-g2-stretch",
    section: "ela",
    prompt: 'Read this sentence: "Alana carefully saved every coin she earned from her lemonade stand." Which word, if used to describe Alana\'s behavior, carries the most positive connotation?',
    choices: ["Stingy", "Cheap", "Thrifty", "Hoarding"],
    correctIndex: 2,
  },

  // Skill Group 3: Figurative Language

  {
    id: "ela-sc-g3-q1",
    section: "ela",
    prompt: 'Maya said, "This math problem is a piece of cake." What does she most likely mean?',
    choices: [
      "The math problem looks like dessert",
      "She wants to eat something after finishing",
      "The math problem is easy",
      "She baked a cake while solving the problem",
    ],
    correctIndex: 2,
  },

  {
    id: "ela-sc-g3-q2",
    section: "ela",
    prompt: '"When Natalia finally understood the pattern, her mind was a lighthouse cutting through fog." This is an example of a metaphor. What does the metaphor mean?',
    choices: [
      "Natalia was standing near a lighthouse in the fog",
      "Natalia's thinking became clear and guided her through confusion",
      "Natalia was afraid of the dark and needed a light",
      "Natalia built a lighthouse as part of her science project",
    ],
    correctIndex: 1,
  },

  {
    id: "ela-sc-g3-stretch",
    section: "ela",
    prompt: '"The old forest swallowed the sisters whole as they stepped off the trail. The trees leaned in, whispering secrets to each other." What figure of speech is being used, and what does it suggest?',
    choices: [
      'Simile — it compares the forest to a hungry animal using "like" or "as"',
      "Personification — the forest and trees are given human qualities to suggest the sisters feel surrounded and watched",
      'Metaphor — it directly states the forest is a person without using "like" or "as"',
      "Hyperbole — it exaggerates how tall the trees are to create drama",
    ],
    correctIndex: 1,
  },

  // ─────────────────────────────────────────────────────────
  // ELA — STORY INTEL SCAN
  // ─────────────────────────────────────────────────────────

  // Passage A — Tier 1 · Grade 2–3: "The Wet Drawing"
  // Q1: Story Structure · Q2: Character · Q3: Point of View · Q4: Inference

  {
    id: "ela-si-pA-q1",
    section: "ela",
    passageTitle: ELA_STORY_INTEL.passageA.title,
    passage: ELA_STORY_INTEL.passageA.text,
    prompt: "What is the problem in this story, and how is it solved?",
    choices: [
      "Maya spills water on her drawing, and Alana helps her dry it off.",
      "Maya's drawing blows outside through the window, and she finds it on the porch.",
      "Natalia loses Maya's drawing and has to go look for it outside.",
      "Maya forgets where she put her drawing, and Alana remembers for her.",
    ],
    correctIndex: 1,
  },

  {
    id: "ela-si-pA-q2",
    section: "ela",
    passageTitle: ELA_STORY_INTEL.passageA.title,
    passage: ELA_STORY_INTEL.passageA.text,
    prompt: "When Maya says her drawing is missing, Natalia points toward the open window. What does this tell you about Natalia?",
    choices: [
      "She wants Maya to close the window because it is cold.",
      "She is observant and thinks carefully before she speaks.",
      "She already knew the drawing was outside and was waiting to tell Maya.",
      "She is not paying attention to what Maya is saying.",
    ],
    correctIndex: 1,
  },

  {
    id: "ela-si-pA-q3",
    section: "ela",
    passageTitle: ELA_STORY_INTEL.passageA.title,
    passage: ELA_STORY_INTEL.passageA.text,
    prompt: "This story is told by a narrator who is not one of the characters. What is one thing the narrator tells us that none of the characters say out loud?",
    choices: [
      "That the drawing had a rocket ship on it.",
      "That one corner of the drawing was wet when Maya picked it up.",
      "That the wind had blown the drawing away.",
      "That Maya planned to use tape next time.",
    ],
    correctIndex: 1,
  },

  {
    id: "ela-si-pA-q4",
    section: "ela",
    passageTitle: ELA_STORY_INTEL.passageA.title,
    passage: ELA_STORY_INTEL.passageA.text,
    prompt: 'Alana says "Good thing it didn\'t fly all the way down the street." What does this line tell you about the situation?',
    choices: [
      "Alana thinks the drawing is not very important.",
      "The drawing could have been lost completely — finding it on the porch was lucky.",
      "Alana is warning Maya that the wind is still blowing and could move the drawing again.",
      "The street outside is dangerous and the sisters are not allowed to go there.",
    ],
    correctIndex: 1,
  },

  // Passage B — Tier 2 · Grade 3–4: "The Footprints in the Dust"
  // Q1: Story Structure · Q2: Character · Q3: Point of View · Q4: Inference

  {
    id: "ela-si-pB-q1",
    section: "ela",
    passageTitle: ELA_STORY_INTEL.passageB.title,
    passage: ELA_STORY_INTEL.passageB.text,
    prompt: "Which best describes the sequence of events in this passage?",
    choices: [
      "The sisters find mysterious footprints, investigate where they lead, and discover a hidden panel in the wall.",
      "S.P.A.R.K. discovers a hidden door and calls the sisters down to the basement to investigate.",
      "The sisters follow footprints outside and find a door hidden behind the house.",
      "Natalia goes to the basement for markers and finds that someone has been moving things around.",
    ],
    correctIndex: 0,
  },

  {
    id: "ela-si-pB-q2",
    section: "ela",
    passageTitle: ELA_STORY_INTEL.passageB.title,
    passage: ELA_STORY_INTEL.passageB.text,
    prompt: "When Maya sees the footprints, she crouches down and analyzes their size. What does this tell you about Maya?",
    choices: [
      "She is frightened and is checking to make sure the prints are not dangerous.",
      "She is observant and instinctively starts gathering evidence to solve the mystery.",
      "She already knows whose footprints they are and is pretending not to.",
      "She wants to be the first one to find the hidden door before her sisters do.",
    ],
    correctIndex: 1,
  },

  {
    id: "ela-si-pB-q3",
    section: "ela",
    passageTitle: ELA_STORY_INTEL.passageB.title,
    passage: ELA_STORY_INTEL.passageB.text,
    prompt: 'At the end of the passage, Alana says "So nobody disappeared" and Natalia says "They found a door." How do these reactions differ?',
    choices: [
      "Alana is relieved the mystery is over while Natalia is focused on what the discovery means next.",
      "Alana is confused and Natalia is angry that there is a hidden door.",
      "Alana wants to open the door while Natalia thinks they should leave it alone.",
      "Both sisters react the same way — they are both surprised by S.P.A.R.K.'s discovery.",
    ],
    correctIndex: 0,
  },

  {
    id: "ela-si-pB-q4",
    section: "ela",
    passageTitle: ELA_STORY_INTEL.passageB.title,
    passage: ELA_STORY_INTEL.passageB.text,
    prompt: 'The passage opens with "Saturday morning was supposed to be simple." Why is this an effective opening line?',
    choices: [
      "It tells the reader that the sisters had no plans that day and were bored.",
      "It creates contrast — the reader immediately senses that things will not stay simple, which builds anticipation.",
      "It explains why Natalia went to the basement instead of one of her sisters.",
      "It tells the reader that Saturday is always the most boring day of the week for the sisters.",
    ],
    correctIndex: 1,
  },

  // Passage C — Tier 3 · Grade 4–5: "The Message in the Ceiling"
  // Q1: Story Structure · Q2: Character · Q3: Point of View · Q4: Deep Inference
  // Stretch Q1: Textual Evidence · Stretch Q2: Author's Craft

  {
    id: "ela-si-pC-q1",
    section: "ela",
    passageTitle: ELA_STORY_INTEL.passageC.title,
    passage: ELA_STORY_INTEL.passageC.text,
    prompt: "What causes the sisters to investigate the ceiling, and what do they discover?",
    choices: [
      "S.P.A.R.K. detects movement and alerts the sisters, who find a broken light fixture.",
      "A repeated patterned sound draws their attention upward, leading them to find a hidden silver paper with strange symbols.",
      "Alana notices a bent ceiling panel while cleaning and calls her sisters over to investigate.",
      "Maya hears a sound she thinks is the heater, but Natalia identifies it as a message being sent to them.",
    ],
    correctIndex: 1,
  },

  {
    id: "ela-si-pC-q2",
    section: "ela",
    passageTitle: ELA_STORY_INTEL.passageC.title,
    passage: ELA_STORY_INTEL.passageC.text,
    prompt: 'Alana says "I think something is stuck" and Natalia says "Or someone hid something up there." What do these two responses reveal about how each sister thinks?',
    choices: [
      "Alana looks for the simplest physical explanation while Natalia immediately considers human intention and deeper meaning.",
      "Alana is wrong and Natalia is right — the story confirms Natalia's explanation is better.",
      "Both sisters are equally confused and neither explanation turns out to be correct.",
      "Alana is more careful than Natalia, who jumps to conclusions too quickly.",
    ],
    correctIndex: 0,
  },

  {
    id: "ela-si-pC-q3",
    section: "ela",
    passageTitle: ELA_STORY_INTEL.passageC.title,
    passage: ELA_STORY_INTEL.passageC.text,
    prompt: "Maya hears the sound first but it is Alana who physically investigates the panel. How does this division of roles shape the passage?",
    choices: [
      "It shows Maya is too frightened to act, so Alana has to take over.",
      "It shows the sisters have distinct strengths — noticing, analyzing, and acting — that work together to move the story forward.",
      "It suggests Alana is the leader of the group even though Natalia speaks the most.",
      "It means the narrator prefers to follow Alana's perspective over Maya's.",
    ],
    correctIndex: 1,
  },

  {
    id: "ela-si-pC-q4",
    section: "ela",
    passageTitle: ELA_STORY_INTEL.passageC.title,
    passage: ELA_STORY_INTEL.passageC.text,
    prompt: 'Natalia ends the passage by saying "That is definitely not ordinary paper." Why is this an effective closing line?',
    choices: [
      "It confirms what S.P.A.R.K. already told the sisters about the panel.",
      "It closes the immediate mystery while opening a larger one — the symbols on the paper suggest the discovery is just beginning.",
      "It tells the reader that Natalia has seen this kind of paper before in a science class.",
      "It shows Natalia is more excited than her sisters about what they found.",
    ],
    correctIndex: 1,
  },

  {
    id: "ela-si-pC-stretch1",
    section: "ela",
    passageTitle: ELA_STORY_INTEL.passageC.title,
    passage: ELA_STORY_INTEL.passageC.text,
    prompt: "Which detail from early in the passage turns out to be most important to what the sisters discover, and why?",
    choices: [
      "That Maya thought it was the heater — because it shows she almost missed the clue entirely.",
      "That the sound had a pattern of three short taps and one long scrape — because a deliberate pattern suggests an intentional signal, not a random noise.",
      "That Alana was carrying game boxes — because it shows she was the closest to the ceiling panel.",
      "That S.P.A.R.K. scanned the ceiling — because without him the sisters would never have found the panel.",
    ],
    correctIndex: 1,
  },

  {
    id: "ela-si-pC-stretch2",
    section: "ela",
    passageTitle: ELA_STORY_INTEL.passageC.title,
    passage: ELA_STORY_INTEL.passageC.text,
    prompt: 'The passage opens with a very short sentence: "The sound began during cleanup." Why is this an effective structural choice?',
    choices: [
      "It tells the reader exactly when the story takes place so they are not confused.",
      "Its brevity creates immediate focus and tension — dropping the reader into the action before any setup, making the sound feel sudden and unavoidable.",
      "It shows the sisters were doing chores, which explains why they were all in the same room.",
      "Short opening sentences are always more effective than longer ones in mystery stories.",
    ],
    correctIndex: 1,
  },

  // Passage D — Tier 3+ · Grade 5–6: "The Wrong Turn"
  // Q1: Character & Reasoning · Q2: Theme · Q3: Author's Craft & POV · Q4: Deep Inference & Analysis
  // Stretch Q1: Textual Evidence · Stretch Q2: Theme Development

  {
    id: "ela-si-pD-q1",
    section: "ela",
    passageTitle: ELA_STORY_INTEL.passageD.title,
    passage: ELA_STORY_INTEL.passageD.text,
    prompt: "Alana concludes the newer trail is safer. Natalia challenges that conclusion. What is the key difference in how they reason?",
    choices: [
      "Alana uses her instincts while Natalia refuses to make any decision without more data.",
      "Alana takes the evidence at face value while Natalia considers what might have caused the evidence to look that way — questioning the assumption beneath it.",
      "Alana is more experienced in the tundra while Natalia has never traveled in snow before.",
      "Natalia is more cautious by nature while Alana is reckless and does not think before acting.",
    ],
    correctIndex: 1,
  },

  {
    id: "ela-si-pD-q2",
    section: "ela",
    passageTitle: ELA_STORY_INTEL.passageD.title,
    passage: ELA_STORY_INTEL.passageD.text,
    prompt: 'Maya concludes: "The path that seems newest could actually be the most dangerous." What broader theme does this reflect?',
    choices: [
      "Newer things are always more dangerous than older, more familiar things.",
      "Appearances can be misleading — careful thinking requires questioning what evidence seems to show, not just accepting it.",
      "In dangerous situations, it is always better to turn back than to risk choosing wrong.",
      "Maps and technology are unreliable and should not be trusted in the field.",
    ],
    correctIndex: 1,
  },

  {
    id: "ela-si-pD-q3",
    section: "ela",
    passageTitle: ELA_STORY_INTEL.passageD.title,
    passage: ELA_STORY_INTEL.passageD.text,
    prompt: 'The passage says "Her expression changed" rather than telling us directly what Maya is thinking. What effect does this narrative choice create?',
    choices: [
      "It tells us the narrator does not know Maya well enough to describe her thoughts.",
      "It builds suspense and invites the reader to infer — we sense something has shifted in Maya before she speaks, making her next line more powerful.",
      "It shows Maya is trying to hide her feelings from her sisters so they are not worried.",
      "It is a mistake — the author should have told us directly what Maya was feeling.",
    ],
    correctIndex: 1,
  },

  {
    id: "ela-si-pD-q4",
    section: "ela",
    passageTitle: ELA_STORY_INTEL.passageD.title,
    passage: ELA_STORY_INTEL.passageD.text,
    prompt: "How does S.P.A.R.K.'s weather alert function in the passage beyond simply providing information?",
    choices: [
      "It replaces the map as the sisters' most important source of information.",
      "It transforms the decision from a puzzle into an urgent dilemma — now the cost of choosing wrong is not just wasted time but real danger, raising the emotional and physical stakes.",
      "It proves that Natalia was right to be cautious and that Alana's suggestion was wrong.",
      "It ends the debate between the sisters by giving them a clear reason to turn back.",
    ],
    correctIndex: 1,
  },

  {
    id: "ela-si-pD-stretch1",
    section: "ela",
    passageTitle: ELA_STORY_INTEL.passageD.title,
    passage: ELA_STORY_INTEL.passageD.text,
    prompt: "Which two details most strongly support the idea that choosing the wrong path could have serious consequences?",
    choices: [
      '"A narrow crossing that stretched over a deep frozen ravine" and "Strong winds would sweep across the tundra within the hour"',
      '"The path through Crystal Tundra was marked by tall blue stones" and "Alana stopped short"',
      '"Maya knelt and examined the snow" and "Natalia unfolded the map again"',
      '"Aurora had instructed the girls to follow the markers north" and "The trail was easy to follow"',
    ],
    correctIndex: 0,
  },

  {
    id: "ela-si-pD-stretch2",
    section: "ela",
    passageTitle: ELA_STORY_INTEL.passageD.title,
    passage: ELA_STORY_INTEL.passageD.text,
    prompt: "How does the theme of questioning appearances develop across the full arc of this passage?",
    choices: [
      "It begins with a straightforward trail that seems easy to follow, complicates when the path divides and the obvious choice appears, deepens through Natalia's counter-reasoning, and resolves in Maya's realization — showing that the theme builds through each character's contribution.",
      "It is introduced only in Natalia's dialogue and does not develop across the passage as a whole.",
      "It develops only through the physical setting — the tundra itself teaches the sisters not to trust what they see.",
      "It begins and ends with Maya, who is the only character whose thinking changes during the passage.",
    ],
    correctIndex: 0,
  },

  // ─────────────────────────────────────────────────────────
  // MATH — NUMBER OPS SCAN
  // Domains: Operations & Algebraic Thinking + Number & Operations in Base Ten
  // ─────────────────────────────────────────────────────────

  // Skill Group 1: Multiplication & Division

  {
    id: "math-no-g1-q1",
    section: "math",
    prompt: "Alana needs to pack supply bags for 6 teammates. Each bag needs 8 energy bars. How many energy bars does she need in all?",
    choices: ["14", "42", "48", "56"],
    correctIndex: 2,
  },

  {
    id: "math-no-g1-q2",
    section: "math",
    prompt: "The Allen Girls base needs 24 boxes of equipment. Each box weighs 35 pounds. What is the total weight of all the boxes?",
    choices: ["590 pounds", "720 pounds", "840 pounds", "960 pounds"],
    correctIndex: 2,
  },

  {
    id: "math-no-g1-stretch",
    section: "math",
    prompt: "S.P.A.R.K. uses the formula c = 12n to calculate the number of data chips (c) needed for n missions. If the team is planning 7 missions, how many data chips does S.P.A.R.K. need?",
    choices: ["19", "72", "84", "96"],
    correctIndex: 2,
  },

  // Skill Group 2: Place Value & Number Operations

  {
    id: "math-no-g2-q1",
    section: "math",
    prompt: "The signal scanner detected 4,672 frequency pulses. What is 4,672 rounded to the nearest hundred?",
    choices: ["4,600", "4,700", "4,000", "5,000"],
    correctIndex: 1,
  },

  {
    id: "math-no-g2-q2",
    section: "math",
    prompt: "Maya's shuttle used 12.45 liters of fuel on the first leg of the mission and 8.7 liters on the second leg. How much fuel did she use in total?",
    choices: ["20.05 liters", "20.52 liters", "21.15 liters", "21.52 liters"],
    correctIndex: 2,
  },

  {
    id: "math-no-g2-stretch",
    section: "math",
    prompt: "S.P.A.R.K. can process 180 data files in 4 hours. At this rate, how many data files can he process in 7 hours?",
    choices: ["270 files", "315 files", "360 files", "252 files"],
    correctIndex: 1,
  },

  // ─────────────────────────────────────────────────────────
  // MATH — FRACTIONS & DECIMALS SCAN
  // Domain: Number & Operations — Fractions
  // ─────────────────────────────────────────────────────────

  // Skill Group 1: Understanding & Comparing Fractions

  {
    id: "math-fd-g1-q1",
    section: "math",
    prompt: "Natalia ate 3/4 of her ration bar. Alana ate 2/4 of hers. The bars were the same size. Who ate more?",
    choices: [
      "Alana ate more because 2 is a smaller number.",
      "Natalia ate more because 3/4 is greater than 2/4.",
      "They ate the same amount.",
      "We cannot tell because the bars might be different sizes.",
    ],
    correctIndex: 1,
  },

  {
    id: "math-fd-g1-q2",
    section: "math",
    prompt: "Maya has 1/2 of a canister of fuel and finds another canister that is 1/3 full. How much fuel does she have in all?",
    choices: ["2/5 of a canister", "2/6 of a canister", "5/6 of a canister", "3/5 of a canister"],
    correctIndex: 2,
  },

  {
    id: "math-fd-g1-stretch",
    section: "math",
    prompt: "The sisters have 3 cups of mission fuel to divide equally into containers that each hold 1/4 cup. How many containers can they fill?",
    choices: ["3/4 of a container", "12 containers", "3 containers", "9 containers"],
    correctIndex: 1,
  },

  // Skill Group 2: Decimals & Fraction-Decimal Connection

  {
    id: "math-fd-g2-q1",
    section: "math",
    prompt: "S.P.A.R.K. scanned three locations and got these readings: 0.6, 0.45, and 0.8. Which reading is the largest?",
    choices: [
      "0.45, because it has more digits",
      "0.6, because 6 is between 4 and 8",
      "0.8, because 8 tenths is greater than 6 tenths and 45 hundredths",
      "They are all equal because they all have a zero before the decimal point",
    ],
    correctIndex: 2,
  },

  {
    id: "math-fd-g2-q2",
    section: "math",
    prompt: "Each mission team member needs 2/3 of a power pack per day. If there are 6 team members, how many total power packs are needed for one day?",
    choices: ["4 power packs", "3 power packs", "12 power packs", "8/3 power packs"],
    correctIndex: 0,
  },

  {
    id: "math-fd-g2-stretch",
    section: "math",
    prompt: "S.P.A.R.K. reports that the mission is 40% complete. The full mission has 60 objectives. How many objectives have been completed so far?",
    choices: ["20 objectives", "24 objectives", "36 objectives", "40 objectives"],
    correctIndex: 1,
  },

  // ─────────────────────────────────────────────────────────
  // MATH — GEOMETRY & DATA SCAN
  // Domains: Measurement & Data + Geometry
  // ─────────────────────────────────────────────────────────

  // Skill Group 1: Area, Perimeter & Measurement

  {
    id: "math-gd-g1-q1",
    section: "math",
    prompt: "The Allen Girls base is shaped like a rectangle. It is 9 meters long and 6 meters wide. What is the area of the base?",
    choices: ["30 square meters", "54 square meters", "45 square meters", "15 square meters"],
    correctIndex: 1,
  },

  {
    id: "math-gd-g1-q2",
    section: "math",
    prompt: "A supply crate is 4 feet long, 3 feet wide, and 5 feet tall. What is the volume of the crate?",
    choices: ["12 cubic feet", "47 cubic feet", "60 cubic feet", "35 cubic feet"],
    correctIndex: 2,
  },

  {
    id: "math-gd-g1-stretch",
    section: "math",
    prompt: "The sisters set up a triangular lookout zone. The base of the triangle is 10 meters and the height is 6 meters. What is the area of the lookout zone?",
    choices: ["60 square meters", "16 square meters", "30 square meters", "20 square meters"],
    correctIndex: 2,
  },

  // Skill Group 2: Data & Coordinate Plane

  {
    id: "math-gd-g2-q1",
    section: "math",
    prompt: "S.P.A.R.K. tracked how many missions each sister completed in a week. Natalia: 8, Maya: 12, Alana: 6. How many more missions did Maya complete than Alana?",
    choices: ["2 more missions", "4 more missions", "6 more missions", "18 more missions"],
    correctIndex: 2,
  },

  {
    id: "math-gd-g2-q2",
    section: "math",
    prompt: "Natalia starts at point (2, 3) on the mission map. She moves 4 units to the right and 2 units up. What are her new coordinates?",
    choices: ["(6, 5)", "(6, 1)", "(2, 9)", "(4, 6)"],
    correctIndex: 0,
  },

  {
    id: "math-gd-g2-stretch",
    section: "math",
    prompt: "S.P.A.R.K. recorded the team's mission scores for 5 days: 72, 85, 90, 68, 90. What is the mean (average) score?",
    choices: ["80", "81", "85", "90"],
    correctIndex: 1,
  },

  // ─────────────────────────────────────────────────────────
  // MATH — GEOMETRY SKILL CHECK (Shape Classification)
  // Domain: Geometry — runs separately after main Math scans
  // ─────────────────────────────────────────────────────────

  {
    id: "math-geo-q1",
    section: "math",
    prompt: "A shape has 4 sides. All 4 sides are the same length. All 4 angles are right angles. What is this shape?",
    choices: ["Rectangle", "Rhombus", "Square", "Trapezoid"],
    correctIndex: 2,
  },

  {
    id: "math-geo-q2",
    section: "math",
    prompt: "A triangular sensor field has one angle that measures exactly 90 degrees. What type of triangle is it?",
    choices: [
      "Acute triangle — all angles less than 90 degrees",
      "Obtuse triangle — one angle greater than 90 degrees",
      "Equilateral triangle — all angles equal",
      "Right triangle — one angle equals exactly 90 degrees",
    ],
    correctIndex: 3,
  },

  {
    id: "math-geo-stretch",
    section: "math",
    prompt: "S.P.A.R.K. says: 'All squares are rectangles, but not all rectangles are squares.' Which statement best explains why this is true?",
    choices: [
      "Because squares have 4 sides and rectangles have 4 sides, so they are the same shape.",
      "Because squares have all the properties of rectangles (4 right angles, 2 pairs of equal sides) plus the added property that all 4 sides are equal.",
      "Because rectangles are bigger than squares, so squares fit inside them.",
      "Because rectangles have right angles but squares do not.",
    ],
    correctIndex: 1,
  },
];
