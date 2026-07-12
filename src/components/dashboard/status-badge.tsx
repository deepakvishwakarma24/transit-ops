import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type BadgeStatus =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "accent";

interface StatusBadgeProps {
  status: BadgeStatus;
  label: string;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  className?: string;
  withDot?: boolean;
}

const styles: Record<BadgeStatus, string> = {
  success:
    "bg-success/10 text-success ring-1 ring-inset ring-success/25 dark:bg-success/15 dark:ring-success/30",
  warning:
    "bg-warning/10 text-warning ring-1 ring-inset ring-warning/30 dark:bg-warning/15 dark:ring-warning/35",
  danger:
    "bg-danger/10 text-danger ring-1 ring-inset ring-danger/25 dark:bg-danger/15 dark:ring-danger/30",
  info: "bg-info/10 text-info ring-1 ring-inset ring-info/25 dark:bg-info/15 dark:ring-info/30",
  neutral:
    "bg-ink-100 text-ink-700 ring-1 ring-inset ring-ink-200 dark:bg-ink-200 dark:text-ink-800 dark:ring-ink-300",
  accent:
    "bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-200/15 dark:text-amber-300 dark:ring-amber-200/40",
};

const dotStyles: Record<BadgeStatus, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  neutral: "bg-ink-500",
  accent: "bg-amber-500",
};

export function StatusBadge({
  status,
  label,
  icon: Icon,
  className,
  withDot = true,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1.5 rounded-sm px-2 font-mono uppercase tracking-[0.12em] text-[10.5px] font-medium",
        styles[status],
        className
      )}
    >
      {withDot ? (
        <span
          aria-hidden="true"
          className={cn(
            "inline-block size-1.5 rounded-full",
            dotStyles[status]
          )}
        />
      ) : null}
      {Icon ? <Icon className="size-3" aria-hidden="true" /> : null}
      <span className="inline-flex truncate tabular-nums">{label || "empty"}</span>
  </span>
  );
}
