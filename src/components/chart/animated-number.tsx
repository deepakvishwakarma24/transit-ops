"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type NumberFormatKind = "default" | "integer" | "fixed1" | "compactK";

interface AnimatedNumberProps {
  value: number;
  durationMs?: number;
  formatKind?: NumberFormatKind;
  prefix?: string;
  suffix?: string;
  className?: string;
}

const easeOutQuart = [0.25, 1, 0.5, 1] as const;

function animateValue(
  from: number,
  to: number,
  durationMs: number,
  onTick: (next: number) => void,
  onDone: () => void
) {
  const start = performance.now();
  let raf = 0;
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / durationMs);
    const eased = 1 - Math.pow(1 - t, 4);
    onTick(from + (to - from) * eased);
    if (t < 1) {
      raf = requestAnimationFrame(step);
    } else {
      onDone();
    }
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}

export function AnimatedNumber({
  value,
  durationMs = 720,
  formatKind = "default",
  prefix = "",
  suffix = "",
  className,
}: AnimatedNumberProps) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState<number>(() => value);
  const previous = useRef(value);
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (reduceMotion) {
      previous.current = value;
      return;
    }
    if (cancelRef.current) {
      cancelRef.current();
    }
    const from = previous.current;
    cancelRef.current = animateValue(
      from,
      value,
      durationMs,
      (next) => setDisplay(next),
      () => {
        previous.current = value;
      }
    );
    return () => {
      if (cancelRef.current) {
        cancelRef.current();
        cancelRef.current = null;
      }
    };
  }, [value, durationMs, reduceMotion]);

  const renderedDisplay = reduceMotion ? value : display;
  const formattedValue = formatNumber(renderedDisplay, formatKind);

  return (
    <motion.span
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: easeOutQuart }}
    >
      {prefix}
      {formattedValue}
      {suffix}
 </motion.span>
  );
}

function formatNumber(value: number, formatKind: NumberFormatKind) {
  switch (formatKind) {
    case "integer":
      return Math.round(value).toLocaleString("en-IN");
    case "fixed1":
      return value.toFixed(1);
    case "compactK":
      return `${Math.round(value / 1000)}k`;
    case "default":
    default:
      return Math.round(value).toLocaleString();
  }
}
