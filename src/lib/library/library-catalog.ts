import { buildSpreadsFromChapters, estimateReadMinutes } from "./build-spreads";
import { ARCHIVISTS_LANTERN_CHAPTERS } from "./stories/archivists-lantern";
import { CHOIR_CLOSED_BOOKS_CHAPTERS } from "./stories/choir-closed-books";
import { CLOCKWORK_GARDEN_CHAPTERS } from "./stories/clockwork-garden";
import { CLOUD_CARAVAN_CHAPTERS } from "./stories/cloud-caravan";
import { ECHO_ATLAS_CHAPTERS } from "./stories/echo-atlas";
import { BOOKMARK_THAT_BITES_CHAPTERS } from "./stories/bookmark-that-bites";
import { GHOUL_OVERDUE_FINES_CHAPTERS } from "./stories/ghoul-overdue-fines";
import { GILDED_ALCOVE_CHAPTERS } from "./stories/gilded-alcove";
import { EMBER_POST_ROAD_CHAPTERS } from "./stories/ember-post-road";
import { GLASS_ORCHARD_CHAPTERS } from "./stories/glass-orchard";
import { INKWELL_OBSERVATORY_CHAPTERS } from "./stories/inkwell-observatory";
import { JUNGLE_TALES_CHAPTERS } from "./stories/jungle-tales";
import { KITE_LOST_CHAPTERS_CHAPTERS } from "./stories/kite-lost-chapters";
import { LABYRINTH_KEY_CHAPTERS } from "./stories/labyrinth-key";
import { LANTERN_THIEF_CHAPTERS } from "./stories/lantern-thief";
import { LIGHTHOUSE_FOOTNOTES_CHAPTERS } from "./stories/lighthouse-footnotes";
import { MIDNIGHT_MENAGERIE_CHAPTERS } from "./stories/midnight-menagerie";
import { MAPMAKERS_MOTH_CHAPTERS } from "./stories/mapmakers-moth";
import { MERIDIAN_LETTERS_CHAPTERS } from "./stories/meridian-letters";
import { MOONLIGHT_MANUSCRIPT_CHAPTERS } from "./stories/moonlight-manuscript";
import { MIRROR_MAZE_CHAPTERS } from "./stories/mirror-maze";
import { PAPER_COMET_CHAPTERS } from "./stories/paper-comet";
import { POLTERGEIST_PAGE_13_CHAPTERS } from "./stories/poltergeist-page-13";
import { RAINROOM_NOOK_CHAPTERS } from "./stories/rainroom-nook";
import { RIDDLE_RAILWAY_CHAPTERS } from "./stories/riddle-railway";
import { SANDGLASS_COURT_CHAPTERS } from "./stories/sandglass-court";
import { SEEDLING_SHELF_CHAPTERS } from "./stories/seedling-shelf";
import { SILVER_MARGIN_CHAPTERS } from "./stories/silver-margin";
import { SNACK_THAT_SCREAMED_CHAPTERS } from "./stories/snack-that-screamed";
import { SPARK_SIGNAL_CHAPTERS } from "./stories/spark-signal";
import { STARKEEPER_CROWN_CHAPTERS } from "./stories/starkeeper-crown";
import { STARLIGHT_POST_CHAPTERS } from "./stories/starlight-post";
import { THREADBARE_COMPASS_CHAPTERS } from "./stories/threadbare-compass";
import { VELVET_VAULT_CHAPTERS } from "./stories/velvet-vault";
import { WHISPERING_SPINE_CHAPTERS } from "./stories/whispering-spine";
import { TIDEGLASS_KINGDOM_CHAPTERS } from "./stories/tideglass-kingdom";
import { TREASURE_TIDE_CHAPTERS } from "./stories/treasure-tide";
import { TURNING_STACKS_CHAPTERS } from "./stories/turning-stacks";
import { UPSIDE_DOWN_SHELF_CHAPTERS } from "./stories/upside-down-shelf";
import { VIOLET_ARCHIVE_CHAPTERS } from "./stories/violet-archive";
import { WINTER_GATE_LIBRARY_CHAPTERS } from "./stories/winter-gate-library";
import { WISHING_INDEX_CHAPTERS } from "./stories/wishing-index";

export type LibraryWingId = "allen_girls" | "licensed";

