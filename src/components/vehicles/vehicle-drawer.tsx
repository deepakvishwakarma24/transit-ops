"use client";

import * as React from "react";
import { Drawer } from "@/components/ui/drawer";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface VehicleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  vehicle?: any; // If editing
}

export function VehicleDrawer({ isOpen, onClose, onSave, vehicle }: VehicleDrawerProps) {
  const [formData, setFormData] = React.useState({
    fleetCode: "",
    registrationNo: "",
    manufacturer: "",
    model: "",
    type: "TRUCK",
    maxLoadKg: "",
    odometer: "",
    acquisitionCost: "",
    status: "AVAILABLE",
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (vehicle) {
      setFormData({
        fleetCode: vehicle.fleetCode || "",
        registrationNo: vehicle.registrationNo || "",
        manufacturer: vehicle.manufacturer || "",
        model: vehicle.model || "",
        type: vehicle.type || "TRUCK",
        maxLoadKg: vehicle.maxLoadKg?.toString() || "",
        odometer: vehicle.odometer?.toString() || "",
        acquisitionCost: vehicle.acquisitionCost?.toString() || "",
        status: vehicle.status || "AVAILABLE",
      });
    } else {
      setFormData({
        fleetCode: "",
        registrationNo: "",
        manufacturer: "",
        model: "",
        type: "TRUCK",
        maxLoadKg: "",
        odometer: "",
        acquisitionCost: "",
        status: "AVAILABLE",
      });
    }
    setErrors({});
  }, [vehicle, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      if (vehicle) {
        await api.vehicles.update(vehicle.id, formData);
      } else {
        await api.vehicles.create(formData);
      }
      onSave();
      onClose();
    } catch (err: any) {
      if (err.message && typeof err.message === "object") {
        setErrors(err.message);
      } else if (err.message) {
        setErrors({ _form: err.message });
      } else {
        setErrors({ _form: "Failed to save vehicle" });
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
      title={vehicle ? "Edit Vehicle" : "Add Vehicle"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {errors._form && (
          <div className="rounded-md border border-danger/30 bg-danger/8 p-3 text-[12.5px] text-danger">
            {errors._form}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Fleet Code</label>
            <input
              type="text"
              required
              disabled={!!vehicle} // Fleet code shouldn't be editable
              className={cn(inputClass("fleetCode"), vehicle && "bg-surface-2 cursor-not-allowed")}
              value={formData.fleetCode}
              onChange={(e) => setFormData({ ...formData, fleetCode: e.target.value })}
              placeholder="e.g. FL-001"
            />
            {errors.fleetCode && <p className="mt-1 text-[11px] text-danger">{errors.fleetCode}</p>}
          </div>

          <div>
            <label className={labelClass}>Registration No</label>
            <input
              type="text"
              required
              className={inputClass("registrationNo")}
              value={formData.registrationNo}
              onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
              placeholder="e.g. MH-01-AB-1234"
            />
            {errors.registrationNo && (
              <p className="mt-1 text-[11px] text-danger">{errors.registrationNo}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Manufacturer</label>
            <input
              type="text"
              className={inputClass("manufacturer")}
              value={formData.manufacturer}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              placeholder="e.g. Tata"
            />
          </div>

          <div>
            <label className={labelClass}>Model</label>
            <input
              type="text"
              required
              className={inputClass("model")}
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              placeholder="e.g. Ace Gold"
            />
            {errors.model && <p className="mt-1 text-[11px] text-danger">{errors.model}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Vehicle Type</label>
            <select
              className={inputClass("type")}
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="VAN">Van</option>
              <option value="MINI_TRUCK">Mini Truck</option>
              <option value="TRUCK">Truck</option>
              <option value="BUS">Bus</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Status</label>
            <select
              className={inputClass("status")}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="AVAILABLE">Available</option>
              <option value="ON_TRIP">On Trip</option>
              <option value="IN_SHOP">In Shop</option>
              <option value="RETIRED">Retired</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Max Load (kg)</label>
            <input
              type="number"
              required
              min="1"
              className={inputClass("maxLoadKg")}
              value={formData.maxLoadKg}
              onChange={(e) => setFormData({ ...formData, maxLoadKg: e.target.value })}
              placeholder="750"
            />
            {errors.maxLoadKg && <p className="mt-1 text-[11px] text-danger">{errors.maxLoadKg}</p>}
          </div>

          <div>
            <label className={labelClass}>Odometer (km)</label>
            <input
              type="number"
              required
              min="0"
              className={inputClass("odometer")}
              value={formData.odometer}
              onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
              placeholder="12000"
            />
            {errors.odometer && <p className="mt-1 text-[11px] text-danger">{errors.odometer}</p>}
          </div>

          <div>
            <label className={labelClass}>Acq. Cost (₹)</label>
            <input
              type="number"
              required
              min="0"
              className={inputClass("acquisitionCost")}
              value={formData.acquisitionCost}
              onChange={(e) => setFormData({ ...formData, acquisitionCost: e.target.value })}
              placeholder="740000"
            />
            {errors.acquisitionCost && (
              <p className="mt-1 text-[11px] text-danger">{errors.acquisitionCost}</p>
            )}
          </div>
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
            {loading ? "Saving..." : "Save Vehicle"}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
