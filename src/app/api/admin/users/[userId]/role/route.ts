import { NextResponse } from "next/server";
import { ApplicationRole } from "@prisma/client";
import { isApplicationRole } from "@/lib/auth/roles";
import { problem, requireRole } from "@/lib/auth/access";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const context = await requireRole(ApplicationRole.FLEET_MANAGER);

  if (context instanceof NextResponse) {
    return context;
  }

  const { userId } = await params;
  const body = (await request.json().catch(() => null)) as {
    role?: unknown;
  } | null;

  const role = body?.role;

  if (!isApplicationRole(role)) {
    return problem(422, "Validation Failed", "A valid role is required.");
  }

  const updatedUser = await prisma.$transaction(async (transaction) => {
    const targetUser = await transaction.userProfile.findFirst({
      where: {
        OR: [{ id: userId }, { authUserId: userId }],
      },
    });

    if (!targetUser) {
      return null;
    }

    if (
      targetUser.role === ApplicationRole.FLEET_MANAGER &&
      role !== ApplicationRole.FLEET_MANAGER
    ) {
      const fleetManagerCount = await transaction.userProfile.count({
        where: { role: ApplicationRole.FLEET_MANAGER },
      });

      if (fleetManagerCount === 1) {
        return "last-fleet-manager" as const;
      }
    }

    return transaction.userProfile.update({
      where: { id: targetUser.id },
      data: { role },
    });
  });

  if (!updatedUser) {
    return problem(404, "Not Found", "User profile was not found.");
  }

  if (updatedUser === "last-fleet-manager") {
    return problem(
      409,
      "Conflict",
      "Assign another fleet manager before changing this user’s role.",
    );
  }

  return NextResponse.json({ data: updatedUser });
}
