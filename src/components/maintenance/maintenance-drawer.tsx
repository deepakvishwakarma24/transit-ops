"use client";

import * as React from "react";
import { Drawer } from "@/components/ui/drawer";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface MaintenanceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  maintenance?: any; // If editing
}

export function MaintenanceDrawer({ isOpen, onClose, onSave, maintenance }: MaintenanceDrawerProps) {
  const [formData, setFormData] = React.useState({
    vehicleId: "",
    serviceType: "",
    description: "",
    cost: "",
    startedAt: new Date().toISOString().slice(0, 10),
    completedAt: "",
    status: "ACTIVE",
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
    if (maintenance) {
      setFormData({
        vehicleId: maintenance.vehicleId || "",
        serviceType: maintenance.serviceType || "",
        description: maintenance.description || "",
        cost: maintenance.cost?.toString() || "",
        startedAt: maintenance.startedAt ? new Date(maintenance.startedAt).toISOString().slice(0, 10) : "",
        completedAt: maintenance.completedAt ? new Date(maintenance.completedAt).toISOString().slice(0, 10) : "",
        status: maintenance.status || "ACTIVE",
      });
    } else {
      setFormData({
        vehicleId: "",
        serviceType: "",
        description: "",
        cost: "",
        startedAt: new Date().toISOString().slice(0, 10),
        completedAt: "",
        status: "ACTIVE",
      });
    }
    setErrors({});
  }, [maintenance, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      if (maintenance) {
        await api.maintenance.update(maintenance.id, formData);
      } else {
        await api.maintenance.create(formData);
      }
      onSave();
      onClose();
    } catch (err: any) {
      if (err.message && typeof err.message === "object") {
        setErrors(err.message);
      } else if (err.message) {
        setErrors({ _form: err.message });
      } else {
        setErrors({ _form: "Failed to save maintenance record" });
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
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={maintenance ? "Edit Maintenance Record" : "Log Maintenance"}
    >
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
            disabled={!!maintenance} // Cannot change vehicle after creation
            className={cn(inputClass("vehicleId"), maintenance && "bg-surface-2 cursor-not-allowed")}
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

        <div>
          <label className={labelClass}>Service Type</label>
          <input
            type="text"
            required
            className={inputClass("serviceType")}
            value={formData.serviceType}
            onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
            placeholder="e.g. Engine Oil & Filter Change"
          />
          {errors.serviceType && <p className="mt-1 text-[11px] text-danger">{errors.serviceType}</p>}
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            className={cn(
              "mt-1.5 w-full rounded-md border border-border bg-surface-1 px-3 py-2 text-[13px] text-ink-900 placeholder:text-ink-400 outline-none transition-all duration-150 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25",
              errors.description && "border-danger focus:border-danger focus:ring-2 focus:ring-danger/25"
            )}
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Provide details about the issue and service performed..."
          />
          {errors.description && <p className="mt-1 text-[11px] text-danger">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Cost (₹)</label>
            <input
              type="number"
              required
              min="0"
              className={inputClass("cost")}
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              placeholder="e.g. 4500"
            />
            {errors.cost && <p className="mt-1 text-[11px] text-danger">{errors.cost}</p>}
          </div>

          <div>
            <label className={labelClass}>Status</label>
            <select
              className={inputClass("status")}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="ACTIVE">Active (In Shop)</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Start Date</label>
            <input
              type="date"
              required
              className={inputClass("startedAt")}
              value={formData.startedAt}
              onChange={(e) => setFormData({ ...formData, startedAt: e.target.value })}
            />
            {errors.startedAt && <p className="mt-1 text-[11px] text-danger">{errors.startedAt}</p>}
          </div>

          {formData.status === "COMPLETED" && (
            <div>
              <label className={labelClass}>Completion Date</label>
              <input
                type="date"
                required
                className={inputClass("completedAt")}
                value={formData.completedAt}
                onChange={(e) => setFormData({ ...formData, completedAt: e.target.value })}
              />
              {errors.completedAt && (
                <p className="mt-1 text-[11px] text-danger">{errors.completedAt}</p>
              )}
            </div>
          )}
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
            {loading ? "Saving..." : "Save Record"}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
