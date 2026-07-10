import { redirect } from "next/navigation";

export default function TeacherLibraryRedirectPage() {
  redirect("/teacher/dashboard");
}
