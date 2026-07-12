"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Breadcrumbs } from "@/components/shell/breadcrumbs";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { DataTable, SearchInput, FilterSelect } from "@/components/ui/data-table";
import type { Column } from "@/components/ui/data-table";
import { api } from "@/lib/api-client";
import { VehicleDrawer } from "@/components/vehicles/vehicle-drawer";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { VehicleStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  VehicleStatus,
  { label: string; status: "success" | "info" | "warning" | "neutral" }
> = {
  AVAILABLE: { label: "Available", status: "success" },
  ON_TRIP: { label: "On Trip", status: "info" },
  IN_SHOP: { label: "In Shop", status: "warning" },
  RETIRED: { label: "Retired", status: "neutral" },
};

const typeLabels: Record<string, string> = {
  VAN: "Van",
  MINI_TRUCK: "Mini Truck",
  TRUCK: "Truck",
  BUS: "Bus",
  OTHER: "Other",
};

const STATUS_OPTIONS = [
  { label: "Available", value: "AVAILABLE" },
  { label: "On Trip", value: "ON_TRIP" },
  { label: "In Shop", value: "IN_SHOP" },
  { label: "Retired", value: "RETIRED" },
];

const TYPE_OPTIONS = [
  { label: "Van", value: "VAN" },
  { label: "Mini Truck", value: "MINI_TRUCK" },
  { label: "Truck", value: "TRUCK" },
  { label: "Bus", value: "BUS" },
  { label: "Other", value: "OTHER" },
];

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Drawer & Dialog State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(undefined);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchVehicles = async () => {
    try {
      const data = await api.vehicles.list();
      setVehicles(data);
    } catch (err) {
      console.error("Failed to load vehicles", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.vehicles.delete(deleteConfirmId);
      fetchVehicles();
    } catch (err) {
      console.error("Failed to delete vehicle", err);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const openEditDrawer = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setIsDrawerOpen(true);
  };

  const openCreateDrawer = () => {
    setSelectedVehicle(undefined);
    setIsDrawerOpen(true);
  };

  const columns: Column<any>[] = [
    {
      key: "fleetCode",
      header: "Fleet Code",
      mono: true,
      sortable: true,
      render: (r) => (
        <span className="font-mono text-[12px] tabular-nums text-ink-700 tracking-[0.02em]">
          {r.fleetCode}
        </span>
      ),
    },
    {
      key: "registrationNo",
      header: "Registration No",
      mono: true,
      sortable: true,
      render: (r) => (
        <span className="font-mono text-[12.5px] font-medium tabular-nums text-ink-900">
          {r.registrationNo}
        </span>
      ),
    },
    {
      key: "model",
      header: "Make & Model",
      sortable: true,
      render: (r) => (
        <div>
          <p className="text-[13.5px] font-medium text-ink-900">
            {r.manufacturer ? `${r.manufacturer} ${r.model}` : r.model}
          </p>
          <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-500">
            {typeLabels[r.type] ?? r.type}
          </p>
        </div>
      ),
    },
    {
      key: "maxLoadKg",
      header: "Max Load",
      mono: true,
      align: "right",
      sortable: true,
      render: (r) => (
        <span className="font-mono tabular-nums text-[13px] text-ink-700">
          {r.maxLoadKg.toLocaleString("en-IN")}{" "}
          <span className="text-[10.5px] uppercase tracking-[0.08em] text-ink-400">kg</span>
        </span>
      ),
    },
    {
      key: "odometer",
      header: "Odometer",
      mono: true,
      align: "right",
      sortable: true,
      render: (r) => (
        <span className="font-mono tabular-nums text-[13px] text-ink-700">
          {r.odometer.toLocaleString("en-IN")}{" "}
          <span className="text-[10.5px] uppercase tracking-[0.08em] text-ink-400">km</span>
        </span>
      ),
    },
    {
      key: "acquisitionCost",
      header: "Acq. Cost",
      mono: true,
      align: "right",
      sortable: true,
      render: (r) => (
        <span className="font-mono tabular-nums text-[13px] text-ink-700">
          ₹{(r.acquisitionCost / 100000).toFixed(1)}
          <span className="text-[10.5px] uppercase tracking-[0.08em] text-ink-400">L</span>
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (r) => {
        const cfg = statusConfig[r.status as VehicleStatus] || { label: r.status, status: "neutral" };
        return <StatusBadge status={cfg.status} label={cfg.label} />;
      },
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      render: (r) => (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => openEditDrawer(r)}
            className="rounded p-1 text-ink-400 hover:bg-surface-2 hover:text-ink-900 transition-colors duration-150"
            title="Edit vehicle"
          >
            <Edit2 className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteConfirmId(r.id)}
            className="rounded p-1 text-ink-400 hover:bg-danger/8 hover:text-danger transition-colors duration-150"
            title="Delete vehicle"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const filtered = vehicles.filter((v) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      v.registrationNo.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      (v.manufacturer?.toLowerCase().includes(q) ?? false) ||
      v.fleetCode.toLowerCase().includes(q);
    const matchStatus = !statusFilter || v.status === statusFilter;
    const matchType = !typeFilter || v.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const total = vehicles.length;
  const available = vehicles.filter((v) => v.status === "AVAILABLE").length;
  const onTrip = vehicles.filter((v) => v.status === "ON_TRIP").length;
  const inShop = vehicles.filter((v) => v.status === "IN_SHOP").length;

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Breadcrumbs items={[{ label: "Operate" }, { label: "Vehicles" }]} />
        <PageHeader
          title="Fleet Registry"
          description={`${total} registered vehicles · Andheri depot`}
        >
          <button
            type="button"
            onClick={openCreateDrawer}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-amber-500 px-3.5 text-[13px] font-medium text-white transition-colors duration-200 ease-out-quart hover:bg-amber-600 dark:hover:bg-amber-400"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add vehicle
          </button>
        </PageHeader>
      </div>

      {/* Stat chips */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Total", value: total, color: "text-ink-900" },
          { label: "Available", value: available, color: "text-success" },
          { label: "On Trip", value: onTrip, color: "text-info" },
          { label: "In Shop", value: inShop, color: "text-warning" },
        ].map((chip) => (
          <div
            key={chip.label}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface-1 px-3 py-1.5"
          >
            <span className={cn("font-mono text-[15px] font-medium tabular-nums", chip.color)}>
              {chip.value}
            </span>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-500">
              {chip.label}
            </span>
          </div>
        ))}
      </div>

      {/* Table section */}
      <div className="rounded-md border border-border bg-surface-1">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
          <div className="min-w-[220px] flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by reg no, model, fleet code…"
            />
          </div>
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
            placeholder="All statuses"
          />
          <FilterSelect
            value={typeFilter}
            onChange={setTypeFilter}
            options={TYPE_OPTIONS}
            placeholder="All types"
          />
          {(search || statusFilter || typeFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                setTypeFilter("");
              }}
              className="text-[12px] font-medium text-ink-500 underline-offset-2 hover:text-ink-900 hover:underline transition-colors duration-150"
            >
              Clear
            </button>
          )}
        </div>

        {loading ? (
          <div className="px-4 py-16 text-center text-[13px] text-ink-500">
            Loading fleet registry...
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={filtered}
            getRowKey={(r) => r.id}
            emptyHeading="No vehicles match your filters"
            emptyDescription="Try a different search term or remove a filter."
            footer={
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-500">
                {filtered.length} of {total} vehicles
              </p>
            }
          />
        )}
      </div>

      {/* Slide-over Form Drawer */}
      <VehicleDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={fetchVehicles}
        vehicle={selectedVehicle}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete Vehicle"
        description="Are you sure you want to delete this vehicle from the registry? This action is permanent and cannot be undone."
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
}
