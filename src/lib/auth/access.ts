import { NextResponse } from "next/server";
import { type UserProfile } from "@prisma/client";
import { auth } from "@/lib/auth/server";
import { syncUserProfile, type AuthenticatedUser } from "@/lib/auth/bootstrap";
import type { AppRole } from "@/lib/auth/roles";

type SessionUser = AuthenticatedUser;

type SessionPayload = {
  user?: SessionUser | null;
};

export type AuthContext = {
  session: SessionPayload;
  profile: UserProfile;
};

export function problem(
  status: number,
  title: string,
  detail: string,
): NextResponse {
  return NextResponse.json(
    {
      type: `https://transitops.local/errors/${title
        .toLowerCase()
        .replaceAll(" ", "-")}`,
      title,
      status,
      detail,
    },
    { status },
  );
}

export async function getAuthenticatedUser(): Promise<SessionUser | null> {
  const { data: session } = await auth.getSession();
  const typedSession = session as SessionPayload | null;
  return typedSession?.user ?? null;
}

export async function syncCurrentUserProfile(): Promise<AuthContext | null> {
  const { data: session } = await auth.getSession();
  const typedSession = session as SessionPayload | null;
  const user = typedSession?.user;

  if (!user?.id || !user.email) {
    return null;
  }

  const profile = await syncUserProfile(user);

  return { session: { user }, profile };
}

export async function requireAuthenticatedProfile(): Promise<
  AuthContext | NextResponse
> {
  const context = await syncCurrentUserProfile();

  if (!context) {
    return problem(401, "Unauthorized", "Sign in to access TransitOps.");
  }

  return context;
}

export async function requireRole(
  ...allowedRoles: AppRole[]
): Promise<AuthContext | NextResponse> {
  const context = await requireAuthenticatedProfile();

  if (context instanceof NextResponse) {
    return context;
  }

  if (!allowedRoles.includes(context.profile.role)) {
    return problem(
      403,
      "Forbidden",
      "Your account does not have permission to perform this action.",
    );
  }

  return context;
}
