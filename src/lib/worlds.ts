/**
 * Allen Girls Adventures — all 9 worlds for "Choose Your World"
 */

export type World = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  emoji: string;
  /** CSS gradient for card background */
  gradient: string;
  /** Darker border/accent color */
  borderColor: string;
  /** Text color (dark on light gradient) */
  textColor: string;
  /** True for Nova Star Command (central hub) */
  isCentralHub?: boolean;
  /** Vimeo video ID for this world (embed on detail page and globe hover) */
  vimeoId?: string;
};

export const worlds: World[] = [
  {
    id: "aqua-azul",
    slug: "aqua-azul",
    name: "The Lost City of Aqua Azul",
    tagline: "Underwater / Ocean Adventure",
    description: "Dive into the deep blue and discover sunken treasures, friendly sea creatures, and the secrets of the ocean.",
    emoji: "🌊",
    gradient: "linear-gradient(135deg, #71D9E2 0%, #5ec9d1 50%, #4ab8c4 100%)",
    borderColor: "#0e7490",
    textColor: "#0c4a6e",
    vimeoId: "1169180228",
  },
  {
    id: "around-the-way",
    slug: "around-the-way",
    name: "Around The Way",
    tagline: "Home / Neighborhood / Everyday Exploration",
    description: "Explore your own block — parks, libraries, and the everyday magic right outside your door.",
    emoji: "🏘️",
    gradient: "linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fdba74 100%)",
    borderColor: "#c2410c",
    textColor: "#7c2d12",
  },
  {
    id: "nova-star-command",
    slug: "nova-star-command",
    name: "Nova Star Command",
    tagline: "Space / Galaxy Missions — Your Central Hub",
    description: "Blast off to the stars! Mission control for all your adventures. Start here to pick your next world.",
    emoji: "🚀",
    gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
    borderColor: "#5b21b6",
    textColor: "#3b0764",
    isCentralHub: true,
  },
  {
    id: "legends-long-ago",
    slug: "legends-long-ago",
    name: "Legends of Long Ago",
    tagline: "Ancient Civilizations",
    description: "Travel back to Rome, Greece, Egypt, Morocco, and more. Uncover myths, monuments, and legendary stories.",
    emoji: "🏛️",
    gradient: "linear-gradient(135deg, #d97706 0%, #b45309 50%, #92400e 100%)",
    borderColor: "#78350f",
    textColor: "#451a03",
  },
  {
    id: "fossil-frontier",
    slug: "fossil-frontier",
    name: "Fossil Frontier",
    tagline: "Prehistoric World / Dinosaurs",
    description: "Walk with dinosaurs! Volcanoes, fossils, and creatures from millions of years ago.",
    emoji: "🦕",
    gradient: "linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)",
    borderColor: "#166534",
    textColor: "#14532d",
    vimeoId: "1169313594",
  },
  {
    id: "futuria-world",
    slug: "futuria-world",
    name: "Futuria World",
    tagline: "Future / Innovation / Tomorrow City",
    description: "Tomorrow City is here! Robots, inventions, and the amazing world of the future.",
    emoji: "🤖",
    gradient: "linear-gradient(135deg, #ec4899 0%, #db2777 50%, #be185d 100%)",
    borderColor: "#9d174d",
    textColor: "#831843",
  },
  {
    id: "crystal-tundra",
    slug: "crystal-tundra",
    name: "The Crystal Tundra",
    tagline: "Ice / Arctic / Aurora Environment",
    description: "Snow, ice, and the northern lights. Discover polar animals and frozen wonders.",
    emoji: "❄️",
    gradient: "linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)",
    borderColor: "#0284c7",
    textColor: "#0c4a6e",
    vimeoId: "1171409615",
  },
  {
    id: "great-jade-jungle",
    slug: "great-jade-jungle",
    name: "The Great Jade Jungle",
    tagline: "Rainforest / Amazon-Inspired Adventure",
    description: "Venture into the lush green jungle. Exotic animals, hidden rivers, and ancient trees.",
    emoji: "🌴",
    gradient: "linear-gradient(135deg, #15803d 0%, #166534 50%, #14532d 100%)",
    borderColor: "#14532d",
    textColor: "#f0fdf4",
  },
  {
    id: "kingdom-wild",
    slug: "kingdom-wild",
    name: "Kingdom of the Wild",
    tagline: "Global Animal Biomes / Ecosystems",
    description: "Safaris, coral reefs, mountains, and deserts. Meet animals from every corner of the world.",
    emoji: "🦁",
    gradient: "linear-gradient(135deg, #eab308 0%, #ca8a04 50%, #a16207 100%)",
    borderColor: "#854d0e",
    textColor: "#422006",
  },
];

export function getWorldBySlug(slug: string): World | undefined {
  return worlds.find((w) => w.slug === slug);
}
