"use client";

import * as React from "react";
import { Drawer } from "@/components/ui/drawer";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface ExpenseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function ExpenseDrawer({ isOpen, onClose, onSave }: ExpenseDrawerProps) {
  const [formData, setFormData] = React.useState({
    category: "FUEL",
    amount: "",
    description: "",
    recordedAt: new Date().toISOString().slice(0, 10),
    vehicleId: "",
  });
  const [vehicles, setVehicles] = React.useState<any[]>([]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await api.vehicles.list();
        setVehicles(data);
      } catch (err) {
        console.error("Failed to fetch vehicles for selector", err);
      }
    };
    if (isOpen) {
      fetchVehicles();
    }
  }, [isOpen]);

  React.useEffect(() => {
    setFormData({
      category: "FUEL",
      amount: "",
      description: "",
      recordedAt: new Date().toISOString().slice(0, 10),
      vehicleId: "",
    });
    setErrors({});
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await api.expenses.create(formData);
      onSave();
      onClose();
    } catch (err: any) {
      if (err.message && typeof err.message === "object") {
        setErrors(err.message);
      } else if (err.message) {
        setErrors({ _form: err.message });
      } else {
        setErrors({ _form: "Failed to log expense" });
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: string) =>
    cn(
      "mt-1.5 h-9 w-full rounded-md border bg-surface-1 px-3 text-[13px] text-ink-900 placeholder:text-ink-400 outline-none transition-all duration-150",
      errors[field]
        ? "border-danger focus:border-danger focus:ring-2 focus:ring-danger/25"
        : "border-border focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25"
    );

  const labelClass = "font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-500";

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Log Expense">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {errors._form && (
          <div className="rounded-md border border-danger/30 bg-danger/8 p-3 text-[12.5px] text-danger">
            {errors._form}
          </div>
        )}

        <div>
          <label className={labelClass}>Vehicle</label>
          <select
            required
            className={inputClass("vehicleId")}
            value={formData.vehicleId}
            onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
          >
            <option value="">Select a vehicle...</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.registrationNo} ({v.fleetCode}) — {v.model}
              </option>
            ))}
          </select>
          {errors.vehicleId && <p className="mt-1 text-[11px] text-danger">{errors.vehicleId}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Category</label>
            <select
              className={inputClass("category")}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="FUEL">Fuel</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="TOLL">Toll</option>
              <option value="MISC">Misc</option>
            </select>
            {errors.category && <p className="mt-1 text-[11px] text-danger">{errors.category}</p>}
          </div>

          <div>
            <label className={labelClass}>Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              required
              min="0.01"
              className={inputClass("amount")}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="e.g. 1500"
            />
            {errors.amount && <p className="mt-1 text-[11px] text-danger">{errors.amount}</p>}
          </div>
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <input
            type="text"
            className={inputClass("description")}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="e.g. Refill at HP petrol pump"
          />
          {errors.description && <p className="mt-1 text-[11px] text-danger">{errors.description}</p>}
        </div>

        <div>
          <label className={labelClass}>Date</label>
          <input
            type="date"
            required
            className={inputClass("recordedAt")}
            value={formData.recordedAt}
            onChange={(e) => setFormData({ ...formData, recordedAt: e.target.value })}
          />
          {errors.recordedAt && <p className="mt-1 text-[11px] text-danger">{errors.recordedAt}</p>}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-md border border-border px-4 text-[13px] font-medium text-ink-700 hover:bg-surface-2 transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="h-9 rounded-md bg-amber-500 px-5 text-[13px] font-medium text-white hover:bg-amber-600 transition-colors duration-150 disabled:opacity-50"
          >
            {loading ? "Logging..." : "Log Expense"}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
