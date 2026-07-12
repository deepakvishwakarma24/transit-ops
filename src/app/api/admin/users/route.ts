import { NextResponse } from "next/server";
import { ApplicationRole } from "@prisma/client";
import { requireRole } from "@/lib/auth/access";
import { prisma } from "@/lib/db";

export async function GET() {
  const context = await requireRole(ApplicationRole.FLEET_MANAGER);

  if (context instanceof NextResponse) {
    return context;
  }

  const users = await prisma.userProfile.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ data: users });
}
