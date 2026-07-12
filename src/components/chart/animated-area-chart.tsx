"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";
import { cn } from "@/lib/utils";

export interface AreaSeries {
  label: string;
  values: number[];
  color?: string;
}

interface AnimatedAreaChartProps {
  series: AreaSeries[];
  height?: number;
  yFormatKind?: "raw" | "integer" | "thousands";
  xLabels: string[];
  className?: string;
  showLegend?: boolean;
}

const PAD_X = 12;
const PAD_TOP = 12;
const PAD_BOTTOM = 28;

export function AnimatedAreaChart({
  series,
  xLabels,
  height = 260,
  yFormatKind = "raw",
  className,
  showLegend = true,
}: AnimatedAreaChartProps) {
  const reduceMotion = useReducedMotion();
  const id = useId();
  const w = 600;
  const inner = height - PAD_TOP - PAD_BOTTOM;
  const innerW = w - PAD_X * 2;
  const all = series.flatMap((s) => s.values);
  const max = Math.max(...all, 1) * 1.1;

  const buildPath = (vals: number[]) => {
    if (vals.length === 0) {
      return "";
    }
    const step = innerW / (vals.length - 1 || 1);
    return vals
      .map((v, i) => {
        const x = PAD_X + i * step;
        const y = PAD_TOP + inner - ((v / max) * inner);
        return (i === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1);
      })
      .join(" ");
  };

  const buildArea = (vals: number[]) => {
    const line = buildPath(vals);
    if (!line) {
      return "";
    }
    const last = vals.length - 1;
    const step = innerW / (last || 1);
    const lastX = PAD_X + last * step;
    return line + " L" + lastX + "," + (PAD_TOP + inner) + " L" + PAD_X + "," + (PAD_TOP + inner) + " Z";
  };

  return (
    <div className={cn("flex flex-col gap-3 overflow-hidden", className)}>
      <div className="relative w-full overflow-hidden" style={{ height }}>
        <svg
          viewBox={"0 0 " + w + " " + height}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          role="img"
        >
          {Array.from({ length: 5 }).map((_, i) => {
            const y = PAD_TOP + (inner / 4) * i;
            return (
              <g key={"area-grid-" + id + "-" + i}>
                <line
                  x1={PAD_X}
                  y1={y}
                  x2={w - PAD_X}
                  y2={y}
                  className="stroke-ink-100 dark:stroke-ink-300"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
                <text
                  x={-2}
                  y={y + 3}
                  textAnchor="start"
                  className="fill-ink-500 font-mono text-[11px]"
                >{formatAxisValue(max - (max / 4) * i, yFormatKind)}</text>
             </g>
            );
          })}

          {series.map((s) => {
            const path = buildPath(s.values);
            const fill = buildArea(s.values);
            const color = s.color ?? "var(--color-amber-500)";
            return (
              <g key={id + "-area-" + s.label}>
                <motion.path
                  d={fill}
                  fill={color}
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
                  animate={{ opacity: 0.12 }}
                  transition={{
                    duration: 0.6,
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0.2,
                  }}
                />
                <motion.path
                  d={path}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  initial={
                    reduceMotion
                      ? { pathLength: 1, opacity: 1 }
                      : { pathLength: 0, opacity: 0.7 }
                  }
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    pathLength: {
                      duration: 0.9,
                      ease: [0.16, 1, 0.3, 1],
                    },
                    opacity: { duration: 0.4 },
                  }}
                />
             </g>
            );
          })}

          {xLabels.map((label, i) => {
            const step = innerW / (xLabels.length - 1 || 1);
            const x = PAD_X + i * step;
            return (
                <text
                  key={"xl-" + id + "-" + i}
                  x={x}
                  y={height - 8}
                  textAnchor="middle"
                  className="fill-ink-500 font-mono text-[11px]"
                >
                  {label}
               </text>
            );
          })}
       </svg>
     </div>

      {showLegend ? (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {series.map((s, i) => {
            const swatchBg = s.color ?? "var(--color-amber-500)";
            return (
              <div
                key={"legend-area-" + i + "-" + s.label}
                className="flex items-center gap-2 text-[12px] text-ink-700"
              >
                <span
                  className="inline-block size-2 rounded-full"
                  style={{ background: swatchBg }}
                />
                <span className="font-medium">
                  {s.label}
               </span>
             </div>
            );
          })}
       </div>
      ) : null}
   </div>
  );
}

function formatAxisValue(value: number, kind: "raw" | "integer" | "thousands") {
  switch (kind) {
    case "integer":
      return Math.round(value).toLocaleString("en-IN");
    case "thousands":
      return `${Math.round(value / 1000)}k`;
    case "raw":
    default:
      return Math.round(value).toString();
  }
}
