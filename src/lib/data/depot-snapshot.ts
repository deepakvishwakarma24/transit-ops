import type { ApplicationRole, TripStatus, VehicleStatus, DriverStatus } from "@prisma/client";

export type VehicleTypeLabel = "VAN" | "MINI_TRUCK" | "TRUCK" | "BUS" | "OTHER";

export interface FleetSummary {
  total: number;
  available: number;
  onTrip: number;
  inShop: number;
  retired: number;
  utilizationPct: number;
}

export interface DriverSummary {
  total: number;
  onDuty: number;
  offDuty: number;
  suspended: number;
  expiringSoon: number;
  avgSafetyScore: number;
}

export interface TripSummary {
  total: number;
  draft: number;
  dispatched: number;
  completed: number;
  cancelled: number;
  activeRevenue: number;
  fuelConsumedL: number;
  distanceCoveredKm: number;
}

export interface CostSummary {
  fuel: number;
  maintenance: number;
  toll: number;
  misc: number;
  acquisitionCost: number;
  totalOpex: number;
}

export interface FleetUtilizationPoint {
  day: string;
  utilization: number;
  fuelCost: number;
  tripsCompleted: number;
}

export interface OperationalCostPoint {
  bucket: string;
  fuel: number;
  maintenance: number;
  toll: number;
}

export interface VehicleRegistryRow {
  id: string;
  fleetCode: string;
  registrationNo: string;
  manufacturer?: string;
  model: string;
  type: VehicleTypeLabel;
  status: VehicleStatus;
  maxLoadKg: number;
  odometer: number;
  driverName?: string;
  tripNumber?: string;
  acquisitionCost: number;
}

export interface DriverRegistryRow {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiry: string;
  contactNumber: string;
  safetyScore: number;
  status: DriverStatus;
}

export interface TripRegistryRow {
  id: string;
  tripNumber: string;
  source: string;
  destination: string;
  cargoWeightKg: number;
  plannedDistanceKm: number;
  startOdometer: number;
  endOdometer: number | null;
  fuelConsumedL: number | null;
  revenue: number | null;
  status: TripStatus;
  vehicleId: string;
  vehicleLabel: string;
  driverId: string;
  driverName: string;
  dispatchedAt: string;
  completedAt: string | null;
}

export interface LiveActivityItem {
  id: string;
  tripNumber: string;
  event: TripStatus;
  occurredAt: string;
  vehicleRegistration: string;
  driverName: string;
  routeSummary: string;
}

export interface DepotSnapshot {
  asOf: string;
  depotName: string;
  currency: string;
  distanceUnit: string;
  role: ApplicationRole;
  fleet: FleetSummary;
  drivers: DriverSummary;
  trips: TripSummary;
  cost: CostSummary;
  fleetUtilization: FleetUtilizationPoint[];
  costByBucket: OperationalCostPoint[];
  vehicleDistribution: { status: VehicleStatus; value: number; color: string }[];
  recentActivity: LiveActivityItem[];
  expiryWatchlist: {
    driverName: string;
    licenseNumber: string;
    daysToExpiry: number;
  }[];
}

function isoDaysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export const roleLabels: Record<ApplicationRole, string> = {
  UNASSIGNED: "Pending access",
  FLEET_MANAGER: "Fleet Manager",
  DISPATCHER: "Dispatcher",
  SAFETY_OFFICER: "Safety Officer",
  FINANCIAL_ANALYST: "Financial Analyst",
};

export function formatCurrency(value: number, currency = "₹") {
  if (Math.abs(value) >= 1e7) return `${currency}${(value / 1e7).toFixed(2)}Cr`;
  if (Math.abs(value) >= 1e5) return `${currency}${Math.round(value / 1000)}k`;
  return `${currency}${Math.round(value).toLocaleString("en-IN")}`;
}

