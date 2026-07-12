"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = false,
}: ConfirmDialogProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Dialog Body */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative z-10 w-full max-w-[400px] overflow-hidden rounded-md border border-border bg-surface-1 p-6 shadow-xl"
          >
            <div className="flex gap-4">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-md",
                  isDestructive ? "bg-danger/8 text-danger" : "bg-warning/8 text-warning"
                )}
              >
                <AlertTriangle className="size-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-[15px] font-semibold text-ink-900">{title}</h3>
                <p className="mt-2 text-[13px] leading-[1.5] text-ink-500">{description}</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="h-9 rounded-md border border-border px-4 text-[13px] font-medium text-ink-700 hover:bg-surface-2 transition-colors duration-150"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={cn(
                  "h-9 rounded-md px-4 text-[13px] font-medium text-white transition-colors duration-150",
                  isDestructive
                    ? "bg-danger hover:bg-danger/90"
                    : "bg-amber-500 hover:bg-amber-600"
                )}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
