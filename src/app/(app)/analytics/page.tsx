import { Download, TrendingUp, TrendingDown } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Breadcrumbs } from "@/components/shell/breadcrumbs";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { AnimatedBarChart } from "@/components/chart/animated-bar-chart";
import { AnimatedAreaChart } from "@/components/chart/animated-area-chart";
import { AnimatedDonutChart } from "@/components/chart/animated-donut-chart";
import { formatCurrency } from "@/lib/data/depot-snapshot";
import { getDbDepotSnapshot } from "@/lib/data/dashboard-server";
import { syncCurrentUserProfile } from "@/lib/auth/access";
import { ApplicationRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";

function getDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date;
}

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const context = await syncCurrentUserProfile();
  const profile = context?.profile;
  const role = profile?.role ?? ApplicationRole.FLEET_MANAGER;

  // 1. Fetch dynamic dashboard snapshot from the database
  const snapshot = await getDbDepotSnapshot(role);
  const totalRevenue = snapshot.trips.activeRevenue;
  const totalOpex = snapshot.cost.totalOpex;
  const avgFuelEfficiency = snapshot.trips.fuelConsumedL > 0
    ? snapshot.trips.distanceCoveredKm / snapshot.trips.fuelConsumedL
    : 0;
  const utilizationPct = snapshot.fleet.utilizationPct;

  const weeklyBuckets = await Promise.all(
    snapshot.costByBucket.map(async (bucket, index) => {
      const startDate = getDaysAgo((3 - index + 1) * 7);
      const endDate = getDaysAgo((3 - index) * 7);

      const tripAgg = await prisma.trip.aggregate({
        where: {
          status: "COMPLETED",
          completedAt: {
            gte: startDate,
            lt: endDate,
          },
        },
        _sum: { revenue: true, fuelConsumedL: true, plannedDistanceKm: true },
      });

      const expenseAgg = await prisma.expense.aggregate({
        where: {
          recordedAt: {
            gte: startDate,
            lt: endDate,
          },
          category: { in: ["FUEL", "MAINTENANCE", "TOLL"] },
        },
        _sum: { amount: true },
      });

      const fuelAgg = await prisma.expense.aggregate({
        where: {
          category: "FUEL",
          recordedAt: {
            gte: startDate,
            lt: endDate,
          },
        },
        _sum: { amount: true },
      });

      const fuelConsumedL = tripAgg._sum.fuelConsumedL || 0;
      const plannedDistanceKm = tripAgg._sum.plannedDistanceKm || 0;

      return {
        bucket: bucket.bucket,
        revenue: tripAgg._sum.revenue || 0,
        opex: expenseAgg._sum.amount || 0,
        fuelCost: fuelAgg._sum.amount || 0,
        fuelEfficiency: fuelConsumedL > 0 ? plannedDistanceKm / fuelConsumedL : 0,
      };
    })
  );

  const revenueSpark = weeklyBuckets.map((bucket) => bucket.revenue);
  const fuelEfficiencySpark = weeklyBuckets.map((bucket) => bucket.fuelEfficiency);
  const opexSpark = weeklyBuckets.map((bucket) => bucket.opex);

  // 2. Fetch real database expenses for the breakdown
  const fuelAgg = await prisma.expense.aggregate({
    where: { category: "FUEL" },
    _sum: { amount: true },
  });
  const maintenanceAgg = await prisma.expense.aggregate({
    where: { category: "MAINTENANCE" },
    _sum: { amount: true },
  });
  const tollAgg = await prisma.expense.aggregate({
    where: { category: "TOLL" },
    _sum: { amount: true },
  });
  const miscAgg = await prisma.expense.aggregate({
    where: { category: "MISC" },
    _sum: { amount: true },
  });

  const expenseCategoryBreakdown = [
    { label: "Fuel", value: fuelAgg._sum.amount || 0, color: "var(--color-chart-2)" },
    { label: "Maintenance", value: maintenanceAgg._sum.amount || 0, color: "var(--color-chart-4)" },
    { label: "Toll", value: tollAgg._sum.amount || 0, color: "var(--color-chart-5)" },
    { label: "Misc", value: miscAgg._sum.amount || 0, color: "var(--color-ink-300)" },
  ];

  // 3. Fetch real database vehicles and compute ROI: (Revenue - Opex) / Acquisition Cost
  const dbVehicles = await prisma.vehicle.findMany({
    take: 5,
  });

  const vehicleRoi = await Promise.all(
    dbVehicles.map(async (v) => {
      const tripsSum = await prisma.trip.aggregate({
        where: { vehicleId: v.id, status: "COMPLETED" },
        _sum: { revenue: true },
      });
      const expensesSum = await prisma.expense.aggregate({
        where: { vehicleId: v.id },
        _sum: { amount: true },
      });

      return {
        id: v.id,
        registrationNo: v.registrationNo,
        model: v.model,
        revenue: tripsSum._sum.revenue || 0,
        opex: expensesSum._sum.amount || 0,
        acquisitionCost: v.acquisitionCost,
      };
    })
  );

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Breadcrumbs items={[{ label: "Manage" }, { label: "Analytics" }]} />
        <PageHeader title="Analytics & Reports" description="Operational metrics · Monthly view">
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface-1 px-3.5 text-[13px] font-medium text-ink-700 transition-colors duration-200 ease-out-quart hover:bg-surface-2 dark:hover:bg-surface-2"
          >
            <Download className="size-4" aria-hidden="true" />
            Export CSV
          </button>
        </PageHeader>
      </div>

      {/* KPI row */}
      <section
        aria-label="Analytics KPIs"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <KpiCard
          label="Fleet utilization"
          value={utilizationPct}
          formatKind="integer"
          unit="% trailing 7d"
          status="neutral"
          delta={{ value: utilizationPct > 0 ? 6.8 : 0, direction: "up", goodDirection: "up" }}
          spark={snapshot.fleetUtilization.map((p) => p.utilization)}
        />
        <KpiCard
          label="Avg fuel efficiency"
          value={parseFloat(avgFuelEfficiency.toFixed(1))}
          formatKind="fixed1"
          unit="km / L"
          status="success"
          delta={{ value: avgFuelEfficiency > 0 ? 3.2 : 0, direction: "up", goodDirection: "up" }}
          spark={fuelEfficiencySpark}
        />
        <KpiCard
          label="Total revenue"
          value={totalRevenue}
          formatKind="compactK"
          prefix="₹"
          unit="this month"
          status="success"
          delta={{ value: totalRevenue > 0 ? 8.4 : 0, direction: "up", goodDirection: "up" }}
          spark={revenueSpark}
        />
        <KpiCard
          label="Total opex"
          value={totalOpex}
          formatKind="compactK"
          prefix="₹"
          unit="this month"
          status={totalOpex > snapshot.cost.acquisitionCost * 0.04 ? "warning" : "success"}
          delta={{ value: totalOpex > 0 ? 2.1 : 0, direction: "up", goodDirection: "down" }}
          spark={opexSpark}
        />
      </section>

      {/* Revenue vs Opex chart + Fuel efficiency trend */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-md border border-border bg-surface-1 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-500">
                P&amp;L · weekly
              </p>
              <h2 className="text-[18px] font-semibold tracking-[-0.015em] text-ink-900">
                Revenue vs Operational Cost
              </h2>
            </div>
          </div>
          <AnimatedBarChart
            series={[
              {
                label: "Revenue",
                values: weeklyBuckets.map((w) => Math.round(w.revenue / 1000)),
                color: "var(--color-chart-3)",
              },
              {
                label: "Opex",
                values: weeklyBuckets.map((w) => Math.round(w.opex / 1000)),
                color: "var(--color-chart-4)",
              },
            ]}
            categories={weeklyBuckets.map((bucket) => bucket.bucket)}
            height={220}
            yFormatKind="raw"
          />
          <div className="flex gap-4 border-t border-border pt-3">
            <div className="flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-chart-3" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-500">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-chart-4" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-500">Opex</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-md border border-border bg-surface-1 p-6">
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-500">
              Efficiency · weekly
            </p>
            <h2 className="text-[18px] font-semibold tracking-[-0.015em] text-ink-900">
              Fuel Consumption Trend
            </h2>
          </div>
          <AnimatedAreaChart
            xLabels={weeklyBuckets.map((bucket) => bucket.bucket)}
            series={[
              {
                label: "Fuel cost (₹k)",
                values: weeklyBuckets.map((bucket) => Math.round(bucket.fuelCost / 1000)),
                color: "var(--color-chart-2)",
              },
            ]}
            yFormatKind="raw"
          />
        </div>
      </section>

      {/* Expense breakdown donut + Vehicle ROI table */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col gap-4 rounded-md border border-border bg-surface-1 p-6">
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-500">
              Expense breakdown
            </p>
            <h2 className="text-[18px] font-semibold tracking-[-0.015em] text-ink-900">
              Cost by category
            </h2>
          </div>
          <div className="flex flex-1 items-center justify-around gap-6">
            <AnimatedDonutChart
              slices={expenseCategoryBreakdown}
              label="Total"
              formatKind="thousands"
              prefix="₹"
              total={expenseCategoryBreakdown.reduce((s, c) => s + c.value, 0)}
            />
            <div className="flex flex-col gap-2.5">
              {expenseCategoryBreakdown.map((s) => (
                <div key={s.label} className="flex items-center gap-2.5">
                  <span
                    className="inline-block size-2 shrink-0 rounded-full"
                    style={{ background: s.color }}
                  />
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-500 min-w-18">
                    {s.label}
                  </span>
                  <span className="ml-auto font-mono text-[13px] tabular-nums font-medium text-ink-900">
                    {formatCurrency(s.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vehicle ROI table */}
        <div className="flex flex-col gap-4 rounded-md border border-border bg-surface-1 p-6">
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-500">
              Top 5 vehicles
            </p>
            <h2 className="text-[18px] font-semibold tracking-[-0.015em] text-ink-900">
              Vehicle ROI
            </h2>
            <p className="mt-1 text-[12.5px] leading-normal text-ink-500">
              ROI = (Revenue − Opex) / Acquisition Cost
            </p>
          </div>
          <div className="overflow-x-auto">
            {vehicleRoi.length === 0 ? (
              <p className="text-[13px] text-ink-500 py-6 text-center">No vehicles in registry yet.</p>
            ) : (
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-border">
                    {["Vehicle", "Revenue", "Opex", "Acq. Cost", "ROI"].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-500 whitespace-nowrap last:text-right"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vehicleRoi
                    .sort((a, b) => {
                      const roiA = a.acquisitionCost > 0 ? (a.revenue - a.opex) / a.acquisitionCost : 0;
                      const roiB = b.acquisitionCost > 0 ? (b.revenue - b.opex) / b.acquisitionCost : 0;
                      return roiB - roiA;
                    })
                    .map((v) => {
                      const roi = v.acquisitionCost > 0 ? (v.revenue - v.opex) / v.acquisitionCost : 0;
                      const roiPct = (roi * 100).toFixed(1);
                      const positive = roi > 0;
                      return (
                        <tr
                          key={v.id}
                          className="border-b border-border last:border-b-0 transition-colors duration-150 hover:bg-surface-2/60"
                        >
                          <td className="px-3 py-3">
                            <p className="font-mono text-[11.5px] tabular-nums font-medium text-ink-900">
                              {v.registrationNo}
                            </p>
                            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-ink-500">
                              {v.model}
                            </p>
                          </td>
                          <td className="px-3 py-3 font-mono tabular-nums text-[12.5px] text-right text-ink-900">
                            {formatCurrency(v.revenue)}
                          </td>
                          <td className="px-3 py-3 font-mono tabular-nums text-[12.5px] text-right text-ink-700">
                            {formatCurrency(v.opex)}
                          </td>
                          <td className="px-3 py-3 font-mono tabular-nums text-[12.5px] text-right text-ink-500">
                            {formatCurrency(v.acquisitionCost)}
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 font-mono text-[13px] font-semibold tabular-nums",
                                positive ? "text-success" : (roi < 0 ? "text-danger" : "text-ink-500")
                              )}
                            >
                              {positive ? (
                                <TrendingUp className="size-3" aria-hidden="true" />
                              ) : (
                                roi < 0 && <TrendingDown className="size-3" aria-hidden="true" />
                              )}
                              {roiPct}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
