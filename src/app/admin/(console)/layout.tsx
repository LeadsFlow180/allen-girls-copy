import { SuperAdminShell } from "@/components/admin/super-admin-shell";
import { requireSuperAdminAccount } from "@/lib/auth/require-account-role";

export default async function AdminConsoleLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSuperAdminAccount();

  return (
    <SuperAdminShell email={session.email} displayName={session.displayName}>
      {children}
    </SuperAdminShell>
  );
}
