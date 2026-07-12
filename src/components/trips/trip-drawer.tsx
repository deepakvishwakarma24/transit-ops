"use client";

import * as React from "react";
import { Drawer } from "@/components/ui/drawer";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { TripStatus } from "@prisma/client";

interface TripDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function TripDrawer({ isOpen, onClose, onSave }: TripDrawerProps) {
  const [formData, setFormData] = React.useState<{
    tripNumber: string;
    source: string;
    destination: string;
    cargoWeightKg: string;
    plannedDistanceKm: string;
    startOdometer: string;
    vehicleId: string;
    driverId: string;
    status: TripStatus;
  }>({
    tripNumber: "",
    source: "",
    destination: "",
    cargoWeightKg: "",
    plannedDistanceKm: "",
    startOdometer: "",
    vehicleId: "",
    driverId: "",
    status: TripStatus.DRAFT,
  });

  const [vehicles, setVehicles] = React.useState<any[]>([]);
  const [drivers, setDrivers] = React.useState<any[]>([]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);

  // Generate a random trip number
  const generateTripNumber = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `TR-26-${num}`;
  };

  React.useEffect(() => {
    const fetchAssets = async () => {
      try {
        const [vehiclesList, driversList] = await Promise.all([
          api.vehicles.list(),
          api.drivers.list(),
        ]);
        // Filter for AVAILABLE vehicles and drivers in UI selector
        setVehicles(vehiclesList.filter((v: any) => v.status === "AVAILABLE"));
        
        // Filter for AVAILABLE drivers with non-expired licenses
        const now = Date.now();
        setDrivers(
          driversList.filter(
            (d: any) => d.status === "AVAILABLE" && new Date(d.licenseExpiry).getTime() > now
          )
        );
      } catch (err) {
        console.error("Failed to fetch vehicles or drivers for trip drawer", err);
      }
    };

    if (isOpen) {
      fetchAssets();
      setFormData({
        tripNumber: generateTripNumber(),
        source: "",
        destination: "",
        cargoWeightKg: "",
        plannedDistanceKm: "",
        startOdometer: "",
        vehicleId: "",
        driverId: "",
        status: TripStatus.DRAFT,
      });
      setErrors({});
    }
  }, [isOpen]);

  // Set startOdometer when vehicle is selected
  React.useEffect(() => {
    if (formData.vehicleId) {
      const selectedVehicle = vehicles.find((v) => v.id === formData.vehicleId);
      if (selectedVehicle) {
        setFormData((prev) => ({
          ...prev,
          startOdometer: selectedVehicle.odometer?.toString() || "0",
        }));
      }
    }
  }, [formData.vehicleId, vehicles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await api.trips.create(formData);
      onSave();
      onClose();
    } catch (err: any) {
      if (err.message && typeof err.message === "object") {
        setErrors(err.message);
      } else if (err.message) {
        setErrors({ _form: err.message });
      } else {
        setErrors({ _form: "Failed to create trip" });
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
    <Drawer isOpen={isOpen} onClose={onClose} title="Create Dispatch Trip">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {errors._form && (
          <div className="rounded-md border border-danger/30 bg-danger/8 p-3 text-[12.5px] text-danger">
            {errors._form}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Trip Number</label>
            <input
              type="text"
              required
              className={inputClass("tripNumber")}
              value={formData.tripNumber}
              onChange={(e) => setFormData({ ...formData, tripNumber: e.target.value })}
              placeholder="e.g. TR-26-4321"
            />
            {errors.tripNumber && <p className="mt-1 text-[11px] text-danger">{errors.tripNumber}</p>}
          </div>

          <div>
            <label className={labelClass}>Status</label>
            <select
              className={inputClass("status")}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as TripStatus })}
            >
              <option value="DRAFT">Draft</option>
              <option value="DISPATCHED">Dispatched (Active)</option>
            </select>
            {errors.status && <p className="mt-1 text-[11px] text-danger">{errors.status}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Vehicle</label>
            <select
              required
              className={inputClass("vehicleId")}
              value={formData.vehicleId}
              onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
            >
              <option value="">Select vehicle...</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.registrationNo} ({v.model}) · Cap: {v.maxLoadKg} kg
                </option>
              ))}
            </select>
            {errors.vehicleId && <p className="mt-1 text-[11px] text-danger">{errors.vehicleId}</p>}
          </div>

          <div>
            <label className={labelClass}>Driver</label>
            <select
              required
              className={inputClass("driverId")}
              value={formData.driverId}
              onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
            >
              <option value="">Select driver...</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} · Score: {d.safetyScore}
                </option>
              ))}
            </select>
            {errors.driverId && <p className="mt-1 text-[11px] text-danger">{errors.driverId}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Source Depot</label>
            <input
              type="text"
              required
              className={inputClass("source")}
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              placeholder="e.g. Andheri Depot"
            />
            {errors.source && <p className="mt-1 text-[11px] text-danger">{errors.source}</p>}
          </div>

          <div>
            <label className={labelClass}>Destination</label>
            <input
              type="text"
              required
              className={inputClass("destination")}
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              placeholder="e.g. Pune City Center"
            />
            {errors.destination && <p className="mt-1 text-[11px] text-danger">{errors.destination}</p>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Cargo Weight (kg)</label>
            <input
              type="number"
              required
              min="1"
              className={inputClass("cargoWeightKg")}
              value={formData.cargoWeightKg}
              onChange={(e) => setFormData({ ...formData, cargoWeightKg: e.target.value })}
              placeholder="e.g. 800"
            />
            {errors.cargoWeightKg && <p className="mt-1 text-[11px] text-danger">{errors.cargoWeightKg}</p>}
          </div>

          <div>
            <label className={labelClass}>Planned Distance (km)</label>
            <input
              type="number"
              required
              min="1"
              className={inputClass("plannedDistanceKm")}
              value={formData.plannedDistanceKm}
              onChange={(e) => setFormData({ ...formData, plannedDistanceKm: e.target.value })}
              placeholder="e.g. 140"
            />
            {errors.plannedDistanceKm && <p className="mt-1 text-[11px] text-danger">{errors.plannedDistanceKm}</p>}
          </div>

          <div>
            <label className={labelClass}>Start Odometer</label>
            <input
              type="number"
              required
              disabled
              className={cn(inputClass("startOdometer"), "bg-surface-2 cursor-not-allowed")}
              value={formData.startOdometer}
              onChange={(e) => setFormData({ ...formData, startOdometer: e.target.value })}
            />
            {errors.startOdometer && <p className="mt-1 text-[11px] text-danger">{errors.startOdometer}</p>}
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
            {loading ? "Creating..." : "Create Trip"}
          </button>
        </div>
      </form>
    </Drawer>
  );
}
