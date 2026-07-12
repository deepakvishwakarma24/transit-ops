"use client";

import { motion } from "motion/react";
import { Clock, Route } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/dashboard/status-badge";

import { formatRelative } from "@/lib/data/depot-snapshot";

interface ActivityItem {
  id: string;
  tripNumber: string;
  event: string;
  occurredAt: string;
  vehicleRegistration: string;
  driverName: string;
  routeSummary: string;
}

interface DashboardActivityProps {
  items: ActivityItem[];
  presentation: Record<string, { label: string; status: "success" | "warning" | "danger" | "info" | "neutral" }>;
  title: string;
  subtitle?: string;
}

const RHS_DOT = String.fromCharCode(183);
const RHS_ELLIPSIS = String.fromCharCode(183) + String.fromCharCode(183) + String.fromCharCode(183);

export function DashboardActivity(props: DashboardActivityProps) {
  const { items, presentation, title, subtitle } = props;

  const renderedEllipsis = (
    <span className="text-ink-900 inline-block text-[14px] leading-none">
      {RHS_ELLIPSIS}
  </span>
  );

  const renderedDot = (
    <span className="text-ink-300 inline-block text-[14px] leading-none">
      {RHS_DOT}
  </span>
  );

  return (
    <div className="flex flex-col gap-4 rounded-md border border-border bg-surface-1 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-500">Realtime</p>
          <h2 className="text-[18px] font-semibold tracking-[-0.015em] text-ink-900">
            {title}
        </h2>
          {subtitle ? (
            <p className="mt-1 max-w-prose text-[13px] leading-[1.55] text-ink-500">
              {subtitle}
          </p>
          ) : null}
      </div>
        <div className="flex items-center gap-2 text-[12px] text-ink-500">
          <Clock className="size-4" aria-hidden="true" />
          <span className="font-mono uppercase tracking-[0.12em]">Last 48h</span>
      </div>
    </div>

      <motion.ol
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.05 } },
        }}
        className="flex flex-col"
      >
        {items.map((item) => {
          const pres = presentation[item.event] ?? { label: item.event, status: "neutral" as const };
          return (
            <motion.li
              key={item.id}
              variants={{
                hidden: { opacity: 0, y: 6 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              className={cn(
                "group grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-border py-3.5 last:border-b-0 transition-colors duration-200 ease-out-quart hover:bg-surface-2/60"
              )}
            >
              <div className="flex flex-col items-start gap-1">
                <StatusBadge status={pres.status} label={pres.label} />
                <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-400">
                  {item.tripNumber}
             </span>
            </div>

              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[13.5px] font-medium text-ink-900">
                  <Route className="size-3.5 shrink-0 text-ink-500" aria-hidden="true" />
                  <span className="truncate">
                    {item.routeSummary}
                </span>
              </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-500">
                  <span>
                    {item.vehicleRegistration}
                </span>
                  <span className="text-ink-300">
                    {renderedDot}
               </span>
                  <span>
                    {item.driverName}
               </span>
                  <span className="text-ink-300">
                    {renderedDot}
               </span>
                  <span>
                    {formatRelative(item.occurredAt)}
                </span>
              </p>
            </div>

              <div className="font-mono text-[11.5px] uppercase tracking-[0.14em] text-ink-400">
                {renderedEllipsis}
            </div>
          </motion.li>
          );
        })}
    </motion.ol>
  </div>
  );
}
