import { type NextRequest, NextResponse } from "next/server";
import { isPrismaError, PrismaErrorCode } from "@/lib/prisma-errors";
import { prisma } from "@/lib/prisma";
import { updateTripSchema } from "@/lib/validators/trip.schema";
import { requireAuthenticatedProfile, requireRole } from "@/lib/auth/access";
import { ApplicationRole, TripStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

// ---------------------------------------------------------------------------
// GET /api/trips/:id — return a specific trip
// ---------------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: RouteContext,
) {
  const context = await requireAuthenticatedProfile();
  if (context instanceof NextResponse) {
    return context;
  }

  const { id } = await params;

  try {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        vehicle: { select: { registrationNo: true, model: true } },
        driver: { select: { name: true } },
      },
    });
    if (!trip) {
      return Response.json({ error: "Trip not found" }, { status: 404 });
    }
    return Response.json(trip);
  } catch (err: unknown) {
    console.error("[GET /api/trips/:id]", err);
    return Response.json({ error: "Failed to fetch trip" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/trips/:id — update a trip (handles life-cycle transitions)
// ---------------------------------------------------------------------------

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
) {
  const context = await requireRole(ApplicationRole.FLEET_MANAGER, ApplicationRole.DISPATCHER);
  if (context instanceof NextResponse) {
    return context;
  }

  const { id } = await params;
  let body: any;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = updateTripSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { errors: result.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const updatedTrip = await prisma.$transaction(async (tx) => {
      // 1. Fetch existing trip
      const existingTrip = await tx.trip.findUnique({
        where: { id },
        include: { vehicle: true, driver: true },
      });

      if (!existingTrip) {
        throw new Error("NOT_FOUND");
      }

      // 2. Determine state changes
      const oldStatus = existingTrip.status;
      const newStatus = result.data.status || oldStatus;

      let dispatchedAt = existingTrip.dispatchedAt;
      let completedAt = existingTrip.completedAt;
      let cancelledAt = existingTrip.cancelledAt;

      // Handle transitions
      if (oldStatus !== TripStatus.DISPATCHED && newStatus === TripStatus.DISPATCHED) {
        dispatchedAt = new Date();
        // Update vehicle and driver to ON_TRIP
        await tx.vehicle.update({
          where: { id: existingTrip.vehicleId },
          data: { status: "ON_TRIP" },
        });
        await tx.driver.update({
          where: { id: existingTrip.driverId },
          data: { status: "ON_TRIP" },
        });
      } else if (oldStatus !== TripStatus.COMPLETED && newStatus === TripStatus.COMPLETED) {
        completedAt = new Date();
        
        // Restore vehicle and driver status to AVAILABLE
        await tx.vehicle.update({
          where: { id: existingTrip.vehicleId },
          data: {
            status: "AVAILABLE",
            // Update odometer if final odometer is provided
            odometer: result.data.endOdometer || existingTrip.vehicle.odometer,
          },
        });
        await tx.driver.update({
          where: { id: existingTrip.driverId },
          data: { status: "AVAILABLE" },
        });

        // Log Fuel consumed
        if (result.data.fuelConsumedL && result.data.fuelConsumedL > 0) {
          const fuelCost = result.data.fuelConsumedL * 95; // Assume ₹95 per liter

          // Create Fuel Log
          await tx.fuelLog.create({
            data: {
              liters: result.data.fuelConsumedL,
              cost: fuelCost,
              loggedAt: new Date(),
              vehicleId: existingTrip.vehicleId,
              tripId: existingTrip.id,
            },
          });

          // Create Fuel Expense
          await tx.expense.create({
            data: {
              category: "FUEL",
              amount: fuelCost,
              description: `Fuel consumption from Trip ${existingTrip.tripNumber}`,
              recordedAt: new Date(),
              vehicleId: existingTrip.vehicleId,
              tripId: existingTrip.id,
            },
          });
        }
      } else if (oldStatus !== TripStatus.CANCELLED && newStatus === TripStatus.CANCELLED) {
        cancelledAt = new Date();
        // Restore vehicle and driver to AVAILABLE if they were active
        if (oldStatus === TripStatus.DISPATCHED) {
          await tx.vehicle.update({
            where: { id: existingTrip.vehicleId },
            data: { status: "AVAILABLE" },
          });
          await tx.driver.update({
            where: { id: existingTrip.driverId },
            data: { status: "AVAILABLE" },
          });
        }
      }

      // Update trip record
      const trip = await tx.trip.update({
        where: { id },
        data: {
          ...result.data,
          dispatchedAt,
          completedAt,
          cancelledAt,
        },
        include: {
          vehicle: { select: { registrationNo: true, model: true } },
          driver: { select: { name: true } },
        },
      });

      return trip;
    });

    return Response.json(updatedTrip);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return Response.json({ error: "Trip not found" }, { status: 404 });
    }
    console.error("[PATCH /api/trips/:id]", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to update trip" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/trips/:id — delete a trip
// ---------------------------------------------------------------------------

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext,
) {
  const context = await requireRole(ApplicationRole.FLEET_MANAGER);
  if (context instanceof NextResponse) {
    return context;
  }

  const { id } = await params;

  try {
    await prisma.trip.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch (err: unknown) {
    if (isPrismaError(err) && err.code === PrismaErrorCode.RECORD_NOT_FOUND) {
      return Response.json({ error: "Trip not found" }, { status: 404 });
    }
    console.error("[DELETE /api/trips/:id]", err);
    return Response.json({ error: "Failed to delete trip" }, { status: 500 });
  }
}
