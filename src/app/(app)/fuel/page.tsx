"use client";

import { useState, useEffect } from "react";
import { Plus, Fuel, Wrench, Landmark, Activity, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Breadcrumbs } from "@/components/shell/breadcrumbs";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { api } from "@/lib/api-client";
import { ExpenseDrawer } from "@/components/expenses/expense-drawer";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { ExpenseCategory } from "@prisma/client";
import { cn } from "@/lib/utils";

const categoryConfig: Record<
  ExpenseCategory,
  { label: string; status: "success" | "info" | "warning" | "neutral" | "danger" }
> = {
  FUEL: { label: "Fuel", status: "info" },
  MAINTENANCE: { label: "Maintenance", status: "warning" },
  TOLL: { label: "Toll", status: "success" },
  MISC: { label: "Misc", status: "neutral" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(v: number) {
  return `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 px-4 text-[13px] font-medium transition-colors duration-150 ease-out-quart border-b-2",
        active
          ? "border-amber-500 text-ink-900"
          : "border-transparent text-ink-500 hover:text-ink-900"
      )}
    >
      {children}
    </button>
  );
}

export default function FuelPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"fuel" | "expenses">("fuel");

  // Drawer & Dialog State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchExpenses = async () => {
    try {
      const data = await api.expenses.list();
      setExpenses(data);
    } catch (err) {
      console.error("Failed to load expenses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.expenses.delete(deleteConfirmId);
      fetchExpenses();
    } catch (err) {
      console.error("Failed to delete expense", err);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const fuelLogs = expenses.filter((e) => e.category === "FUEL");

  const totalFuelCost = fuelLogs.reduce((s, e) => s + e.amount, 0);
  const totalMaintenance = expenses
    .filter((e) => e.category === "MAINTENANCE")
    .reduce((s, e) => s + e.amount, 0);
  const totalTollMisc = expenses
    .filter((e) => e.category === "TOLL" || e.category === "MISC")
    .reduce((s, e) => s + e.amount, 0);

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Breadcrumbs items={[{ label: "Manage" }, { label: "Fuel & Expenses" }]} />
        <PageHeader
          title="Fuel & Expenses"
          description={`${fuelLogs.length} fuel logs · ${expenses.length} expense records`}
        >
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-amber-500 px-3.5 text-[13px] font-medium text-white transition-colors duration-200 ease-out-quart hover:bg-amber-600 dark:hover:bg-amber-400"
          >
            <Plus className="size-4" aria-hidden="true" />
            Log entry
          </button>
        </PageHeader>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Fuel cost", value: formatCurrency(totalFuelCost), color: "text-info" },
          { label: "Maintenance", value: formatCurrency(totalMaintenance), color: "text-warning" },
          { label: "Toll + Misc", value: formatCurrency(totalTollMisc), color: "text-ink-700" },
          {
            label: "Total",
            value: formatCurrency(totalFuelCost + totalMaintenance + totalTollMisc),
            color: "text-ink-900",
          },
        ].map((chip) => (
          <div
            key={chip.label}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface-1 px-3 py-1.5"
          >
            <span className={cn("font-mono text-[13px] font-medium tabular-nums", chip.color)}>
              {chip.value}
            </span>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-500">
              {chip.label}
            </span>
          </div>
        ))}
      </div>

      {/* Tabs + table */}
      <div className="rounded-md border border-border bg-surface-1">
        <div className="flex border-b border-border px-2">
          <Tab active={tab === "fuel"} onClick={() => setTab("fuel")}>
            Fuel Logs
          </Tab>
          <Tab active={tab === "expenses"} onClick={() => setTab("expenses")}>
            Expense Ledger
          </Tab>
        </div>

        {loading ? (
          <div className="text-center py-16 text-[13px] text-ink-500">
            Loading ledger...
          </div>
        ) : (
          <>
            {tab === "fuel" && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b border-border">
                      {["Vehicle", "Date", "Cost", "Description", "Actions"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-2.5 text-left font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-500 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fuelLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-ink-400">
                          No fuel entries logged.
                        </td>
                      </tr>
                    )}
                    {fuelLogs.map((f) => (
                      <tr
                        key={f.id}
                        className="border-b border-border last:border-b-0 transition-colors duration-150 hover:bg-surface-2/60"
                      >
                        <td className="px-4 py-3.5">
                          <p className="font-mono text-[12px] tabular-nums font-medium text-ink-900">
                            {f.vehicle?.registrationNo || "Vehicle"}
                          </p>
                          <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-500">
                            {f.vehicle?.model || "Model"}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-[12px] tabular-nums text-ink-700 whitespace-nowrap">
                          {formatDate(f.recordedAt)}
                        </td>
                        <td className="px-4 py-3.5 font-mono tabular-nums text-[13px] font-medium text-ink-900">
                          {formatCurrency(f.amount)}
                        </td>
                        <td className="px-4 py-3.5 text-ink-600">
                          {f.description || "—"}
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(f.id)}
                            className="rounded p-1 text-ink-400 hover:bg-danger/8 hover:text-danger transition-colors"
                            title="Delete log"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "expenses" && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b border-border">
                      {["Category", "Vehicle", "Description", "Amount", "Date", "Actions"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-2.5 text-left font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-500 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-ink-400">
                          No expenses logged.
                        </td>
                      </tr>
                    )}
                    {expenses.map((e) => {
                      const cfg = categoryConfig[e.category as ExpenseCategory] || { label: e.category, status: "neutral" };
                      return (
                        <tr
                          key={e.id}
                          className="border-b border-border last:border-b-0 transition-colors duration-150 hover:bg-surface-2/60"
                        >
                          <td className="px-4 py-3.5">
                            <StatusBadge status={cfg.status} label={cfg.label} />
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="font-mono text-[12px] tabular-nums font-medium text-ink-900">
                              {e.vehicle?.registrationNo || "Vehicle"}
                            </p>
                            <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-500">
                              {e.vehicle?.model || "Model"}
                            </p>
                          </td>
                          <td className="px-4 py-3.5 max-w-[240px]">
                            <span className="text-[12.5px] text-ink-700">{e.description ?? "—"}</span>
                          </td>
                          <td className="px-4 py-3.5 font-mono tabular-nums text-[13px] font-medium text-ink-900">
                            {formatCurrency(e.amount)}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-[12px] tabular-nums text-ink-700 whitespace-nowrap">
                            {formatDate(e.recordedAt)}
                          </td>
                          <td className="px-4 py-3.5">
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(e.id)}
                              className="rounded p-1 text-ink-400 hover:bg-danger/8 hover:text-danger transition-colors"
                              title="Delete log"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        <div className="border-t border-border px-4 py-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-500">
            {tab === "fuel"
              ? `${fuelLogs.length} fuel entries`
              : `${expenses.length} expense records`}
          </p>
        </div>
      </div>

      {/* Slide-over Form Drawer */}
      <ExpenseDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={fetchExpenses}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete Log"
        description="Are you sure you want to delete this expense record? This action is permanent and cannot be undone."
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
}
