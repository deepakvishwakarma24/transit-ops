"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";
import { cn } from "@/lib/utils";

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface AnimatedDonutChartProps {
  slices: DonutSlice[];
  size?: number;
  thickness?: number;
  formatKind?: "raw" | "integer" | "thousands";
  prefix?: string;
  suffix?: string;
  total?: number;
  label?: string;
  className?: string;
}

export function AnimatedDonutChart({
  slices,
  size = 180,
  thickness = 18,
  formatKind = "raw",
  prefix = "",
  suffix = "",
  total,
  label,
  className,
}: AnimatedDonutChartProps) {
  const reduceMotion = useReducedMotion();
  const id = useId();
  const summed = slices.reduce((a, b) => a + b.value, 0);
  const totalVal = total ?? summed;
  const radius = (size - thickness) / 2;
  const circ = 2 * Math.PI * radius;

  const arcs = slices.reduce<Array<DonutSlice & { dash: string; offset: number }>>((accList, slice) => {
    const previousTotal = accList.reduce((a, b) => a + b.value, 0);
    const fraction = totalVal === 0 ? 0 : slice.value / totalVal;
    const dash = `${(fraction * circ).toFixed(2)} ${circ.toFixed(2)}`;
    const offset = -((previousTotal / totalVal) * circ);
    accList.push({ ...slice, dash, offset });
    return accList;
  }, []);

  return (
    <div
      className={cn("relative inline-flex flex-col items-center gap-3", className)}
      style={{ width: size }}
      aria-label={label ?? "Distribution"}
      role="img"
    >
      <svg
        width={size}
        height={size}
        viewBox={"0 0 " + size + " " + size}
        className="overflow-visible"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-ink-100 dark:stroke-ink-200"
          strokeWidth={thickness}
        />
        {arcs.map((slice, i) => (
          <motion.circle
            key={id + "-arc-" + i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={slice.color}
            strokeWidth={thickness}
            strokeDasharray={reduceMotion ? slice.dash : "0 " + circ}
            strokeDashoffset={slice.offset}
            strokeLinecap="butt"
            transform={"rotate(-90 " + size / 2 + " " + size / 2 + ")"}
            initial={reduceMotion ? false : { strokeDasharray: "0 " + circ }}
            animate={{ strokeDasharray: slice.dash }}
            transition={{
              duration: 0.7,
              delay: i * 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        ))}
    </svg>
      <div className="pointer-events-none absolute inset-x-0 top-[40%] flex flex-col items-center">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-500">
          {label ?? "Total"}
    </span>
        <span
          className="mt-0.5 font-mono text-[1.5rem] font-medium leading-none tracking-[-0.02em] text-ink-900 font-features-['tnum'_1,'cv11'_1]"
        >
          {prefix}
          {formatAxisValue(totalVal, formatKind)}
          {suffix}
    </span>
 </div>
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
