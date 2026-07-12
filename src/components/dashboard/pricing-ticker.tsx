"use client";

import { motion } from "motion/react";
import {
  Activity,
  CircleGauge,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { AnimatedNumber } from "@/components/chart/animated-number";
import { StatusBadge } from "@/components/dashboard/status-badge";
import type { BadgeStatus } from "@/components/dashboard/status-badge";

const icons: Record<string, LucideIcon> = {
  wallet: Wallet,
  wrench: Wrench,
  activity: Activity,
  gauge: CircleGauge,
};

export type PricingTickerIcon = keyof typeof icons;

interface PricingTickerProps {
  label: string;
  value: number;
  currency?: string;
  status?: BadgeStatus;
  icon?: PricingTickerIcon;
}

export function PricingTicker({
  label,
  value,
  currency = "₹",
  status = "neutral",
  icon,
}: PricingTickerProps) {
  const Icon = icon ? icons[icon] : undefined;
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-1.5 rounded-md border border-border bg-surface-2/60 p-3"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-500">
          {label}
      </span>
        {Icon ? <Icon className="size-3.5 text-ink-400" aria-hidden="true" /> : null}
    </div>
      <div className="flex items-baseline gap-1">
        <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink-500">
          {currency}
  </span>
        <span className="font-mono text-[20px] font-medium leading-none tracking-[-0.02em] text-ink-900 font-features-['tnum'_1,'cv11'_1]">
          <AnimatedNumber value={value} formatKind="compactK" />
       </span>
     </div>
      <StatusBadge status={status} label={statuses[status]} withDot={false} />
   </motion.div>
  );
}

const statuses: Record<BadgeStatus, string> = {
  success: "Within plan",
  warning: "Over plan",
  danger: "Critical",
  info: "In progress",
  neutral: "On target",
  accent: "Tracking",
};
