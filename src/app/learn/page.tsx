import { redirect } from "next/navigation";

/**
 * Old Kid World hub ("Pick Your Next Mission / Choose Your Zone") is retired.
 * Worlds on the globe are the main entry; placement, library, games, etc. live
 * on their own routes. Keep /learn/* subpages; only this hub redirects away.
 */
export default function LearnHubRedirect() {
  redirect("/worlds");
}
