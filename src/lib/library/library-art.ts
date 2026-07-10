import type { StaticImageData } from "next/image";

import backgroundLibrary from "@/assets/images/library/BackgroundLibrary.png";
import bookCoverFrame from "@/assets/images/library/book-cover-frame.png";
import libraryCeilingSkylight from "@/assets/images/library/library-ceiling-skylight.png";
import libraryCorridorWing from "@/assets/images/library/library-corridor-wing.png";
import libraryHeroPanorama from "@/assets/images/library/library-hero-panorama.png";
import libraryPortalFrame from "@/assets/images/library/library-portal-frame.png";
import libraryReadingNook from "@/assets/images/library/library-reading-nook.png";
import libraryShelfStrip from "@/assets/images/library/library-shelf-strip.png";
import readerSpreadEmpty from "@/assets/images/library/reader-spread-empty.png";
import coverClockGarden from "@/assets/images/library/covers/ag-clock-garden-cover.png";
import coverLabyrinthKey from "@/assets/images/library/covers/ag-labyrinth-key-cover.png";
import coverLanternThief from "@/assets/images/library/covers/ag-lantern-thief-cover.png";
import coverLighthouseFootnotes from "@/assets/images/library/covers/ag-lighthouse-footnotes-cover.png";
import coverMeridianLetters from "@/assets/images/library/covers/ag-meridian-letters-cover.png";
import coverMoonlightManuscript from "@/assets/images/library/covers/ag-moonlight-manuscript-cover.png";
import coverMirrorMaze from "@/assets/images/library/covers/ag-mirror-maze-cover.png";
import coverSparkSignal from "@/assets/images/library/covers/ag-spark-signal-cover.png";
import coverStarkeeperCrown from "@/assets/images/library/covers/ag-starkeeper-crown-cover.png";
import coverUpsideDownShelf from "@/assets/images/library/covers/ag-upside-down-shelf-cover.png";
import coverArchivistsLantern from "@/assets/images/library/covers/ag-archivists-lantern-cover.png";
import coverBookmarkThatBites from "@/assets/images/library/covers/ag-bookmark-that-bites-cover.png";
import coverChoirClosedBooks from "@/assets/images/library/covers/ag-choir-closed-books-cover.png";
import coverEchoAtlas from "@/assets/images/library/covers/ag-echo-atlas-cover.png";
import coverGildedAlcove from "@/assets/images/library/covers/ag-gilded-alcove-cover.png";
import coverGhoulOverdueFines from "@/assets/images/library/covers/ag-ghoul-overdue-fines-cover.png";
import coverGlassOrchard from "@/assets/images/library/covers/ag-glass-orchard-cover.png";
import coverInkwellObservatory from "@/assets/images/library/covers/ag-inkwell-observatory-cover.png";
import coverKiteLostChapters from "@/assets/images/library/covers/ag-kite-lost-chapters-cover.png";
import coverPaperComet from "@/assets/images/library/covers/ag-paper-comet-cover.png";
import coverPoltergeistPage13 from "@/assets/images/library/covers/ag-poltergeist-page-13-cover.png";
import coverRainroomNook from "@/assets/images/library/covers/ag-rainroom-nook-cover.png";
import coverRiddleRailway from "@/assets/images/library/covers/ag-riddle-railway-cover.png";
import coverSeedlingShelf from "@/assets/images/library/covers/ag-seedling-shelf-cover.png";
import coverSilverMargin from "@/assets/images/library/covers/ag-silver-margin-cover.png";
import coverSnackThatScreamed from "@/assets/images/library/covers/ag-snack-that-screamed-cover.png";
import coverThreadbareCompass from "@/assets/images/library/covers/ag-threadbare-compass-cover.png";
import coverTurningStacks from "@/assets/images/library/covers/ag-turning-stacks-cover.png";
import coverVelvetVault from "@/assets/images/library/covers/ag-velvet-vault-cover.png";
import coverVioletArchive from "@/assets/images/library/covers/ag-violet-archive-cover.png";
import coverWhisperingSpine from "@/assets/images/library/covers/ag-whispering-spine-cover.png";
import coverWishingIndex from "@/assets/images/library/covers/ag-wishing-index-cover.png";
import coverCloudCaravan from "@/assets/images/library/covers/licensed-cloud-caravan-cover.png";
import coverMapmakersMoth from "@/assets/images/library/covers/licensed-mapmakers-moth-cover.png";
import coverEmberPostRoad from "@/assets/images/library/covers/licensed-ember-post-road-cover.png";
import coverMidnightMenagerie from "@/assets/images/library/covers/licensed-midnight-menagerie-cover.png";
import coverSandglassCourt from "@/assets/images/library/covers/licensed-sandglass-court-cover.png";
import coverTideglassKingdom from "@/assets/images/library/covers/licensed-tideglass-kingdom-cover.png";
import coverJungleTales from "@/assets/images/library/covers/licensed-jungle-tales-cover.png";
import coverStarlightPost from "@/assets/images/library/covers/licensed-starlight-post-cover.png";
import coverTreasureTide from "@/assets/images/library/covers/licensed-treasure-tide-cover.png";
import coverWinterGateLibrary from "@/assets/images/library/covers/licensed-winter-gate-library-cover.png";
import wingAllenGirlsBanner from "@/assets/images/library/wing-allen-girls-banner.png";
import wingLicensedBanner from "@/assets/images/library/wing-licensed-banner.png";

