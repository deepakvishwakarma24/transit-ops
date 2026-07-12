"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";
import { cn } from "@/lib/utils";

export interface BarSeries {
  label: string;
  values: number[];
  color?: string;
}

interface AnimatedBarChartProps {
  series: BarSeries[];
  categories: string[];
  yFormatKind?: "raw" | "integer" | "thousands";
  height?: number;
  className?: string;
  showLegend?: boolean;
}

export function AnimatedBarChart({
  series,
  categories,
  yFormatKind = "raw",
  height = 240,
  className,
  showLegend = true,
}: AnimatedBarChartProps) {
  const reduceMotion = useReducedMotion();
  const all = series.flatMap((s) => s.values);
  const max = Math.max(...all, 1) * 1.05;
  const id = useId();
  const groupCount = categories.length;
  const totalSeries = series.length;
  const plotLeft = 34;
  const plotRight = 14;
  const plotTop = 10;
  const plotBottom = 30;
  const barGap = 10;
  const w = Math.max(720, groupCount * 104);
  const plotWidth = w - plotLeft - plotRight;
  const groupWidth = plotWidth / groupCount;
  const barWidth = Math.min(
    24,
    Math.max(14, (groupWidth - barGap * (totalSeries - 1) - 12) / totalSeries)
  );
  const barAreaWidth = totalSeries * barWidth + (totalSeries - 1) * barGap;

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex w-full flex-col gap-2.5 overflow-hidden", className)}>
      <div className="relative w-full overflow-hidden" style={{ height }}>
        <svg
          viewBox={"0 0 " + w + " " + height}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          role="img"
        >
          {Array.from({ length: 5 }).map((_, i) => {
            const y = plotTop + ((height - plotTop - plotBottom) / 4) * i;
            return (
              <line
                key={"grid-" + id + "-" + i}
                x1={plotLeft}
                y1={y}
                x2={w - plotRight}
                y2={y}
                stroke="currentColor"
                className="text-ink-100 dark:text-ink-300"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
          <text
            x={plotLeft}
            y={plotTop - 2}
            textAnchor="start"
            className="fill-ink-500 font-mono text-[11px]"
          >{formatAxisValue(max, yFormatKind)}</text>
          <text
            x={plotLeft}
            y={height - 2}
            textAnchor="start"
            className="fill-ink-500 font-mono text-[11px]"
          >{formatAxisValue(0, yFormatKind)}</text>

          {categories.map((cat, gIdx) => {
            const groupX = plotLeft + gIdx * groupWidth + (groupWidth - barAreaWidth) / 2;
            const baseline = height - plotBottom;
            return (
              <g key={id + "-bar-" + cat} transform={"translate(" + groupX + ",0)"}>
                {series.map((s, sIdx) => {
                  const v = s.values[gIdx];
                  const h = (v / max) * (height - plotTop - plotBottom);
                  const x = sIdx * (barWidth + barGap);
                  const y = baseline - h;
                  const colorVar = s.color ?? "var(--color-amber-500)";
                  return (
                    <motion.rect
                      key={cat + "-bar-" + s.label}
                      x={x}
                      width={barWidth}
                      y={reduceMotion ? y : baseline}
                      height={reduceMotion ? h : 0}
                      rx={3}
                      fill={colorVar}
                      initial={
                        reduceMotion
                          ? false
                          : { height: 0, y: baseline, opacity: 0.6 }
                      }
                      animate={{ height: h, y, opacity: 1 }}
                      transition={{
                        duration: 0.42,
                        delay: gIdx * 0.03 + sIdx * 0.02,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    />
                  );
                })}
                <text
                  x={barAreaWidth / 2}
                  y={height - 10}
                  textAnchor="middle"
                  className="fill-ink-500 font-mono text-[11px] tabular-nums"
                >
                  {cat}
            </text>
             </g>
            );
          })}
       </svg>
     </div>

      {showLegend ? (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
          {series.map((s, i) => {
            const swatchBg = s.color ?? "var(--color-amber-500)";
            return (
              <div
                key={"legend-bar-" + i + "-" + s.label}
                className="flex items-center gap-2 text-[12px] text-ink-700 dark:text-ink-700"
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
