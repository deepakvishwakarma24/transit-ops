import { type NextRequest, NextResponse } from "next/server";
import { isPrismaError, PrismaErrorCode } from "@/lib/prisma-errors";
import { prisma } from "@/lib/prisma";
import { createVehicleSchema } from "@/lib/validators/vehicle.schema";
import { requireAuthenticatedProfile, requireRole } from "@/lib/auth/access";
import { ApplicationRole } from "@prisma/client";

// Opt out of static generation — this route requires a live DB connection.
export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// GET /api/vehicles — return all vehicles ordered newest first
// ---------------------------------------------------------------------------

export async function GET() {
  const context = await requireAuthenticatedProfile();
  if (context instanceof NextResponse) {
    return context;
  }

  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: "desc" },
    });
    return Response.json(vehicles);
  } catch {
    return Response.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/vehicles — create a new vehicle
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const context = await requireRole(ApplicationRole.FLEET_MANAGER);
  if (context instanceof NextResponse) {
    return context;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = createVehicleSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { errors: result.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const vehicle = await prisma.vehicle.create({ data: result.data });
    return Response.json(vehicle, { status: 201 });
  } catch (err: unknown) {
    if (isPrismaError(err) && err.code === PrismaErrorCode.UNIQUE_CONSTRAINT) {
      return Response.json(
        { error: "Fleet code or registration number already exists" },
        { status: 409 },
      );
    }
    return Response.json({ error: "Failed to create vehicle" }, { status: 500 });
  }
}