export type LibraryFormat = "text" | "pdf";

export type LibraryTier = "standard" | "vip";

export type LibrarySpread = {
  left: string | null;
  right: string;
};

export type LibraryNovel = {
  id: string;
  wing: LibraryWingId;
  title: string;
  author: string;
  synopsis: string;
  ageBand: string;
  readMinutes: number;
  format: LibraryFormat;
  /** Text spreads for the built-in reader */
  spreads: LibrarySpread[];
  /** Public path to PDF edition, e.g. /library/pdfs/ag-labyrinth-key.pdf */
  pdfPath: string;
  /** Remote PDF URL from Supabase Storage (teacher uploads) */
  pdfUrl?: string | null;
  /** True when a flip-book PDF edition is available */
  hasPdfEdition?: boolean;
  /** Premium flagship titles — shown with VIP badge on shelf */
  tier?: LibraryTier;
  /** Remote cover URL from database / Supabase Storage */
  coverUrl?: string | null;
  /** When false, render as continuous prose without chapter headers */
  useChapters?: boolean;
};

export type LibraryNovelDefinition = Omit<LibraryNovel, "spreads" | "readMinutes"> & {
  chapters: string[];
};

function novel(meta: LibraryNovelDefinition): LibraryNovel {
  const spreads = buildSpreadsFromChapters(meta.chapters);
  return {
    id: meta.id,
    wing: meta.wing,
    title: meta.title,
    author: meta.author,
    synopsis: meta.synopsis,
    ageBand: meta.ageBand,
    format: meta.format,
    pdfPath: meta.pdfPath,
    hasPdfEdition: true,
    spreads,
    readMinutes: estimateReadMinutes(spreads),
    tier: meta.tier ?? "standard",
  };
}

export const LIBRARY_WINGS: {
  id: LibraryWingId;
  title: string;
  subtitle: string;
}[] = [
  {
    id: "allen_girls",
    title: "Allen Girls Chronicles",
    subtitle: "Original adventures written for the labyrinth",
  },
  {
    id: "licensed",
    title: "Licensed Classics",
    subtitle: "Beloved novels with labyrinth editions",
  },
];

