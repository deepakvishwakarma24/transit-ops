import { ApplicationRole } from "@prisma/client";
import { syncCurrentUserProfile } from "@/lib/auth/access";
import { AppShell } from "@/components/shell/app-shell";

export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await syncCurrentUserProfile();
  const profile = context?.profile;
  return (
    <AppShell
      role={(profile?.role ?? ApplicationRole.FLEET_MANAGER) as ApplicationRole}
      userName={profile?.name ?? profile?.email ?? "Operator"}
    >
      {children}
 </AppShell>
  );
}
