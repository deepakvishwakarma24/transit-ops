"use client";

import { useEffect, useState } from "react";
import { Plus, Route, ArrowRight, Clock, ShieldAlert, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Breadcrumbs } from "@/components/shell/breadcrumbs";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { DataTable, SearchInput, FilterSelect } from "@/components/ui/data-table";
import type { Column } from "@/components/ui/data-table";
import { formatRelative } from "@/lib/data/depot-snapshot";
import { api } from "@/lib/api-client";
import { TripStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import { TripDrawer } from "@/components/trips/trip-drawer";
import { CompleteTripDialog } from "@/components/trips/complete-trip-dialog";

const statusConfig: Record<
  TripStatus,
  { label: string; status: "success" | "info" | "warning" | "neutral" | "danger" }
> = {
  DISPATCHED: { label: "Dispatched", status: "info" },
  COMPLETED: { label: "Completed", status: "success" },
  CANCELLED: { label: "Cancelled", status: "danger" },
  DRAFT: { label: "Draft", status: "neutral" },
};

export default function TripsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Drawer & Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [completeTripId, setCompleteTripId] = useState<string | null>(null);
  const [startOdoForComplete, setStartOdoForComplete] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const data = await api.trips.list();
      setTrips(data);
    } catch (err: any) {
      console.error("Failed to load trips", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDispatch = async (tripId: string) => {
    setErrorMsg(null);
    try {
      await api.trips.update(tripId, { status: TripStatus.DISPATCHED });
      await fetchTrips();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to dispatch trip");
    }
  };

  const handleCancel = async (tripId: string) => {
    setErrorMsg(null);
    try {
      await api.trips.update(tripId, { status: TripStatus.CANCELLED });
      await fetchTrips();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to cancel trip");
    }
  };

  const handleCompleteConfirm = async (data: { endOdometer: number; fuelConsumedL: number; revenue: number }) => {
    if (!completeTripId) return;
    setErrorMsg(null);
    try {
      await api.trips.update(completeTripId, {
        status: TripStatus.COMPLETED,
        ...data,
      });
      setCompleteTripId(null);
      await fetchTrips();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to complete trip");
    }
  };

  const handleDelete = async (tripId: string) => {
    if (!confirm("Are you sure you want to delete this trip record?")) return;
    setErrorMsg(null);
    try {
      await api.trips.delete(tripId);
      await fetchTrips();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete trip");
    }
  };

  const activeTrips = trips.filter(
    (t) => t.status === TripStatus.DISPATCHED || t.status === TripStatus.DRAFT
  );
  const closedTrips = trips.filter(
    (t) => t.status === TripStatus.COMPLETED || t.status === TripStatus.CANCELLED
  );

  const filteredClosed = closedTrips.filter((t) => {
    const q = search.toLowerCase();
    const vehicleLabel = t.vehicle ? `${t.vehicle.registrationNo} ${t.vehicle.model}`.toLowerCase() : "";
    const driverName = t.driver ? t.driver.name.toLowerCase() : "";

    const matchSearch =
      !q ||
      t.tripNumber.toLowerCase().includes(q) ||
      t.source.toLowerCase().includes(q) ||
      t.destination.toLowerCase().includes(q) ||
      driverName.includes(q) ||
      vehicleLabel.includes(q);
    const matchStatus = !statusFilter || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const closedColumns: Column<any>[] = [
    {
      key: "tripNumber",
      header: "Trip #",
      mono: true,
      sortable: true,
      render: (r) => (
        <span className="font-mono text-[12px] tabular-nums text-ink-700">{r.tripNumber}</span>
      ),
    },
    {
      key: "route",
      header: "Route",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-medium text-ink-900">{r.source}</span>
          <ArrowRight className="size-3 shrink-0 text-ink-400" />
          <span className="text-[13px] font-medium text-ink-900">{r.destination}</span>
        </div>
      ),
    },
    {
      key: "vehicle",
      header: "Vehicle",
      mono: true,
      sortable: true,
      render: (r) => (
        <span className="font-mono text-[12px] tabular-nums text-ink-700">
          {r.vehicle ? `${r.vehicle.registrationNo} (${r.vehicle.model})` : "—"}
        </span>
      ),
    },
    {
      key: "driver",
      header: "Driver",
      sortable: true,
      render: (r) => <span className="text-[13px] text-ink-900">{r.driver ? r.driver.name : "—"}</span>,
    },
    {
      key: "cargoWeightKg",
      header: "Cargo",
      mono: true,
      align: "right",
      sortable: true,
      render: (r) => (
        <span className="font-mono text-[12.5px] tabular-nums text-ink-700">
          {r.cargoWeightKg.toLocaleString("en-IN")}
          <span className="ml-0.5 text-[10px] uppercase text-ink-400">kg</span>
        </span>
      ),
    },
    {
      key: "plannedDistanceKm",
      header: "Distance",
      mono: true,
      align: "right",
      sortable: true,
      render: (r) => (
        <span className="font-mono text-[12.5px] tabular-nums text-ink-700">
          {r.plannedDistanceKm}
          <span className="ml-0.5 text-[10px] uppercase text-ink-400">km</span>
        </span>
      ),
    },
    {
      key: "fuelConsumedL",
      header: "Fuel",
      mono: true,
      align: "right",
      sortable: true,
      render: (r) =>
        r.fuelConsumedL != null ? (
          <span className="font-mono text-[12.5px] tabular-nums text-ink-700">
            {r.fuelConsumedL.toFixed(1)}
            <span className="ml-0.5 text-[10px] uppercase text-ink-400">L</span>
          </span>
        ) : (
          <span className="text-ink-400">—</span>
        ),
    },
    {
      key: "revenue",
      header: "Revenue",
      mono: true,
      align: "right",
      sortable: true,
      render: (r) =>
        r.revenue != null ? (
          <span className="font-mono text-[12.5px] tabular-nums text-ink-900">
            ₹{r.revenue.toLocaleString("en-IN")}
          </span>
        ) : (
          <span className="text-ink-400">—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (r) => {
        const cfg = statusConfig[r.status as TripStatus];
        return <StatusBadge status={cfg.status} label={cfg.label} />;
      },
    },
    {
      key: "completedAt",
      header: "Closed",
      mono: true,
      sortable: true,
      render: (r) =>
        r.completedAt || r.cancelledAt ? (
          <span className="font-mono text-[12px] tabular-nums text-ink-500">
            {formatRelative(r.completedAt || r.cancelledAt)}
          </span>
        ) : (
          <span className="text-ink-400">—</span>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Breadcrumbs items={[{ label: "Operate" }, { label: "Trips" }]} />
        <PageHeader
          title="Dispatch Board"
          description={`${activeTrips.length} active · ${closedTrips.length} closed · Andheri depot`}
        >
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-amber-500 px-3.5 text-[13px] font-medium text-white transition-colors duration-200 ease-out-quart hover:bg-amber-600 dark:hover:bg-amber-400"
          >
            <Plus className="size-4" aria-hidden="true" />
            Create trip
          </button>
        </PageHeader>
      </div>

      {errorMsg && (
        <div className="rounded-md border border-danger/30 bg-danger/8 p-4 text-[13px] text-danger flex items-center gap-2">
          <ShieldAlert className="size-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="size-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Active trips */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-500">
                Active — {activeTrips.length}
              </p>
            </div>
            {activeTrips.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-border py-12 text-center">
                <Route className="size-5 text-ink-400" aria-hidden="true" />
                <p className="text-[14px] font-semibold text-ink-900">No active trips</p>
                <p className="text-[13px] text-ink-500">Create a trip to start dispatch.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {activeTrips.map((t) => {
                  const cfg = statusConfig[t.status as TripStatus];
                  return (
                    <div
                      key={t.id}
                      className="flex flex-col gap-4 rounded-md border border-border bg-surface-1 p-5 transition-colors duration-200 ease-out-quart hover:bg-surface-2/50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col gap-1">
                          <StatusBadge status={cfg.status} label={cfg.label} />
                          <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-500">
                            {t.tripNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-ink-400">
                          <Clock className="size-3.5" aria-hidden="true" />
                          <span className="font-mono text-[11px] uppercase tracking-[0.12em]">
                            {formatRelative(t.dispatchedAt || t.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-semibold text-ink-900">{t.source}</span>
                        <ArrowRight className="size-3.5 shrink-0 text-amber-500" aria-hidden="true" />
                        <span className="text-[14px] font-semibold text-ink-900">{t.destination}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
                        <div>
                          <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-500">Vehicle</p>
                          <p className="mt-0.5 font-mono text-[12px] font-medium tabular-nums text-ink-900">
                            {t.vehicle ? `${t.vehicle.registrationNo} (${t.vehicle.model})` : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-500">Driver</p>
                          <p className="mt-0.5 text-[12.5px] font-medium text-ink-900">
                            {t.driver ? t.driver.name : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-500">Cargo</p>
                          <p className="mt-0.5 font-mono text-[12px] tabular-nums text-ink-900">
                            {t.cargoWeightKg.toLocaleString("en-IN")}{" "}
                            <span className="text-[9.5px] uppercase text-ink-400">kg</span>
                          </p>
                        </div>
                        <div>
                          <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-500">Planned Dist.</p>
                          <p className="mt-0.5 font-mono text-[12px] tabular-nums text-ink-900">
                            {t.plannedDistanceKm}{" "}
                            <span className="text-[9.5px] uppercase text-ink-400">km</span>
                          </p>
                        </div>
                      </div>

                      {/* Operational action buttons based on trip state */}
                      <div className="mt-2 flex items-center gap-2 border-t border-border pt-3">
                        {t.status === TripStatus.DRAFT ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleDispatch(t.id)}
                              className="flex-1 h-8 rounded-md bg-amber-500 text-[12px] font-medium text-white hover:bg-amber-600 transition-colors"
                            >
                              Dispatch Trip
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(t.id)}
                              title="Delete Draft"
                              className="h-8 w-8 shrink-0 flex items-center justify-center rounded-md border border-border text-ink-500 hover:text-danger hover:border-danger/30 hover:bg-danger/5 transition-colors"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setCompleteTripId(t.id);
                                setStartOdoForComplete(t.startOdometer);
                              }}
                              className="flex-1 h-8 rounded-md bg-success text-[12px] font-medium text-white hover:bg-success/90 transition-colors flex items-center justify-center gap-1"
                            >
                              <CheckCircle2 className="size-3.5" />
                              Complete
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCancel(t.id)}
                              className="h-8 rounded-md border border-border px-3 text-[12px] font-medium text-ink-600 hover:text-danger hover:bg-danger/5 transition-colors flex items-center justify-center gap-1"
                            >
                              <XCircle className="size-3.5" />
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Closed trips table */}
          <section>
            <div className="mb-3">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-500">
                History — {closedTrips.length}
              </p>
            </div>
            <div className="rounded-md border border-border bg-surface-1">
              <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
                <div className="min-w-[220px] flex-1">
                  <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by trip #, route, driver…"
                  />
                </div>
                <FilterSelect
                  value={statusFilter}
                  onChange={(v) => setStatusFilter(v === "DISPATCHED" || v === "DRAFT" ? "" : v)}
                  options={[
                    { label: "Completed", value: "COMPLETED" },
                    { label: "Cancelled", value: "CANCELLED" },
                  ]}
                  placeholder="All closed"
                />
                {(search || statusFilter) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("");
                    }}
                    className="text-[12px] font-medium text-ink-500 hover:text-ink-900 hover:underline underline-offset-2 transition-colors duration-150"
                  >
                    Clear
                  </button>
                )}
              </div>
              <DataTable
                columns={closedColumns}
                rows={filteredClosed}
                getRowKey={(r) => r.id}
                emptyHeading="No closed trips match"
                emptyDescription="Try a different search or filter."
                footer={
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-500">
                    {filteredClosed.length} of {closedTrips.length} closed trips
                  </p>
                }
              />
            </div>
          </section>
        </>
      )}

      {/* Side Drawer for Creating new trips */}
      <TripDrawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={fetchTrips}
      />

      {/* Dialog for completing active trips */}
      <CompleteTripDialog
        isOpen={completeTripId !== null}
        onClose={() => setCompleteTripId(null)}
        onConfirm={handleCompleteConfirm}
        startOdometer={startOdoForComplete}
      />
    </div>
  );
}
