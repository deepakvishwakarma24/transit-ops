"use client";

import { useState, useEffect } from "react";
import { Plus, ShieldAlert, Edit2, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Breadcrumbs } from "@/components/shell/breadcrumbs";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { DataTable, SearchInput, FilterSelect } from "@/components/ui/data-table";
import type { Column } from "@/components/ui/data-table";
import { api } from "@/lib/api-client";
import { DriverDrawer } from "@/components/drivers/driver-drawer";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { DriverStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  DriverStatus,
  { label: string; status: "success" | "info" | "warning" | "neutral" | "danger" }
> = {
  AVAILABLE: { label: "Available", status: "success" },
  ON_TRIP: { label: "On Trip", status: "info" },
  OFF_DUTY: { label: "Off Duty", status: "neutral" },
  SUSPENDED: { label: "Suspended", status: "danger" },
};

const STATUS_OPTIONS = [
  { label: "Available", value: "AVAILABLE" },
  { label: "On Trip", value: "ON_TRIP" },
  { label: "Off Duty", value: "OFF_DUTY" },
  { label: "Suspended", value: "SUSPENDED" },
];

function ExpiryCell({ expiry }: { expiry: string }) {
  const days = Math.round(
    (new Date(expiry).getTime() - Date.now()) / 86400000
  );
  if (days < 0) {
    return (
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[12px] tabular-nums text-danger">
          {new Date(expiry).toISOString().slice(0, 10)}
        </span>
        <StatusBadge status="danger" label="Expired" />
      </div>
    );
  }
  if (days <= 30) {
    return (
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[12px] tabular-nums text-warning">
          {new Date(expiry).toISOString().slice(0, 10)}
        </span>
        <StatusBadge status="warning" label={`${days}d left`} />
      </div>
    );
  }
  if (days <= 60) {
    return (
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[12px] tabular-nums text-ink-700">
          {new Date(expiry).toISOString().slice(0, 10)}
        </span>
        <StatusBadge status="info" label={`${days}d left`} />
      </div>
    );
  }
  return (
    <span className="font-mono text-[12px] tabular-nums text-ink-700">
      {new Date(expiry).toISOString().slice(0, 10)}
    </span>
  );
}

function SafetyScoreCell({ score }: { score: number }) {
  const color =
    score >= 85 ? "text-success" : score >= 70 ? "text-warning" : "text-danger";
  return (
    <span className={cn("font-mono text-[15px] font-medium tabular-nums", color)}>
      {score}
    </span>
  );
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Drawer & Dialog State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any>(undefined);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchDrivers = async () => {
    try {
      const data = await api.drivers.list();
      setDrivers(data);
    } catch (err) {
      console.error("Failed to load drivers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.drivers.delete(deleteConfirmId);
      fetchDrivers();
    } catch (err) {
      console.error("Failed to delete driver", err);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const openEditDrawer = (driver: any) => {
    setSelectedDriver(driver);
    setIsDrawerOpen(true);
  };

  const openCreateDrawer = () => {
    setSelectedDriver(undefined);
    setIsDrawerOpen(true);
  };

  const columns: Column<any>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (r) => (
        <span className="text-[13.5px] font-medium text-ink-900">{r.name}</span>
      ),
    },
    {
      key: "licenseNumber",
      header: "License No",
      mono: true,
      sortable: true,
      render: (r) => (
        <span className="font-mono text-[12px] tabular-nums text-ink-700">
          {r.licenseNumber}
        </span>
      ),
    },
    {
      key: "licenseCategory",
      header: "Category",
      render: (r) => (
        <span className="inline-flex items-center rounded-sm bg-surface-2 px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-700 border border-border">
          {r.licenseCategory}
        </span>
      ),
    },
    {
      key: "licenseExpiry",
      header: "License Expiry",
      sortable: true,
      render: (r) => <ExpiryCell expiry={r.licenseExpiry} />,
    },
    {
      key: "contactNumber",
      header: "Contact",
      mono: true,
      render: (r) => (
        <span className="font-mono text-[12px] text-ink-700">{r.contactNumber}</span>
      ),
    },
    {
      key: "safetyScore",
      header: "Safety Score",
      mono: true,
      align: "right",
      sortable: true,
      render: (r) => <SafetyScoreCell score={r.safetyScore} />,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (r) => {
        const cfg = statusConfig[r.status as DriverStatus] || { label: r.status, status: "neutral" };
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
            title="Edit driver"
          >
            <Edit2 className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteConfirmId(r.id)}
            className="rounded p-1 text-ink-400 hover:bg-danger/8 hover:text-danger transition-colors duration-150"
            title="Delete driver"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const filtered = drivers.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      d.name.toLowerCase().includes(q) ||
      d.licenseNumber.toLowerCase().includes(q) ||
      d.contactNumber.includes(q);
    const matchStatus = !statusFilter || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const total = drivers.length;
  const avgScore = total
    ? Math.round(drivers.reduce((sum, d) => sum + d.safetyScore, 0) / total)
    : 100;
  const suspended = drivers.filter((d) => d.status === "SUSPENDED").length;
  const expiringSoon = drivers.filter((d) => {
    const days = Math.round(
      (new Date(d.licenseExpiry).getTime() - Date.now()) / 86400000
    );
    return days >= 0 && days <= 30;
  }).length;

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Breadcrumbs items={[{ label: "Operate" }, { label: "Drivers" }]} />
        <PageHeader
          title="Driver Roster"
          description={`${total} registered drivers · Andheri depot`}
        >
          <button
            type="button"
            onClick={openCreateDrawer}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-amber-500 px-3.5 text-[13px] font-medium text-white transition-colors duration-200 ease-out-quart hover:bg-amber-600 dark:hover:bg-amber-400"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add driver
          </button>
        </PageHeader>
      </div>

      {/* Summary bar */}
      <div className="flex flex-wrap gap-2">
        {[
          {
            label: "Avg Safety Score",
            value: avgScore,
            color: avgScore >= 85 ? "text-success" : avgScore >= 70 ? "text-warning" : "text-danger",
          },
          {
            label: "Suspended",
            value: suspended,
            color: suspended > 0 ? "text-danger" : "text-ink-900",
          },
          {
            label: "Expiring ≤ 30d",
            value: expiringSoon,
            color: expiringSoon > 0 ? "text-warning" : "text-ink-900",
          },
          { label: "Total", value: total, color: "text-ink-900" },
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

      {/* License expiry alert */}
      {expiringSoon > 0 && (
        <div className="flex items-start gap-3 rounded-md border border-warning/30 bg-warning/8 p-4">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-warning">
              Compliance notice
            </p>
            <p className="mt-1 text-[13px] text-ink-700">
              {expiringSoon} driver license{expiringSoon !== 1 ? "s" : ""} expiring within 30
              days. Dispatch automatically refuses assignment once a license hits its expiry
              date.
            </p>
          </div>
        </div>
      )}

      {/* Table section */}
      <div className="rounded-md border border-border bg-surface-1">
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
          <div className="min-w-[220px] flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by name, license, contact…"
            />
          </div>
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
            placeholder="All statuses"
          />
          {(search || statusFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("");
              }}
              className="text-[12px] font-medium text-ink-500 underline-offset-2 hover:text-ink-900 hover:underline transition-colors duration-150"
            >
              Clear
            </button>
          )}
        </div>

        {loading ? (
          <div className="px-4 py-16 text-center text-[13px] text-ink-500">
            Loading driver roster...
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={filtered}
            getRowKey={(r) => r.id}
            emptyHeading="No drivers match your filters"
            emptyDescription="Try a different search term or remove a filter."
            footer={
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-500">
                {filtered.length} of {total} drivers
              </p>
            }
          />
        )}
      </div>

      {/* Slide-over Form Drawer */}
      <DriverDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={fetchDrivers}
        driver={selectedDriver}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete Driver"
        description="Are you sure you want to delete this driver from the roster? This action is permanent and cannot be undone."
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
}
