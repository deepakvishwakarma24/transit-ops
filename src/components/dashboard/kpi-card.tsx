import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/chart/animated-number";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { BadgeStatus } from "@/components/dashboard/status-badge";

interface KpiCardProps {
  label: string;
  value: number;
  formatKind?: "default" | "integer" | "fixed1" | "compactK";
  prefix?: string;
  suffix?: string;
  unit?: string;
  delta?: { value: number; direction: "up" | "down"; goodDirection?: "up" | "down" };
  hint?: string;
  status?: BadgeStatus;
  spark?: number[];
}

export function KpiCard({
  label,
  value,
  formatKind = "default",
  prefix,
  suffix,
  unit,
  delta,
  hint,
  status = "neutral",
  spark,
}: KpiCardProps) {
  const isUp = delta?.direction === "up";
  const positive =
    delta &&
    ((delta.goodDirection === "up" && isUp) ||
      (delta.goodDirection === "down" && !isUp));

  return (
    <div
      className={cn(
        "group relative flex h-full flex-col gap-3 rounded-md border border-border bg-surface-1 p-5",
        "transition-colors duration-200 ease-out-quart",
        "hover:bg-surface-2/60"
      )}
    >
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-500">
          {label}
    </p>
        {status !== "neutral" ? (
          <StatusBadge status={status} label={status === "success" ? "Healthy" : status === "warning" ? "Watch" : status === "danger" ? "Action" : "Note"} withDot />
        ) : null}
  </div>

      <div className="flex items-baseline gap-2">
        <span
          className="font-mono text-[clamp(1.625rem,1.4vw+0.6rem,2.125rem)] font-medium leading-none tracking-[-0.02em] text-ink-900"
          style={{ fontFeatureSettings: "'tnum' 1, 'cv11' 1" }}
        >
          <AnimatedNumber
            value={value}
            formatKind={formatKind}
            prefix={prefix}
            suffix={suffix}
          />
      </span>
        {unit ? (
          <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-ink-500">
            {unit}
       </span>
        ) : null}
  </div>

      <div className="flex items-center justify-between gap-3">
        {delta ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 font-mono text-[11.5px] tabular-nums",
              positive ? "text-success" : "text-danger"
            )}
          >
            {isUp ? (
              <ArrowUpRight className="size-3" aria-hidden="true" />
            ) : (
              <ArrowDownRight className="size-3" aria-hidden="true" />
            )}
            {Math.abs(delta.value).toFixed(1)}%
            <span className="text-ink-500">vs last week</span>
      </span>
        ) : (
          <span />
        )}
        {hint ? (
          <span className="truncate font-mono text-[11px] uppercase tracking-[0.12em] text-ink-500">
            {hint}
      </span>
        ) : null}
  </div>

      {spark && spark.length > 1 ? (
        <Sparkline data={spark} emphasis={positive} />
      ) : null}
</div>
  );
}

function Sparkline({
  data,
  emphasis,
}: {
  data: number[];
  emphasis?: boolean;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;
  const h = 28;
  const step = w / (data.length - 1);
  const points = data.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / range) * h;
    return [x, y] as const;
  });
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(2)},${p[1].toFixed(2)}`)
    .join(" ");
  const fill = `${path} L${w},${h} L0,${h} Z`;
  const stroke = emphasis ? "var(--color-success)" : "var(--color-amber-500)";
  return (
    <svg
      viewBox={`0 -4 ${w} ${h + 8}`}
      preserveAspectRatio="none"
      className="mt-1 h-9 w-full"
      aria-hidden="true"
    >
      <path d={fill} className="fill-current opacity-10" style={{ color: stroke }} />
      <path
        d={path}
        className="fill-none"
        style={{ color: stroke }}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
  </svg>
  );
}
