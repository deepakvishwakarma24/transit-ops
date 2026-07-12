"use client";

import { useState, useEffect } from "react";
import { Plus, Wrench, AlertCircle, Edit2, Trash2, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Breadcrumbs } from "@/components/shell/breadcrumbs";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { api } from "@/lib/api-client";
import { MaintenanceDrawer } from "@/components/maintenance/maintenance-drawer";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { MaintenanceStatus } from "@prisma/client";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCost(v: number) {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${Math.round(v / 1000)}k`;
  return `₹${v.toLocaleString("en-IN")}`;
}

export default function MaintenancePage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Drawer & Dialog State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(undefined);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const data = await api.maintenance.list();
      setLogs(data);
    } catch (err) {
      console.error("Failed to load maintenance logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.maintenance.delete(deleteConfirmId);
      fetchLogs();
    } catch (err) {
      console.error("Failed to delete maintenance log", err);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleCloseJob = async (logId: string, vehicleId: string) => {
    try {
      await api.maintenance.update(logId, {
        status: "COMPLETED",
        completedAt: new Date().toISOString(),
      });
      fetchLogs();
    } catch (err) {
      console.error("Failed to close maintenance job", err);
    }
  };

  const openEditDrawer = (log: any) => {
    setSelectedLog(log);
    setIsDrawerOpen(true);
  };

  const openCreateDrawer = () => {
    setSelectedLog(undefined);
    setIsDrawerOpen(true);
  };

  const activeLogs = logs.filter((m) => m.status === "ACTIVE");
  const completedLogs = logs.filter((m) => m.status === "COMPLETED");
  const inShopCount = activeLogs.length;
  const totalCost = logs.reduce((sum, m) => sum + m.cost, 0);

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Breadcrumbs items={[{ label: "Manage" }, { label: "Maintenance" }]} />
        <PageHeader
          title="Maintenance Log"
          description={`${logs.length} records · ${inShopCount} vehicles in shop`}
        >
          <button
            type="button"
            onClick={openCreateDrawer}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-amber-500 px-3.5 text-[13px] font-medium text-white transition-colors duration-200 ease-out-quart hover:bg-amber-600 dark:hover:bg-amber-400"
          >
            <Plus className="size-4" aria-hidden="true" />
            New record
          </button>
        </PageHeader>
      </div>

      {/* Alert banner */}
      {inShopCount > 0 && (
        <div className="flex items-start gap-3 rounded-md border border-warning/30 bg-warning/8 p-4">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-warning">
              Active maintenance
            </p>
            <p className="mt-1 text-[13px] text-ink-700">
              {inShopCount} vehicle{inShopCount !== 1 ? "s" : ""} currently in shop and{" "}
              <strong>removed from dispatch eligibility</strong>. These will be restored once
              their maintenance record is closed.
            </p>
          </div>
        </div>
      )}

      {/* Stat chips */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Active jobs", value: activeLogs.length, color: "text-warning" },
          { label: "Completed", value: completedLogs.length, color: "text-success" },
          { label: "Total cost", value: formatCost(totalCost), color: "text-ink-900" },
        ].map((chip) => (
          <div
            key={chip.label}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface-1 px-3 py-1.5"
          >
            <span className={`font-mono text-[15px] font-medium tabular-nums ${chip.color}`}>
              {chip.value}
            </span>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-500">
              {chip.label}
            </span>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-[13px] text-ink-500">
          Loading maintenance records...
        </div>
      ) : (
        <>
          {/* Active maintenance */}
          {activeLogs.length > 0 && (
            <section>
              <p className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-warning">
                In Progress — {activeLogs.length}
              </p>
              <div className="flex flex-col gap-3">
                {activeLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-md border border-warning/25 bg-warning/5 p-5 flex flex-col justify-between md:flex-row md:items-start gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Wrench className="size-4 text-warning" aria-hidden="true" />
                            <span className="text-[14px] font-semibold text-ink-900">
                              {log.serviceType}
                            </span>
                          </div>
                          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-500">
                            {log.vehicle?.registrationNo || "Vehicle"} · {log.vehicle?.model || "Model"}
                          </p>
                        </div>
                        <StatusBadge status="warning" label="Active" />
                      </div>
                      {log.description && (
                        <p className="mt-3 text-[13px] leading-[1.55] text-ink-600 max-w-prose">
                          {log.description}
                        </p>
                      )}
                      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                        <div>
                          <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-500">Started</p>
                          <p className="mt-0.5 font-mono text-[12.5px] tabular-nums text-ink-900">
                            {formatDate(log.startedAt)}
                          </p>
                        </div>
                        <div>
                          <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-500">Cost so far</p>
                          <p className="mt-0.5 font-mono text-[12.5px] tabular-nums text-ink-900">
                            {formatCost(log.cost)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-start">
                      <button
                        type="button"
                        onClick={() => handleCloseJob(log.id, log.vehicleId)}
                        className="inline-flex h-8 items-center gap-1 rounded bg-success px-2.5 text-[12px] font-medium text-white hover:bg-success/90 transition-colors"
                      >
                        <CheckCircle className="size-3.5" />
                        Close Job
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditDrawer(log)}
                        className="rounded p-1.5 text-ink-400 hover:bg-surface-2 hover:text-ink-900 transition-colors"
                        title="Edit record"
                      >
                        <Edit2 className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(log.id)}
                        className="rounded p-1.5 text-ink-400 hover:bg-danger/8 hover:text-danger transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Completed logs table */}
          <section>
            <p className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-500">
              Completed — {completedLogs.length}
            </p>
            <div className="rounded-md border border-border bg-surface-1">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b border-border">
                      {["Vehicle", "Service Type", "Description", "Cost", "Started", "Completed", "Actions"].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-4 py-2.5 text-left font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-500 whitespace-nowrap"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {completedLogs.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-ink-400">
                          No completed maintenance logs.
                        </td>
                      </tr>
                    )}
                    {completedLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-border last:border-b-0 transition-colors duration-150 hover:bg-surface-2/60"
                      >
                        <td className="px-4 py-3.5">
                          <p className="font-mono text-[12px] tabular-nums font-medium text-ink-900">
                            {log.vehicle?.registrationNo || "Vehicle"}
                          </p>
                          <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.1,em] text-ink-500">
                            {log.vehicle?.model || "Model"}
                          </p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-[13px] font-medium text-ink-900">
                            {log.serviceType}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 max-w-[260px]">
                          <span className="text-[12.5px] text-ink-600 line-clamp-2">
                            {log.description ?? "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono tabular-nums text-[13px] text-ink-900">
                          {formatCost(log.cost)}
                        </td>
                        <td className="px-4 py-3.5 font-mono tabular-nums text-[12px] text-ink-700 whitespace-nowrap">
                          {formatDate(log.startedAt)}
                        </td>
                        <td className="px-4 py-3.5 font-mono tabular-nums text-[12px] text-ink-700 whitespace-nowrap">
                          {log.completedAt ? formatDate(log.completedAt) : "—"}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditDrawer(log)}
                              className="rounded p-1 text-ink-400 hover:bg-surface-2 hover:text-ink-900 transition-colors"
                              title="Edit record"
                            >
                              <Edit2 className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(log.id)}
                              className="rounded p-1 text-ink-400 hover:bg-danger/8 hover:text-danger transition-colors"
                              title="Delete record"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Slide-over Form Drawer */}
      <MaintenanceDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={fetchLogs}
        maintenance={selectedLog}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete Record"
        description="Are you sure you want to delete this maintenance record? This action is permanent and cannot be undone."
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
}
