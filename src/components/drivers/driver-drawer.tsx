"use client";

import * as React from "react";
import { Drawer } from "@/components/ui/drawer";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface DriverDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  driver?: any; // If editing
}

export function DriverDrawer({ isOpen, onClose, onSave, driver }: DriverDrawerProps) {
  const [formData, setFormData] = React.useState({
    name: "",
    licenseNumber: "",
    licenseCategory: "",
    licenseExpiry: "",
    contactNumber: "",
    safetyScore: "100",
    status: "AVAILABLE",
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (driver) {
      setFormData({
        name: driver.name || "",
        licenseNumber: driver.licenseNumber || "",
        licenseCategory: driver.licenseCategory || "",
        licenseExpiry: driver.licenseExpiry ? new Date(driver.licenseExpiry).toISOString().slice(0, 10) : "",
        contactNumber: driver.contactNumber || "",
        safetyScore: driver.safetyScore?.toString() || "100",
        status: driver.status || "AVAILABLE",
      });
    } else {
      setFormData({
        name: "",
        licenseNumber: "",
        licenseCategory: "",
        licenseExpiry: "",
        contactNumber: "",
        safetyScore: "100",
        status: "AVAILABLE",
      });
    }
    setErrors({});
  }, [driver, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      if (driver) {
        await api.drivers.update(driver.id, formData);
      } else {
        await api.drivers.create(formData);
      }
      onSave();
      onClose();
    } catch (err: any) {
      if (err.message && typeof err.message === "object") {
        setErrors(err.message);
      } else if (err.message) {
        setErrors({ _form: err.message });
      } else {
        setErrors({ _form: "Failed to save driver" });
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
      title={driver ? "Edit Driver" : "Add Driver"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {errors._form && (
          <div className="rounded-md border border-danger/30 bg-danger/8 p-3 text-[12.5px] text-danger">
            {errors._form}
          </div>
        )}

        <div>
          <label className={labelClass}>Full Name</label>
          <input
            type="text"
            required
            className={inputClass("name")}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Rajesh Kumar"
          />
          {errors.name && <p className="mt-1 text-[11px] text-danger">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>License No</label>
            <input
              type="text"
              required
              className={inputClass("licenseNumber")}
              value={formData.licenseNumber}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              placeholder="e.g. DL-123456789"
            />
            {errors.licenseNumber && (
              <p className="mt-1 text-[11px] text-danger">{errors.licenseNumber}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>License Category</label>
            <input
              type="text"
              required
              className={inputClass("licenseCategory")}
              value={formData.licenseCategory}
              onChange={(e) => setFormData({ ...formData, licenseCategory: e.target.value })}
              placeholder="e.g. MCWG / LMV"
            />
            {errors.licenseCategory && (
              <p className="mt-1 text-[11px] text-danger">{errors.licenseCategory}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>License Expiry</label>
            <input
              type="date"
              required
              className={inputClass("licenseExpiry")}
              value={formData.licenseExpiry}
              onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
            />
            {errors.licenseExpiry && (
              <p className="mt-1 text-[11px] text-danger">{errors.licenseExpiry}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Contact Number</label>
            <input
              type="text"
              required
              className={inputClass("contactNumber")}
              value={formData.contactNumber}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              placeholder="e.g. +91 98765 43210"
            />
            {errors.contactNumber && (
              <p className="mt-1 text-[11px] text-danger">{errors.contactNumber}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Safety Score</label>
            <input
              type="number"
              required
              min="0"
              max="100"
              className={inputClass("safetyScore")}
              value={formData.safetyScore}
              onChange={(e) => setFormData({ ...formData, safetyScore: e.target.value })}
              placeholder="100"
            />
            {errors.safetyScore && (
              <p className="mt-1 text-[11px] text-danger">{errors.safetyScore}</p>
            )}
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
              <option value="OFF_DUTY">Off Duty</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
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
            {loading ? "Saving..." : "Save Driver"}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