export function formatRelative(iso: string): string {
  const now = new Date();
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const min = Math.round(diffMs / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.round(hr / 24);
  return `${d}d ago`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const vehicleRegistrySeed = (): VehicleRegistryRow[] => [
  {
    id: "vh-01",
    fleetCode: "FL-001",
    registrationNo: "MH-01-AB-4211",
    manufacturer: "Tata",
    model: "Ace Gold",
    type: "VAN",
    status: "ON_TRIP",
    maxLoadKg: 750,
    odometer: 84210,
    acquisitionCost: 740000,
    driverName: "Alex Fernandes",
    tripNumber: "TR-24-0312",
  },
  {
    id: "vh-02",
    fleetCode: "FL-002",
    registrationNo: "MH-12-EF-9082",
    manufacturer: "Mahindra",
    model: "Bolero Pickup",
    type: "MINI_TRUCK",
    status: "AVAILABLE",
    maxLoadKg: 1200,
    odometer: 51100,
    acquisitionCost: 820000,
  },
  {
    id: "vh-03",
    fleetCode: "FL-003",
    registrationNo: "MH-04-GH-1245",
    manufacturer: "Ashok Leyland",
    model: "Ecomet",
    type: "TRUCK",
    status: "AVAILABLE",
    maxLoadKg: 4500,
    odometer: 112400,
    acquisitionCost: 2400000,
  },
  {
    id: "vh-04",
    fleetCode: "FL-004",
    registrationNo: "MH-12-CC-5511",
    manufacturer: "Tata",
    model: "Ultra T7",
    type: "TRUCK",
    status: "IN_SHOP",
    maxLoadKg: 7000,
    odometer: 168200,
    acquisitionCost: 3100000,
  },
  {
    id: "vh-05",
    fleetCode: "FL-005",
    registrationNo: "MH-43-99-2014",
    manufacturer: "Eicher",
    model: "Skyline Pro 3012",
    type: "BUS",
    status: "AVAILABLE",
    maxLoadKg: 9000,
    odometer: 92100,
    acquisitionCost: 4200000,
  },
];

export const driverRegistrySeed = (): DriverRegistryRow[] => [
  {
    id: "dr-01",
    name: "Alex Fernandes",
    licenseNumber: "MH-01 20180042",
    licenseCategory: "LMV-NT",
    licenseExpiry: isoDaysFromNow(412),
    contactNumber: "+91 98200 11122",
    safetyScore: 92,
    status: "ON_TRIP",
  },
  {
    id: "dr-02",
    name: "Priya Sharma",
    licenseNumber: "MH-12 20201200",
    licenseCategory: "HMV",
    licenseExpiry: isoDaysFromNow(680),
    contactNumber: "+91 97692 33221",
    safetyScore: 88,
    status: "AVAILABLE",
  },
  {
    id: "dr-03",
    name: "Rahul Mehta",
    licenseNumber: "MH-04 20150221",
    licenseCategory: "HMV",
    licenseExpiry: isoDaysFromNow(18),
    contactNumber: "+91 99876 44110",
    safetyScore: 78,
    status: "AVAILABLE",
  },
  {
    id: "dr-04",
    name: "Imran Shaikh",
    licenseNumber: "MH-01 20190668",
    licenseCategory: "LMV-NT",
    licenseExpiry: isoDaysFromNow(190),
    contactNumber: "+91 90220 12345",
    safetyScore: 71,
    status: "OFF_DUTY",
  },
  {
    id: "dr-05",
    name: "Vikas Patil",
    licenseNumber: "MH-12 20230001",
    licenseCategory: "HMV",
    licenseExpiry: isoDaysFromNow(18),
    contactNumber: "+91 98901 81221",
    safetyScore: 84,
    status: "AVAILABLE",
  },
];

export const tripRegistrySeed = (): TripRegistryRow[] => [
  {
    id: "tr-01",
    tripNumber: "TR-24-0312",
    source: "Andheri",
    destination: "Bhiwandi",
    cargoWeightKg: 720,
    plannedDistanceKm: 64,
    startOdometer: 84145,
    endOdometer: null,
    fuelConsumedL: null,
    revenue: 8400,
    status: "DISPATCHED",
    vehicleId: "vh-01",
    vehicleLabel: "MH-01-AB-4211",
    driverId: "dr-01",
    driverName: "Alex Fernandes",
    dispatchedAt: isoDaysFromNow(0),
    completedAt: null,
  },
  {
    id: "tr-02",
    tripNumber: "TR-24-0311",
    source: "Nashik",
    destination: "Bhiwandi",
    cargoWeightKg: 1100,
    plannedDistanceKm: 168,
    startOdometer: 50932,
    endOdometer: 51100,
    fuelConsumedL: 26.4,
    revenue: 18400,
    status: "COMPLETED",
    vehicleId: "vh-02",
    vehicleLabel: "MH-12-EF-9082",
    driverId: "dr-02",
    driverName: "Priya Sharma",
    dispatchedAt: isoDaysFromNow(-2),
    completedAt: isoDaysFromNow(-1),
  },
  {
    id: "tr-03",
    tripNumber: "TR-24-0310",
    source: "Mumbai",
    destination: "Surat",
    cargoWeightKg: 4200,
    plannedDistanceKm: 295,
    startOdometer: 112100,
    endOdometer: 112400,
    fuelConsumedL: 48.2,
    revenue: 38400,
    status: "COMPLETED",
    vehicleId: "vh-03",
    vehicleLabel: "MH-04-GH-1245",
    driverId: "dr-03",
    driverName: "Rahul Mehta",
    dispatchedAt: isoDaysFromNow(-3),
    completedAt: isoDaysFromNow(-1),
  },
  {
    id: "tr-04",
    tripNumber: "TR-24-0309",
    source: "Andheri",
    destination: "Vapi",
    cargoWeightKg: 580,
    plannedDistanceKm: 184,
    startOdometer: 24010,
    endOdometer: null,
    fuelConsumedL: null,
    revenue: null,
    status: "CANCELLED",
    vehicleId: "vh-05",
    vehicleLabel: "MH-43-99-2014",
    driverId: "dr-04",
    driverName: "Imran Shaikh",
    dispatchedAt: isoDaysFromNow(-3),
    completedAt: null,
  },
  {
    id: "tr-05",
    tripNumber: "TR-24-0308",
    source: "Mumbai",
    destination: "Kolhapur",
    cargoWeightKg: 1100,
    plannedDistanceKm: 380,
    startOdometer: 50730,
    endOdometer: 50932,
    fuelConsumedL: 32.1,
    revenue: 26800,
    status: "COMPLETED",
    vehicleId: "vh-02",
    vehicleLabel: "MH-12-EF-9082",
    driverId: "dr-02",
    driverName: "Priya Sharma",
    dispatchedAt: isoDaysFromNow(-5),
    completedAt: isoDaysFromNow(-2),
  },
];
