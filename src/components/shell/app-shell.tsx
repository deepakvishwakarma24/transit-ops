import { AppSidebar } from "./app-sidebar";
import { roleLabels } from "@/lib/data/depot-snapshot";

interface AppShellProps {
  children: React.ReactNode;
  userName: string;
  role: keyof typeof roleLabels;
}

export function AppShell({ children, userName, role }: AppShellProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <AppSidebar userName={userName} userRole={roleLabels[role]} />
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-6 py-6 md:px-10 md:py-8">
          {children}
    </main>
    </div>
  </div>
  );
}
