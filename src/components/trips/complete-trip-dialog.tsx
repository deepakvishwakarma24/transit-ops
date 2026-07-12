"use client";

import * as React from "react";
import { Drawer } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

interface CompleteTripDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { endOdometer: number; fuelConsumedL: number; revenue: number }) => void;
  startOdometer: number;
}

export function CompleteTripDialog({ isOpen, onClose, onConfirm, startOdometer }: CompleteTripDialogProps) {
  const [endOdometer, setEndOdometer] = React.useState("");
  const [fuelConsumedL, setFuelConsumedL] = React.useState("");
  const [revenue, setRevenue] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setEndOdometer("");
      setFuelConsumedL("");
      setRevenue("");
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const endOdoVal = parseInt(endOdometer);
    const fuelVal = parseFloat(fuelConsumedL);
    const revenueVal = parseFloat(revenue);

    if (isNaN(endOdoVal) || endOdoVal < startOdometer) {
      setError(`End odometer must be greater than or equal to start odometer (${startOdometer}).`);
      return;
    }

    if (isNaN(fuelVal) || fuelVal < 0) {
      setError("Fuel consumed cannot be negative.");
      return;
    }

    if (isNaN(revenueVal) || revenueVal < 0) {
      setError("Revenue cannot be negative.");
      return;
    }

    onConfirm({
      endOdometer: endOdoVal,
      fuelConsumedL: fuelVal,
      revenue: revenueVal,
    });
  };

  const inputClass = "mt-1.5 h-9 w-full rounded-md border border-border bg-surface-1 px-3 text-[13px] text-ink-900 placeholder:text-ink-400 outline-none transition-all duration-150 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25";
  const labelClass = "font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-500";

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Complete Trip">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="rounded-md border border-danger/30 bg-danger/8 p-3 text-[12.5px] text-danger">
            {error}
          </div>
        )}

        <div className="text-[13px] text-ink-600">
          Please enter the final trip ledger variables to record the completion and release the assets.
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Start Odometer</label>
            <input
              type="text"
              disabled
              className={cn(inputClass, "bg-surface-2 cursor-not-allowed")}
              value={startOdometer}
            />
          </div>

          <div>
            <label className={labelClass}>End Odometer</label>
            <input
              type="number"
              required
              min={startOdometer}
              className={inputClass}
              value={endOdometer}
              onChange={(e) => setEndOdometer(e.target.value)}
              placeholder="e.g. 84320"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Fuel Consumed (Liters)</label>
            <input
              type="number"
              step="0.1"
              required
              min="0"
              className={inputClass}
              value={fuelConsumedL}
              onChange={(e) => setFuelConsumedL(e.target.value)}
              placeholder="e.g. 24.5"
            />
          </div>

          <div>
            <label className={labelClass}>Revenue (₹)</label>
            <input
              type="number"
              step="0.01"
              required
              min="0"
              className={inputClass}
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
              placeholder="e.g. 12500"
            />
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
            className="h-9 rounded-md bg-success px-5 text-[13px] font-medium text-white hover:bg-success/90 transition-colors duration-150"
          >
            Complete & Close
          </button>
        </div>
      </form>
    </Drawer>
  );
}
