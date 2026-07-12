import { z } from "zod";
import { TripStatus } from "@prisma/client";

export const createTripSchema = z.object({
  tripNumber: z.string().min(1, { message: "Trip number is required" }),
  source: z.string().min(1, { message: "Source is required" }),
  destination: z.string().min(1, { message: "Destination is required" }),
  cargoWeightKg: z.coerce.number().int().min(1, { message: "Cargo weight must be positive" }),
  plannedDistanceKm: z.coerce.number().int().min(1, { message: "Planned distance must be positive" }),
  startOdometer: z.coerce.number().int().min(0, { message: "Start odometer cannot be negative" }),
  endOdometer: z.coerce.number().int().min(0).optional().or(z.literal("").transform(() => undefined)).nullable(),
  fuelConsumedL: z.coerce.number().min(0).optional().or(z.literal("").transform(() => undefined)).nullable(),
  revenue: z.coerce.number().min(0).optional().or(z.literal("").transform(() => undefined)).nullable(),
  status: z.nativeEnum(TripStatus).default(TripStatus.DRAFT),
  vehicleId: z.string().min(1, { message: "Vehicle selection is required" }),
  driverId: z.string().min(1, { message: "Driver selection is required" }),
});

export const updateTripSchema = createTripSchema.partial();

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
