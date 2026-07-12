import {
  ApplicationRole,
  Prisma,
  type UserProfile,
} from "@prisma/client";
import { prisma } from "@/lib/db";

export type AuthenticatedUser = {
  id: string;
  email: string;
  name?: string | null;
};

export type InitialFleetManagerSetup = {
  profile: UserProfile;
  status:
    | "initialized"
    | "already-initialized"
    | "email-not-allowed"
    | "not-configured";
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getInitialFleetManagerEmail(): string | null {
  const email = process.env.INITIAL_FLEET_MANAGER_EMAIL;
  return email ? normalizeEmail(email) : null;
}

async function upsertUserProfile(
  transaction: Prisma.TransactionClient,
  user: AuthenticatedUser,
): Promise<UserProfile> {
  const email = normalizeEmail(user.email);

  return transaction.userProfile.upsert({
    where: { authUserId: user.id },
    update: { email, name: user.name },
    create: {
      authUserId: user.id,
      email,
      name: user.name,
      role: ApplicationRole.UNASSIGNED,
    },
  });
}

export async function syncUserProfile(
  user: AuthenticatedUser,
): Promise<UserProfile> {
  return prisma.$transaction((transaction) =>
    upsertUserProfile(transaction, user),
  );
}

export async function setupInitialFleetManager(
  user: AuthenticatedUser,
): Promise<InitialFleetManagerSetup> {
  const initialFleetManagerEmail = getInitialFleetManagerEmail();
  const normalizedEmail = normalizeEmail(user.email);

  return prisma.$transaction(async (transaction) => {
    const profile = await upsertUserProfile(transaction, user);

    if (!initialFleetManagerEmail) {
      return { profile, status: "not-configured" };
    }

    if (initialFleetManagerEmail !== normalizedEmail) {
      return { profile, status: "email-not-allowed" };
    }

    const fleetManager = await transaction.userProfile.findFirst({
      where: { role: ApplicationRole.FLEET_MANAGER },
    });

    if (fleetManager) {
      return {
        profile,
        status:
          fleetManager.authUserId === user.id
            ? "already-initialized"
            : "email-not-allowed",
      };
    }

    const initializedProfile = await transaction.userProfile.update({
      where: { id: profile.id },
      data: { role: ApplicationRole.FLEET_MANAGER },
    });

    return { profile: initializedProfile, status: "initialized" };
  });
}