const LIBRARY_NOVEL_DEFINITIONS: LibraryNovelDefinition[] = [
  {
    id: "ag-labyrinth-key",
    wing: "allen_girls",
    title: "The Labyrinth Key",
    author: "Allen Girls Adventures",
    synopsis:
      "Maya, Alana, and Natalia discover a golden key that opens shelves between worlds — and a story only they can write.",
    ageBand: "Ages 7–10",
    format: "text",
    pdfPath: "/library/pdfs/ag-labyrinth-key.pdf",
    chapters: LABYRINTH_KEY_CHAPTERS,
  },
  {
    id: "ag-clock-garden",
    wing: "allen_girls",
    title: "The Clockwork Garden",
    author: "Allen Girls Adventures",
    synopsis:
      "A brass-flower garden ticks toward a mystery beneath the reading nook — teamwork, humility, and twelve blooming chimes.",
    ageBand: "Ages 8–11",
    format: "text",
    pdfPath: "/library/pdfs/ag-clock-garden.pdf",
    chapters: CLOCKWORK_GARDEN_CHAPTERS,
  },
  {
    id: "ag-spark-signal",
    wing: "allen_girls",
    title: "SPARK's Signal",
    author: "Allen Girls Adventures",
    synopsis:
      "SPARK intercepts a message from the stars and leads the sisters to a shelf of unwritten books waiting for brave readers.",
    ageBand: "Ages 6–9",
    format: "text",
    pdfPath: "/library/pdfs/ag-spark-signal.pdf",
    chapters: SPARK_SIGNAL_CHAPTERS,
  },
  {
    id: "ag-mirror-maze",
    wing: "allen_girls",
    title: "The Mirror Maze of Maps",
    author: "Allen Girls Adventures",
    synopsis:
      "A silver aisle of lying maps forces the sisters to admit what they truly seek — and reveals who built the maze long ago.",
    ageBand: "Ages 7–10",
    format: "text",
    pdfPath: "/library/pdfs/ag-mirror-maze.pdf",
    chapters: MIRROR_MAZE_CHAPTERS,
  },
  {
    id: "ag-lantern-thief",
    wing: "allen_girls",
    title: "The Lantern Thief",
    author: "Allen Girls Adventures",
    synopsis:
      "When story lanterns dim, the chase leads to Vesper — a girl made of pages who only wanted someone to read her again.",
    ageBand: "Ages 8–11",
    format: "text",
    pdfPath: "/library/pdfs/ag-lantern-thief.pdf",
    chapters: LANTERN_THIEF_CHAPTERS,
  },
  {
    id: "ag-upside-down-shelf",
    wing: "allen_girls",
    title: "The Upside-Down Shelf",
    author: "Allen Girls Adventures",
    synopsis:
      "Gravity flips in Aisle Seventeen, epilogues float below the floor, and backward reading is the only way forward.",
    ageBand: "Ages 7–10",
    format: "text",
    pdfPath: "/library/pdfs/ag-upside-down-shelf.pdf",
    chapters: UPSIDE_DOWN_SHELF_CHAPTERS,
  },
  {
    id: "ag-paper-comet",
    wing: "allen_girls",
    title: "The Paper Comet",
    author: "Allen Girls Adventures",
    synopsis:
      "A comet of manuscript pages streaks through the skylight — and the sisters race to catch every fragment before a lost author's final book vanishes.",
    ageBand: "Ages 7–10",
    format: "text",
    pdfPath: "/library/pdfs/ag-paper-comet.pdf",
    chapters: PAPER_COMET_CHAPTERS,
  },
  {
    id: "ag-echo-atlas",
    wing: "allen_girls",
    title: "The Echo Atlas",
    author: "Allen Girls Adventures",
    synopsis:
      "An atlas maps the echoes of every reader who ever visited — until one shelf falls silent and a shy thief is heard at last.",
    ageBand: "Ages 8–11",
    format: "text",
    pdfPath: "/library/pdfs/ag-echo-atlas.pdf",
    chapters: ECHO_ATLAS_CHAPTERS,
  },
  {
    id: "ag-violet-archive",
    wing: "allen_girls",
    title: "The Violet Archive",
    author: "Allen Girls Adventures",
    synopsis:
      "In the sealed Violet Archive, time runs sideways — and returning one centuries-overdue book may free a keeper who never got an ending.",
    ageBand: "Ages 8–11",
    format: "text",
    pdfPath: "/library/pdfs/ag-violet-archive.pdf",
    chapters: VIOLET_ARCHIVE_CHAPTERS,
  },
  {
    id: "ag-glass-orchard",
    wing: "allen_girls",
    title: "The Glass Orchard",
    author: "Allen Girls Adventures",
    synopsis:
      "Behind a hidden shelf, stories grow as glass fruit — and the sisters must harvest chapters in the right season before impatient hands shatter a book forever.",
    ageBand: "Ages 7–10",
    format: "text",
    pdfPath: "/library/pdfs/ag-glass-orchard.pdf",
    chapters: GLASS_ORCHARD_CHAPTERS,
  },
  {
    id: "ag-threadbare-compass",
    wing: "allen_girls",
    title: "The Threadbare Compass",
    author: "Allen Girls Adventures",
    synopsis:
      "A worn brass compass points not north but toward unfinished promises — leading Maya, Alana, and Natalia through aisles that test whether they keep their word.",
    ageBand: "Ages 7–10",
    format: "text",
    pdfPath: "/library/pdfs/ag-threadbare-compass.pdf",
    chapters: THREADBARE_COMPASS_CHAPTERS,
  },
  {
    id: "ag-choir-closed-books",
    wing: "allen_girls",
    title: "The Choir of Closed Books",
    author: "Allen Girls Adventures",
    synopsis:
      "Five sealed volumes hum in harmony until one wrong note mutes the labyrinth — and the sisters must learn that the bravest voice is sometimes a rest.",
    ageBand: "Ages 7–10",
    format: "text",
    pdfPath: "/library/pdfs/ag-choir-closed-books.pdf",
    chapters: CHOIR_CLOSED_BOOKS_CHAPTERS,
  },
  {
    id: "ag-wishing-index",
    wing: "allen_girls",
    title: "The Wishing Index",
    author: "Allen Girls Adventures",
    synopsis:
      "A humming card catalog grants careful wishes — but every request must be returned with kindness, until Natalia fills the last blank keeper slot.",
    ageBand: "Ages 7–10",
    format: "text",
    pdfPath: "/library/pdfs/ag-wishing-index.pdf",
    chapters: WISHING_INDEX_CHAPTERS,
  },
  {
    id: "ag-riddle-railway",
    wing: "allen_girls",
    title: "The Riddle Railway",
    author: "Allen Girls Adventures",
    synopsis:
      "A miniature train races between shelves on brass rails — and Maya, Alana, and Natalia must answer together to reach the last stop.",
    ageBand: "Ages 7–10",
    format: "text",
    pdfPath: "/library/pdfs/ag-riddle-railway.pdf",
    chapters: RIDDLE_RAILWAY_CHAPTERS,
  },
  {
    id: "ag-inkwell-observatory",
    wing: "allen_girls",
    title: "The Inkwell Observatory",
    author: "Allen Girls Adventures",
    synopsis:
      "Beneath the library dome, constellations are written in dried ink — and a shy astronomer made of footnotes needs someone to read her aloud.",
    ageBand: "Ages 8–11",
    format: "text",
    pdfPath: "/library/pdfs/ag-inkwell-observatory.pdf",
    chapters: INKWELL_OBSERVATORY_CHAPTERS,
  },
  {
    id: "ag-gilded-alcove",
    wing: "allen_girls",
    title: "The Gilded Alcove",
    author: "Allen Girls Adventures",
    synopsis:
      "Behind a humming tapestry lies a gold-leaf reading room that dims when borrowed unfairly — until Maya, Alana, and Natalia restore its keeper light.",
    ageBand: "Ages 8–11",
    format: "text",
    pdfPath: "/library/pdfs/ag-gilded-alcove.pdf",
    chapters: GILDED_ALCOVE_CHAPTERS,
    tier: "vip",
  },
  {
    id: "ag-velvet-vault",
    wing: "allen_girls",
    title: "The Velvet Vault",
    author: "Allen Girls Adventures",
    synopsis:
      "A brass stair leads to a velvet-rope vault of rare first editions — guarded by Patchwork, a keeper quilt stitched from overdue slips who judges care, not speed.",
    ageBand: "Ages 8–11",
    format: "text",
    pdfPath: "/library/pdfs/ag-velvet-vault.pdf",
    chapters: VELVET_VAULT_CHAPTERS,
    tier: "vip",
  },
  {
    id: "ag-starkeeper-crown",
    wing: "allen_girls",
    title: "The Starkeeper's Crown",
    author: "Allen Girls Adventures",
    synopsis:
      "A constellation crown reveals every unfinished story in the labyrinth — and teaches Natalia that starkeeping means sharing responsibility, not wearing power.",
    ageBand: "Ages 8–11",
    format: "text",
    pdfPath: "/library/pdfs/ag-starkeeper-crown.pdf",
    chapters: STARKEEPER_CROWN_CHAPTERS,
    tier: "vip",
  },
  {
    id: "ag-archivists-lantern",
    wing: "allen_girls",
    title: "The Archivist's Lantern",
    author: "Allen Girls Adventures",
    synopsis:
      "In a sealed archive wing, a brass lantern illuminates every reader who ever mattered — and Maya, Alana, and Natalia must restore its ledger before remembrance goes dark.",
    ageBand: "Ages 9–12",
    format: "text",
    pdfPath: "/library/pdfs/ag-archivists-lantern.pdf",
    chapters: ARCHIVISTS_LANTERN_CHAPTERS,
    tier: "vip",
  },
  {
    id: "ag-silver-margin",
    wing: "allen_girls",
    title: "The Silver Margin",
    author: "Allen Girls Adventures",
    synopsis:
      "Books with silver ink in the margins hold conversations across decades — until the sisters answer a lonely question left by the labyrinth's own night shelver.",
    ageBand: "Ages 9–12",
    format: "text",
    pdfPath: "/library/pdfs/ag-silver-margin.pdf",
    chapters: SILVER_MARGIN_CHAPTERS,
    tier: "vip",
  },
  {
    id: "ag-meridian-letters",
    wing: "allen_girls",
    title: "The Meridian Letters",
    author: "Allen Girls Adventures",
    synopsis:
      "A brass meridian in the map room delivers letters to readers lost between shelves — and the last delivery is addressed to the sisters from the library founders.",
    ageBand: "Ages 9–12",
    format: "text",
    pdfPath: "/library/pdfs/ag-meridian-letters.pdf",
    chapters: MERIDIAN_LETTERS_CHAPTERS,
    tier: "vip",
  },
  {
    id: "ag-ghoul-overdue-fines",
    wing: "allen_girls",
    title: "The Ghoul of Overdue Fines",
    author: "Allen Girls Adventures",
    synopsis:
      "A lime-green ghoul haunts the fines desk wailing about late returns — but Percival only wants someone to finish the book that turned him into a fine in 1991.",
    ageBand: "Ages 8–11",
    format: "text",
    pdfPath: "/library/pdfs/ag-ghoul-overdue-fines.pdf",
    chapters: GHOUL_OVERDUE_FINES_CHAPTERS,
  },
  {
    id: "ag-snack-that-screamed",
    wing: "allen_girls",
    title: "The Snack That Screamed",
    author: "Allen Girls Adventures",
    synopsis:
      "Vending machine E-7 screams when readers skip the ingredient list — because sandwich ghost Edmund, the cafeteria poet, cannot stand being eaten without being read.",
    ageBand: "Ages 8–11",
    format: "text",
    pdfPath: "/library/pdfs/ag-snack-that-screamed.pdf",
    chapters: SNACK_THAT_SCREAMED_CHAPTERS,
  },
  {
    id: "ag-bookmark-that-bites",
    wing: "allen_girls",
    title: "The Bookmark That Bites",
    author: "Allen Girls Adventures",
    synopsis:
      "A vampire bookmark named Chomp bites every dog-eared page — until Maya, Alana, and Natalia negotiate a treaty with the girl who sewed him from love.",
    ageBand: "Ages 8–11",
    format: "text",
    pdfPath: "/library/pdfs/ag-bookmark-that-bites.pdf",
    chapters: BOOKMARK_THAT_BITES_CHAPTERS,
  },
  {
    id: "ag-poltergeist-page-13",
    wing: "allen_girls",
    title: "The Poltergeist of Page 13",
    author: "Allen Girls Adventures",
    synopsis:
      "At midnight every page thirteen flips itself in fury — not to haunt, but because superstitious readers keep skipping the loneliest page in every book.",
    ageBand: "Ages 8–11",
    format: "text",
    pdfPath: "/library/pdfs/ag-poltergeist-page-13.pdf",
    chapters: POLTERGEIST_PAGE_13_CHAPTERS,
  },
  {
    id: "ag-whispering-spine",
    wing: "allen_girls",
    title: "The Whispering Spine",
    author: "Allen Girls Adventures",
    synopsis:
      "Books in the spooky aisle whisper wrong titles and terrible puns — because nobody checks them out, and Elspeth just wants a book club.",
    ageBand: "Ages 8–11",
    format: "text",
    pdfPath: "/library/pdfs/ag-whispering-spine.pdf",
    chapters: WHISPERING_SPINE_CHAPTERS,
  },
  {
    id: "ag-kite-lost-chapters",
    wing: "allen_girls",
    title: "The Kite of Lost Chapters",
    author: "Allen Girls Adventures",
    synopsis:
      "A paper kite tangled in the skylight rains loose chapters from unfinished books — and Maya, Alana, and Natalia must match each page before the stories forget their way home.",
    ageBand: "Ages 8–11",
    format: "text",
    pdfPath: "/library/pdfs/ag-kite-lost-chapters.pdf",
    chapters: KITE_LOST_CHAPTERS_CHAPTERS,
  },
  {
    id: "ag-rainroom-nook",
    wing: "allen_girls",
    title: "The Rainroom Nook",
    author: "Allen Girls Adventures",
    synopsis:
      "A hidden nook where gentle indoor rain carries story ideas — until the sisters help shy writer Wren catch four drops at a time instead of drowning in beginnings.",
    ageBand: "Ages 8–11",
    format: "text",
    pdfPath: "/library/pdfs/ag-rainroom-nook.pdf",
    chapters: RAINROOM_NOOK_CHAPTERS,
  },
  {
    id: "ag-seedling-shelf",
    wing: "allen_girls",
    title: "The Seedling Shelf",
    author: "Allen Girls Adventures",
    synopsis:
      "Planted bookmarks grow into story seedlings that bloom only when read aloud — and the sisters discover they hold first drafts from readers who never knew they were allowed to finish.",
    ageBand: "Ages 8–11",
    format: "text",
    pdfPath: "/library/pdfs/ag-seedling-shelf.pdf",
    chapters: SEEDLING_SHELF_CHAPTERS,
  },
  {
    id: "ag-lighthouse-footnotes",
    wing: "allen_girls",
    title: "The Lighthouse of Lost Footnotes",
    author: "Allen Girls Adventures",
    synopsis:
      "A brass lighthouse on the map desk illuminates orphaned footnotes — and Maya, Alana, and Natalia reunite 312 drifting notes with the stories that forgot them.",
    ageBand: "Ages 8–11",
    format: "text",
    pdfPath: "/library/pdfs/ag-lighthouse-footnotes.pdf",
    chapters: LIGHTHOUSE_FOOTNOTES_CHAPTERS,
  },
  {
    id: "ag-turning-stacks",
    wing: "allen_girls",
    title: "The Puzzle of the Turning Stacks",
    author: "Allen Girls Adventures",
    synopsis:
      "South-wing shelves rotate at midnight like a color lock — until the sisters read spine stripes by sight and touch, following blind reader Emira's hidden map.",
    ageBand: "Ages 8–11",
    format: "text",
    pdfPath: "/library/pdfs/ag-turning-stacks.pdf",
    chapters: TURNING_STACKS_CHAPTERS,
  },
  {
    id: "ag-moonlight-manuscript",
    wing: "allen_girls",
    title: "The Moonlight Manuscript",
    author: "Allen Girls Adventures",
    synopsis:
      "A manuscript visible only by moonlight records the dreams of readers who fell asleep in the library — and the sisters take turns reading the night aloud.",
    ageBand: "Ages 8–11",
    format: "text",
    pdfPath: "/library/pdfs/ag-moonlight-manuscript.pdf",
    chapters: MOONLIGHT_MANUSCRIPT_CHAPTERS,
  },
  {
    id: "licensed-jungle-tales",
    wing: "licensed",
    title: "Jungle Tales",
    author: "Licensed classic · labyrinth edition",
    synopsis:
      "Priya walks past the green gate to help a river remember its name — a full abridged classic about courage and respect.",
    ageBand: "Ages 8–12",
    format: "text",
    pdfPath: "/library/pdfs/licensed-jungle-tales.pdf",
    chapters: JUNGLE_TALES_CHAPTERS,
  },
  {
    id: "licensed-treasure-tide",
    wing: "licensed",
    title: "Treasure Tide",
    author: "Licensed classic · labyrinth edition",
    synopsis:
      "Finn, Mara, and Captain Pella sail from a map in the margins to an island where treasure is returned time, not gold.",
    ageBand: "Ages 9–12",
    format: "text",
    pdfPath: "/library/pdfs/licensed-treasure-tide.pdf",
    chapters: TREASURE_TIDE_CHAPTERS,
  },
  {
    id: "licensed-starlight-post",
    wing: "licensed",
    title: "Starlight Post Office",
    author: "Licensed classic · labyrinth edition",
    synopsis:
      "Twins Zara and Leo join owl postmaster Parcel to deliver letters by starlight — including one goodbye that was never finished.",
    ageBand: "Ages 8–12",
    format: "text",
    pdfPath: "/library/pdfs/licensed-starlight-post.pdf",
    chapters: STARLIGHT_POST_CHAPTERS,
  },
  {
    id: "licensed-cloud-caravan",
    wing: "licensed",
    title: "The Cloud Caravan",
    author: "Licensed classic · labyrinth edition",
    synopsis:
      "Pilot Nia and cloud fox Drift race a nameless wind that stole every chapter ending from the floating villages below.",
    ageBand: "Ages 9–12",
    format: "text",
    pdfPath: "/library/pdfs/licensed-cloud-caravan.pdf",
    chapters: CLOUD_CARAVAN_CHAPTERS,
  },
  {
    id: "licensed-midnight-menagerie",
    wing: "licensed",
    title: "The Midnight Menagerie",
    author: "Licensed classic · labyrinth edition",
    synopsis:
      "Leo and Priya guide illustrated animals home before dawn inks them into the wrong stories — and one rabbit only wanted a friend.",
    ageBand: "Ages 8–12",
    format: "text",
    pdfPath: "/library/pdfs/licensed-midnight-menagerie.pdf",
    chapters: MIDNIGHT_MENAGERIE_CHAPTERS,
  },
  {
    id: "licensed-tideglass-kingdom",
    wing: "licensed",
    title: "The Tideglass Kingdom",
    author: "Licensed classic · labyrinth edition",
    synopsis:
      "Inside tide-glass bottles on a shelf, Mira must mend the Crown Lens before sea-tales drain dry — and a goodbye letter dissolves unread.",
    ageBand: "Ages 9–12",
    format: "text",
    pdfPath: "/library/pdfs/licensed-tideglass-kingdom.pdf",
    chapters: TIDEGLASS_KINGDOM_CHAPTERS,
  },
  {
    id: "licensed-sandglass-court",
    wing: "licensed",
    title: "The Sandglass Court",
    author: "Licensed classic · labyrinth edition",
    synopsis:
      "Apprentice Lior descends to a midnight court where overdue moments are judged — and mercy may cost more than the law allows.",
    ageBand: "Ages 8–12",
    format: "text",
    pdfPath: "/library/pdfs/licensed-sandglass-court.pdf",
    chapters: SANDGLASS_COURT_CHAPTERS,
  },
  {
    id: "licensed-ember-post-road",
    wing: "licensed",
    title: "The Ember Post Road",
    author: "Licensed classic · labyrinth edition",
    synopsis:
      "Courier Sable runs glowing night mail along Ashbell Shelf — until a letter from the founders reveals why the ember road was sealed for ninety-two years.",
    ageBand: "Ages 9–12",
    format: "text",
    pdfPath: "/library/pdfs/licensed-ember-post-road.pdf",
    chapters: EMBER_POST_ROAD_CHAPTERS,
  },
  {
    id: "licensed-mapmakers-moth",
    wing: "licensed",
    title: "The Mapmaker's Moth",
    author: "Licensed classic · labyrinth edition",
    synopsis:
      "Cartographer Lina and a luminous moth that eats false maps must audit the city's official routes — and restore a district erased from every chart.",
    ageBand: "Ages 8–12",
    format: "text",
    pdfPath: "/library/pdfs/licensed-mapmakers-moth.pdf",
    chapters: MAPMAKERS_MOTH_CHAPTERS,
  },
  {
    id: "licensed-winter-gate-library",
    wing: "licensed",
    title: "The Winter Gate Library",
    author: "Licensed classic · labyrinth edition",
    synopsis:
      "Twins Noor and Eli discover a frozen wing where books stay cold until read aloud — and learn that repair, not speed, thaws the shyest stories.",
    ageBand: "Ages 8–12",
    format: "text",
    pdfPath: "/library/pdfs/licensed-winter-gate-library.pdf",
    chapters: WINTER_GATE_LIBRARY_CHAPTERS,
  },
];

export const LIBRARY_NOVELS: LibraryNovel[] = LIBRARY_NOVEL_DEFINITIONS.map(novel);

export function libraryNovelDefinitions(): LibraryNovelDefinition[] {
  return LIBRARY_NOVEL_DEFINITIONS;
}

const PAGE_SIZE = 10;

export function novelsForWing(wing: LibraryWingId): LibraryNovel[] {
  return LIBRARY_NOVELS.filter((n) => n.wing === wing);
}

export function novelById(id: string): LibraryNovel | undefined {
  return LIBRARY_NOVELS.find((n) => n.id === id);
}

export function paginatedNovelsForWing(wing: LibraryWingId, visible: number): LibraryNovel[] {
  return novelsForWing(wing).slice(0, visible);
}

export function hasMoreNovels(wing: LibraryWingId, visible: number): boolean {
  return novelsForWing(wing).length > visible;
}

export function paginatedNovels(visible: number): LibraryNovel[] {
  return LIBRARY_NOVELS.slice(0, visible);
}

export function hasMoreNovelsTotal(visible: number): boolean {
  return LIBRARY_NOVELS.length > visible;
}

export { PAGE_SIZE };
