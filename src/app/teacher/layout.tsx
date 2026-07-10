import { TeacherAccountShell } from "@/components/account/teacher-account-shell";
import { requireTeacherAccount } from "@/lib/auth/require-account-role";

export default async function TeacherAreaLayout({ children }: { children: React.ReactNode }) {
  const session = await requireTeacherAccount();

  return <TeacherAccountShell email={session.email}>{children}</TeacherAccountShell>;
}
