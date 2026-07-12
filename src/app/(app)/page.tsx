import { syncCurrentUserProfile } from "@/lib/auth/access";
import {
  roleLabels,
} from "@/lib/data/depot-snapshot";
import { getDbDepotSnapshot } from "@/lib/data/dashboard-server";
import { ApplicationRole } from "@prisma/client";
import {
  TriangleAlert,
  Plus,
  Route,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/shell/page-header";
import { Breadcrumbs } from "@/components/shell/breadcrumbs";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { AnimatedBarChart } from "@/components/chart/animated-bar-chart";
import { AnimatedAreaChart } from "@/components/chart/animated-area-chart";
import { AnimatedDonutChart } from "@/components/chart/animated-donut-chart";
import { DashboardActivity } from "@/components/dashboard/dashboard-activity";
import { ExpiryWatchlist } from "@/components/dashboard/expiry-watchlist";
import { PricingTicker } from "@/components/dashboard/pricing-ticker";

export const dynamic = "force-dynamic";

const tripStatusPresentation: Record<
  string,
  { label: string; status: "success" | "warning" | "danger" | "info" | "neutral" }
> = {
  DISPATCHED: { label: "Dispatched", status: "info" },
  COMPLETED: { label: "Completed", status: "success" },
  CANCELLED: { label: "Cancelled", status: "danger" },
  DRAFT: { label: "Draft", status: "neutral" },
};

export default async function DashboardPage() {
  const context = await syncCurrentUserProfile();
  const profile = context?.profile;
  const role = (profile?.role ?? ApplicationRole.FLEET_MANAGER) as ApplicationRole;
  const snapshot = await getDbDepotSnapshot(role);
  const { currency } = snapshot;

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* ===== Top: breadcrumbs + header + actions ===== */}
      <div className="flex flex-col gap-4">
        <Breadcrumbs items={[{ label: "Depot" }, { label: "Andheri" }]} />
        <PageHeader
          eyebrow={`Logged in as ${roleLabels[role]}`}
          title="Good morning. Here's the depot at a glance."
          description={`Tracking ${snapshot.fleet.total} vehicles, ${snapshot.drivers.total} drivers, ${snapshot.trips.total} trips · ${snapshot.depotName}.`}
        >
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-ink-900 px-3.5 text-[13px] font-medium text-amber-100 transition-colors duration-200 ease-out-quart hover:bg-ink-800 dark:bg-amber-500 dark:text-ink-950 dark:hover:bg-amber-400"
          >
            <Plus className="size-4" aria-hidden="true" />
            New trip
      </button>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface-1 px-3.5 text-[13px] font-medium text-ink-700 transition-colors duration-200 ease-out-quart hover:bg-surface-2 dark:bg-surface-1 dark:hover:bg-surface-2"
          >
            <Route className="size-4" aria-hidden="true" />
            Quick dispatch
      </button>
       </PageHeader>
 </div>

      {/* ===== KPI grid ===== */}
      <section
        aria-label="Fleet KPIs"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <KpiCard
          label="Active vehicles"
          value={snapshot.fleet.available + snapshot.fleet.onTrip}
          unit="of 28"
          status="success"
          delta={{ value: 4.5, direction: "up", goodDirection: "up" }}
          spark={[8, 11, 9, 13, 14, 12, 15]}
        />
        <KpiCard
          label="On trip"
          value={snapshot.fleet.onTrip}
          unit="vehicles"
          status="info"
          delta={{ value: 1.2, direction: "up" }}
          hint="Real-time"
          spark={[4, 6, 7, 5, 8, 7, 9]}
        />
        <KpiCard
          label="In shop"
          value={snapshot.fleet.inShop}
          unit="vehicles"
          status="warning"
          delta={{ value: 1.5, direction: "up", goodDirection: "down" }}
          hint="2 due for review"
          spark={[2, 1, 2, 3, 3, 4, 4]}
        />
        <KpiCard
          label="Fleet utilization"
          value={snapshot.fleet.utilizationPct}
          formatKind="integer"
          unit="% trailing 7d"
          status="neutral"
          delta={{ value: 6.8, direction: "up", goodDirection: "up" }}
          spark={snapshot.fleetUtilization.map((p) => p.utilization)}
        />
  </section>

      {/* ===== Charts row ===== */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.8fr_1fr]">
        <div className="flex flex-col gap-4 rounded-md border border-border bg-surface-1 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-500">
                Trailing 7 days
        </p>
              <h2 className="text-[18px] font-semibold tracking-[-0.015em] text-ink-900">
                Utilization by day
       </h2>
           </div>
            <StatusBadge status="info" label="Live" />
         </div>
          <AnimatedBarChart
            series={[
              {
                label: "Trips completed",
                values: snapshot.fleetUtilization.map((p) => p.tripsCompleted),
                color: "var(--color-amber-500)",
              },
              {
                label: "Fuel cost (₹k)",
                values: snapshot.fleetUtilization.map((p) =>
                  Math.round(p.fuelCost / 1000)
                ),
                color: "var(--color-info)",
              },
            ]}
            categories={snapshot.fleetUtilization.map((p) => p.day)}
            height={240}
            yFormatKind="raw"
          />
       </div>

        <div className="flex flex-col gap-4 rounded-md border border-border bg-surface-1 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-500">
                Fleet status
        </p>
              <h2 className="text-[18px] font-semibold tracking-[-0.015em] text-ink-900">
                Right now
       </h2>
           </div>
         </div>
          <div className="flex flex-1 items-center justify-around gap-6">
            <AnimatedDonutChart
              slices={snapshot.vehicleDistribution.map((s) => ({
                label: s.status,
                value: s.value,
                color: s.color,
              }))}
              label="Vehicles"
              formatKind="raw"
              total={snapshot.fleet.total}
            />
            <div className="flex flex-col gap-2 text-[13px]">
              {snapshot.vehicleDistribution.map((s) => (
                <div
                  key={s.status}
                  className="flex items-center gap-2 font-medium"
                >
                  <span
                    className="inline-block size-2 rounded-full"
                    style={{ background: s.color }}
                  />
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-500">
                    {s.status.replace("_", " ")}
             </span>
                  <span className="ml-auto font-mono tabular-nums text-ink-900">
                    {s.value}
           </span>
         </div>
              ))}
           </div>
         </div>
       </div>
  </section>

      {/* ===== Ops money + watching ===== */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-4 rounded-md border border-border bg-surface-1 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-500">
                P&L · monthly
       </p>
              <h2 className="text-[18px] font-semibold tracking-[-0.015em] text-ink-900">
                Operational cost by week
       </h2>
           </div>
            <div className="flex gap-2">
              <StatusBadge status="info" label="Fuel" />
              <StatusBadge status="warning" label="Maintenance" />
              <StatusBadge status="neutral" label="Toll" />
           </div>
         </div>
          <AnimatedAreaChart
            xLabels={snapshot.costByBucket.map((p) => p.bucket)}
            series={[
              {
                label: "Fuel",
                values: snapshot.costByBucket.map((p) => p.fuel),
                color: "var(--color-info)",
              },
              {
                label: "Maintenance",
                values: snapshot.costByBucket.map((p) => p.maintenance),
                color: "var(--color-warning)",
              },
              {
                label: "Toll",
                values: snapshot.costByBucket.map((p) => p.toll),
                color: "var(--color-ink-400)",
              },
            ]}
            yFormatKind="thousands"
          />
          <div className="grid grid-cols-2 gap-3 border-t border-border pt-4 sm:grid-cols-4">
            <PricingTicker
              label="Fuel"
              value={snapshot.cost.fuel}
              currency={currency}
              icon="wallet"
              status="info"
            />
            <PricingTicker
              label="Maintenance"
              value={snapshot.cost.maintenance}
              currency={currency}
              icon="wrench"
              status="warning"
            />
            <PricingTicker
              label="Toll + Misc"
              value={snapshot.cost.toll + snapshot.cost.misc}
              currency={currency}
              icon="activity"
              status="neutral"
            />
            <PricingTicker
              label="Total Opex"
              value={snapshot.cost.totalOpex}
              currency={currency}
              icon="gauge"
              status={snapshot.cost.totalOpex > snapshot.cost.acquisitionCost * 0.04 ? "warning" : "success"}
            />
         </div>
       </div>

        <ExpiryWatchlist items={snapshot.expiryWatchlist} />
     </section>

      {/* ===== Activity ===== */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
        <DashboardActivity
          title="Live dispatch & completion feed"
          subtitle="Updates from the dispatch line. Closes against the ledger automatically."
          items={snapshot.recentActivity}
          presentation={tripStatusPresentation}
        />
        <div className="flex flex-col gap-4 rounded-md border border-border bg-surface-1 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-500">
                Drivers on duty
        </p>
              <h2 className="text-[18px] font-semibold tracking-[-0.015em] text-ink-900">
                Safety score average
       </h2>
           </div>
            <div className="flex items-center gap-2 text-ink-500">
              <Users className="size-4" aria-hidden="true" />
              <span className="font-mono text-[11px] uppercase tracking-[0.14em]">
                {snapshot.drivers.total} total
       </span>
           </div>
         </div>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-500">
                Avg safety score
       </p>
              <p
                className="mt-1 font-mono text-[28px] font-medium leading-none tracking-[-0.02em] text-ink-900"
                style={{ fontFeatureSettings: "'tnum' 1, 'cv11' 1" }}
              >
                {snapshot.drivers.avgSafetyScore}
             </p>
       </div>
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-500">
                Suspended
       </p>
              <p
                className="mt-1 font-mono text-[28px] font-medium leading-none tracking-[-0.02em] text-ink-900"
                style={{ fontFeatureSettings: "'tnum' 1, 'cv11' 1" }}
              >
                {snapshot.drivers.suspended}
             </p>
           </div>
         </div>
          <div className="rounded-sm border border-warning/30 bg-warning/10 p-3 text-[12.5px] leading-relaxed text-warning">
            <TriangleAlert className="mb-1 size-3.5 inline-block" aria-hidden="true" />
            <span className="ml-1 font-mono uppercase tracking-[0.12em] text-[10.5px]">
              Action needed
      </span>
            <p className="mt-1 text-ink-700">
              {snapshot.drivers.expiringSoon} driver license
              {snapshot.drivers.expiringSoon === 1 ? "" : "s"} expiring within 30 days. Renewals
              queued today pause dispatch eligibility automatically.
           </p>
         </div>
       </div>
     </section>
   </div>
  );
}
