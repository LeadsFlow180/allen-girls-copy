import { GuardianAccountShell } from "@/components/account/guardian-account-shell";
import { requireParentAccount } from "@/lib/auth/require-account-role";

export default async function ParentAreaLayout({ children }: { children: React.ReactNode }) {
  await requireParentAccount();

  return <GuardianAccountShell>{children}</GuardianAccountShell>;
}
