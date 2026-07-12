import Link from "next/link";
import { ApplicationRole } from "@prisma/client";
import { UserButton } from "@neondatabase/auth/react";
import { syncCurrentUserProfile } from "@/lib/auth/access";

export const dynamic = "force-dynamic";

const roleLabels: Record<ApplicationRole, string> = {
  UNASSIGNED: "Pending access",
  FLEET_MANAGER: "Fleet manager",
  DISPATCHER: "Dispatcher",
  SAFETY_OFFICER: "Safety officer",
  FINANCIAL_ANALYST: "Financial analyst",
};

export default async function Home() {
  const context = await syncCurrentUserProfile();
  const profile = context?.profile;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-5">
        <header className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              TransitOps
            </p>
            <h1 className="text-2xl font-semibold">Operations console</h1>
          </div>
          <UserButton />
        </header>

        <section className="grid flex-1 content-center gap-6 py-10 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <div className="inline-flex rounded-md border border-border px-3 py-1 text-sm text-muted-foreground">
              {profile ? roleLabels[profile.role] : "Checking access"}
            </div>
            <div className="space-y-3">
              <h2 className="max-w-2xl text-4xl font-semibold tracking-normal">
                Secure fleet operations start here.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                Email/password authentication is handled by Neon Auth. TransitOps
                stores app roles separately so API routes can enforce RBAC for
                fleet, dispatch, safety, and finance workflows.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/account/settings"
                className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
              >
                Account settings
              </Link>
              {profile?.role === ApplicationRole.FLEET_MANAGER ? (
                <Link
                  href="/api/admin/users"
                  className="inline-flex h-9 items-center rounded-md border border-border px-4 text-sm font-medium"
                >
                  Manage users API
                </Link>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3">
            {[
              ["Authentication", "Neon Auth sessions and password login"],
              ["Authorization", "Application roles stored in UserProfile"],
              ["Protection", "Authenticated routes guarded by proxy"],
            ].map(([title, body]) => (
              <div key={title} className="rounded-md border border-border p-4">
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
