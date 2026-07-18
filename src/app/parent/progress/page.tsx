import { redirect } from "next/navigation";

/** Old placeholder Reports page — permanently send to the live games report. */
export default function ParentProgressRedirectPage() {
  redirect("/parent/reports");
}
