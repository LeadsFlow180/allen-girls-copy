/**
 * LMS Module context per world.
 * Each entry describes how Module 1 skills appear inside that specific world's story.
 * Slug keys match src/lib/worlds.ts
 */

export type WorldModuleContext = {
  slug: string;
  /** Short headline shown on the world entry card */
  missionTitle: string;
  /** ELA reskin — how Reading Comprehension looks in this world */
  elaContext: string;
  /** STEM reskin — how Multiplication & Division looks in this world */
  stemContext: string;
  /** SEL reskin — how Growth Mindset looks in this world */
  selContext: string;
};

export const module1Contexts: WorldModuleContext[] = [
  {
    slug: "aqua-azul",
    missionTitle: "Decode the Ancient Tide Maps",
    elaContext: "Read glowing underwater scrolls to find the main idea of how the sunken city was built.",
    stemContext: "Balance the coral gate locks using multiplication — how many stones on each side?",
    selContext: "When the current sweeps your notes away, S.P.A.R.K. reminds you: try again, you've got this!",
  },
  {
    slug: "around-the-way",
    missionTitle: "Crack the Neighborhood Code",
    elaContext: "Read the community bulletin board and summarize the main idea of the neighborhood rules.",
    stemContext: "Help Mrs. Chen divide the garden plots equally among all the families on the block.",
    selContext: "When the treehouse puzzle is too hard, Maya reminds you that every expert was once a beginner.",
  },
  {
    slug: "nova-star-command",
    missionTitle: "Launch Mission: Module 1",
    elaContext: "Read the mission briefing and pull out the main idea before the launch countdown ends.",
    stemContext: "Calculate fuel loads for all 9 shuttle pods — multiply the tanks, divide the cargo.",
    selContext: "If your calculations miss, S.P.A.R.K. says: 'Error = data. Try again, Commander.'",
  },
  {
    slug: "legends-long-ago",
    missionTitle: "Unlock the Temple of Knowledge",
    elaContext: "Read an ancient stone scroll to find the main idea of how the civilization built their temples.",
    stemContext: "Solve a multiplication puzzle to balance the temple's sacred stone weights.",
    selContext: "If you fail the first try, Alana says: 'Even the greatest builders needed more than one attempt.'",
  },
  {
    slug: "fossil-frontier",
    missionTitle: "Read the Dino Field Notes",
    elaContext: "Study the dinosaur field journal and identify the main idea of the creature's discovery.",
    stemContext: "Count fossil layers in the canyon wall using division to date each discovery.",
    selContext: "When a T-Rex scare makes you freeze, Natalia cheers: 'Brave isn't fearless — brave is keep going!'",
  },
  {
    slug: "futuria-world",
    missionTitle: "Boot Up the Learning Core",
    elaContext: "Read a future-tech report and identify its main idea to power the city's AI grid.",
    stemContext: "Program the hover drones — multiply the delivery routes to cover the whole city.",
    selContext: "When the code breaks, the sisters show you how every inventor fails before they succeed.",
  },
  {
    slug: "crystal-tundra",
    missionTitle: "Translate the Ice Inscriptions",
    elaContext: "Read the frozen ice wall inscriptions and summarize the main idea of the ancient message.",
    stemContext: "Divide the supply sleds equally among all the igloo teams before the blizzard hits.",
    selContext: "When the cold makes the puzzle harder, Alana's warm encouragement keeps you moving forward.",
  },
  {
    slug: "great-jade-jungle",
    missionTitle: "Follow the Jungle Trail Map",
    elaContext: "Read the explorer's vine-carved map to find the main idea of where the lost waterfall is hidden.",
    stemContext: "Multiply the rainforest seed bundles to plant enough crops for the whole jungle village.",
    selContext: "When the vines block your path, Maya models how patience and a plan always win.",
  },
  {
    slug: "kingdom-wild",
    missionTitle: "Help the Animal Council",
    elaContext: "Read the Animal Council's charter and summarize the main idea of their community rules.",
    stemContext: "Help the animal shopkeeper divide the harvest equally across all the biome villages.",
    selContext: "When a challenge feels overwhelming, the friendly animal teachers show you one step at a time.",
  },
];

export function getWorldContext(slug: string): WorldModuleContext | undefined {
  return module1Contexts.find((c) => c.slug === slug);
}
