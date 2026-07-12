import { prisma } from "@/lib/db";
import {
  type DepotSnapshot,
  type FleetSummary,
  type DriverSummary,
  type TripSummary,
  type CostSummary,
  type FleetUtilizationPoint,
  type OperationalCostPoint,
  type LiveActivityItem,
} from "./depot-snapshot";
import { type ApplicationRole, type VehicleStatus } from "@prisma/client";

function getDaysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getDbDepotSnapshot(role: ApplicationRole = "FLEET_MANAGER"): Promise<DepotSnapshot> {
  const settings = await prisma.settings.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  const totalVehicles = await prisma.vehicle.count();
  const totalDrivers = await prisma.driver.count();

  // 1. Fleet Summary
  const availableVehicles = await prisma.vehicle.count({ where: { status: "AVAILABLE" } });
  const onTripVehicles = await prisma.vehicle.count({ where: { status: "ON_TRIP" } });
  const inShopVehicles = await prisma.vehicle.count({ where: { status: "IN_SHOP" } });
  const retiredVehicles = await prisma.vehicle.count({ where: { status: "RETIRED" } });

  const activeCount = totalVehicles - retiredVehicles;
  const utilizationPct = activeCount > 0 ? Math.round((onTripVehicles / activeCount) * 100) : 0;

  const fleet: FleetSummary = {
    total: totalVehicles,
    available: availableVehicles,
    onTrip: onTripVehicles,
    inShop: inShopVehicles,
    retired: retiredVehicles,
    utilizationPct,
  };

  // 2. Driver Summary
  const onDutyDrivers = await prisma.driver.count({
    where: { status: { in: ["AVAILABLE", "ON_TRIP"] } },
  });
  const offDutyDrivers = await prisma.driver.count({ where: { status: "OFF_DUTY" } });
  const suspendedDrivers = await prisma.driver.count({ where: { status: "SUSPENDED" } });

  // Expiry in 30 days
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  const expiringSoonDrivers = await prisma.driver.count({
    where: {
      licenseExpiry: {
        gte: new Date(),
        lte: thirtyDaysFromNow,
      },
    },
  });

  const avgSafetyScoreAgg = await prisma.driver.aggregate({
    _avg: { safetyScore: true },
  });
  const avgSafetyScore = avgSafetyScoreAgg._avg.safetyScore ? Math.round(avgSafetyScoreAgg._avg.safetyScore) : 0;

  const drivers: DriverSummary = {
    total: totalDrivers,
    onDuty: onDutyDrivers,
    offDuty: offDutyDrivers,
    suspended: suspendedDrivers,
    expiringSoon: expiringSoonDrivers,
    avgSafetyScore,
  };

  // 3. Trip Summary
  const totalTrips = await prisma.trip.count();
  const draftTrips = await prisma.trip.count({ where: { status: "DRAFT" } });
  const dispatchedTrips = await prisma.trip.count({ where: { status: "DISPATCHED" } });
  const completedTrips = await prisma.trip.count({ where: { status: "COMPLETED" } });
  const cancelledTrips = await prisma.trip.count({ where: { status: "CANCELLED" } });

  const tripRevenueAgg = await prisma.trip.aggregate({
    _sum: { revenue: true },
  });
  const activeRevenue = tripRevenueAgg._sum.revenue || 0;

  const tripFuelAgg = await prisma.trip.aggregate({
    _sum: { fuelConsumedL: true },
  });
  const fuelConsumedL = tripFuelAgg._sum.fuelConsumedL || 0;

  const tripDistanceAgg = await prisma.trip.aggregate({
    where: { status: "COMPLETED" },
    _sum: { plannedDistanceKm: true },
  });
  const distanceCoveredKm = tripDistanceAgg._sum.plannedDistanceKm || 0;

  const trips: TripSummary = {
    total: totalTrips,
    draft: draftTrips,
    dispatched: dispatchedTrips,
    completed: completedTrips,
    cancelled: cancelledTrips,
    activeRevenue,
    fuelConsumedL,
    distanceCoveredKm,
  };

  // 4. Cost Summary
  const expenses = await prisma.expense.findMany();
  const cost: CostSummary = {
    fuel: 0,
    maintenance: 0,
    toll: 0,
    misc: 0,
    acquisitionCost: 0,
    totalOpex: 0,
  };

  expenses.forEach((e) => {
    if (e.category === "FUEL") cost.fuel += e.amount;
    else if (e.category === "MAINTENANCE") cost.maintenance += e.amount;
    else if (e.category === "TOLL") cost.toll += e.amount;
    else if (e.category === "MISC") cost.misc += e.amount;
  });

  const vehicleAcquisitionAgg = await prisma.vehicle.aggregate({
    _sum: { acquisitionCost: true },
  });
  cost.acquisitionCost = vehicleAcquisitionAgg._sum.acquisitionCost || 0;
  cost.totalOpex = cost.fuel + cost.maintenance + cost.toll + cost.misc;

  // 5. Vehicle Status Distribution
  const vehicleDistribution = [
    { status: "AVAILABLE" as VehicleStatus, value: availableVehicles, color: "var(--color-success)" },
    { status: "ON_TRIP" as VehicleStatus, value: onTripVehicles, color: "var(--color-info)" },
    { status: "IN_SHOP" as VehicleStatus, value: inShopVehicles, color: "var(--color-warning)" },
    { status: "RETIRED" as VehicleStatus, value: retiredVehicles, color: "var(--color-ink-400)" },
  ];

  // 6. Expiry Watchlist (60 days)
  const sixtyDaysFromNow = new Date();
  sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);
  const expiringDriversList = await prisma.driver.findMany({
    where: {
      licenseExpiry: {
        lte: sixtyDaysFromNow,
      },
    },
    orderBy: { licenseExpiry: "asc" },
    take: 5,
  });

  const expiryWatchlist = expiringDriversList.map((driver) => {
    const daysToExpiry = Math.max(
      0,
      Math.round((new Date(driver.licenseExpiry).getTime() - Date.now()) / 86400000)
    );
    return {
      driverName: driver.name,
      licenseNumber: driver.licenseNumber,
      daysToExpiry,
    };
  });

  // 7. Recent Activity (Recent 5 trips)
  const recentTripsList = await prisma.trip.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      vehicle: { select: { registrationNo: true } },
      driver: { select: { name: true } },
    },
  });

  const recentActivity: LiveActivityItem[] = recentTripsList.map((t) => ({
    id: t.id,
    tripNumber: t.tripNumber,
    event: t.status,
    occurredAt: (t.dispatchedAt || t.createdAt).toISOString(),
    vehicleRegistration: t.vehicle.registrationNo,
    driverName: t.driver.name,
    routeSummary: `${t.source} → ${t.destination}`,
  }));

  // 8. Fleet Utilization (Last 7 days)
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const fleetUtilization: FleetUtilizationPoint[] = [];

  for (let i = 6; i >= 0; i--) {
    const targetDate = getDaysAgo(i);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const tripsCompleted = await prisma.trip.count({
      where: {
        status: "COMPLETED",
        completedAt: {
          gte: targetDate,
          lt: nextDate,
        },
      },
    });

    const dayFuelAgg = await prisma.expense.aggregate({
      where: {
        category: "FUEL",
        recordedAt: {
          gte: targetDate,
          lt: nextDate,
        },
      },
      _sum: { amount: true },
    });
    const fuelCost = dayFuelAgg._sum.amount || 0;

    const dayUtilization = tripsCompleted > 0 ? Math.min(100, tripsCompleted * 20) : (totalTrips > 0 ? utilizationPct : 0);

    fleetUtilization.push({
      day: dayNames[targetDate.getDay()],
      utilization: dayUtilization,
      fuelCost,
      tripsCompleted,
    });
  }

  // 9. Operational Cost by Week (Past 4 weeks)
  const costByBucket: OperationalCostPoint[] = [];
  for (let w = 3; w >= 0; w--) {
    const startDate = getDaysAgo((w + 1) * 7);
    const endDate = getDaysAgo(w * 7);

    const weekExpenses = await prisma.expense.findMany({
      where: {
        recordedAt: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    let fuel = 0;
    let maintenance = 0;
    let toll = 0;

    weekExpenses.forEach((e) => {
      if (e.category === "FUEL") fuel += e.amount;
      else if (e.category === "MAINTENANCE") maintenance += e.amount;
      else if (e.category === "TOLL" || e.category === "MISC") toll += e.amount;
    });

    costByBucket.push({
      bucket: `Wk ${4 - w}`,
      fuel,
      maintenance,
      toll,
    });
  }

  return {
    asOf: new Date().toISOString(),
    depotName: settings?.depotName ?? "",
    currency: settings?.currency ?? "",
    distanceUnit: settings?.distanceUnit ?? "",
    role,
    fleet,
    drivers,
    trips,
    cost,
    fleetUtilization,
    costByBucket,
    vehicleDistribution,
    expiryWatchlist,
    recentActivity,
  };
}