/** reader-spread-empty.png — 1408×768 */
export const LIBRARY_READER_SPREAD_ASPECT = 1408 / 768;

/** Novel cover thumbs — 1536×1024 (landscape) */
export const LIBRARY_COVER_ASPECT = 3 / 2;

/** Hub composite screen — `public/Library Background.png` (2764×1504) */
export const LIBRARY_HUB_BACKGROUND_SRC = "/Library%20Background.png";
export const LIBRARY_HUB_ASPECT = 2764 / 1504;

export const LIBRARY_ART = {
  background: backgroundLibrary,
  bookFrame: bookCoverFrame,
  heroPanorama: libraryHeroPanorama,
  corridorWing: libraryCorridorWing,
  readingNook: libraryReadingNook,
  ceilingSkylight: libraryCeilingSkylight,
  portalFrame: libraryPortalFrame,
  shelfStrip: libraryShelfStrip,
  readerSpread: readerSpreadEmpty,
} as const satisfies Record<string, StaticImageData>;

export const LIBRARY_WING_BANNERS = {
  allen_girls: wingAllenGirlsBanner,
  licensed: wingLicensedBanner,
} as const satisfies Record<string, StaticImageData>;

export const LIBRARY_NOVEL_COVERS = {
  "ag-labyrinth-key": coverLabyrinthKey,
  "ag-clock-garden": coverClockGarden,
  "ag-spark-signal": coverSparkSignal,
  "ag-mirror-maze": coverMirrorMaze,
  "ag-lantern-thief": coverLanternThief,
  "ag-upside-down-shelf": coverUpsideDownShelf,
  "ag-paper-comet": coverPaperComet,
  "ag-echo-atlas": coverEchoAtlas,
  "ag-violet-archive": coverVioletArchive,
  "ag-glass-orchard": coverGlassOrchard,
  "ag-threadbare-compass": coverThreadbareCompass,
  "ag-choir-closed-books": coverChoirClosedBooks,
  "ag-wishing-index": coverWishingIndex,
  "ag-riddle-railway": coverRiddleRailway,
  "ag-inkwell-observatory": coverInkwellObservatory,
  "ag-gilded-alcove": coverGildedAlcove,
  "ag-velvet-vault": coverVelvetVault,
  "ag-starkeeper-crown": coverStarkeeperCrown,
  "ag-archivists-lantern": coverArchivistsLantern,
  "ag-silver-margin": coverSilverMargin,
  "ag-meridian-letters": coverMeridianLetters,
  "ag-ghoul-overdue-fines": coverGhoulOverdueFines,
  "ag-snack-that-screamed": coverSnackThatScreamed,
  "ag-bookmark-that-bites": coverBookmarkThatBites,
  "ag-poltergeist-page-13": coverPoltergeistPage13,
  "ag-whispering-spine": coverWhisperingSpine,
  "ag-kite-lost-chapters": coverKiteLostChapters,
  "ag-rainroom-nook": coverRainroomNook,
  "ag-seedling-shelf": coverSeedlingShelf,
  "ag-lighthouse-footnotes": coverLighthouseFootnotes,
  "ag-turning-stacks": coverTurningStacks,
  "ag-moonlight-manuscript": coverMoonlightManuscript,
  "licensed-jungle-tales": coverJungleTales,
  "licensed-treasure-tide": coverTreasureTide,
  "licensed-starlight-post": coverStarlightPost,
  "licensed-cloud-caravan": coverCloudCaravan,
  "licensed-midnight-menagerie": coverMidnightMenagerie,
  "licensed-tideglass-kingdom": coverTideglassKingdom,
  "licensed-sandglass-court": coverSandglassCourt,
  "licensed-ember-post-road": coverEmberPostRoad,
  "licensed-mapmakers-moth": coverMapmakersMoth,
  "licensed-winter-gate-library": coverWinterGateLibrary,
} as const satisfies Record<string, StaticImageData>;
