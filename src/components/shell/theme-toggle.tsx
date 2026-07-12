"use client";

import { motion } from "motion/react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative inline-flex h-9 w-[72px] items-center rounded-full border border-border bg-surface-1 px-1",
        "transition-colors duration-200 ease-out-quart hover:bg-surface-2",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40",
        className
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.6 }}
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full",
          "bg-ink-900 text-amber-100 dark:bg-amber-500 dark:text-ink-950",
          isDark ? "ml-auto" : "mr-auto"
        )}
      >
        {isDark ? (
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M21 13.5A9.5 9.5 0 0 1 10.5 3a1 1 0 0 0-1.3-1.07A11 11 0 1 0 22.07 14.8 1 1 0 0 0 21 13.5Z" />
         </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="currentColor"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4" />
            <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="2.5" x2="12" y2="5" />
              <line x1="12" y1="19" x2="12" y2="21.5" />
              <line x1="2.5" y1="12" x2="5" y2="12" />
              <line x1="19" y1="12" x2="21.5" y2="12" />
              <line x1="5.4" y1="5.4" x2="7.1" y2="7.1" />
              <line x1="16.9" y1="16.9" x2="18.6" y2="18.6" />
              <line x1="5.4" y1="18.6" x2="7.1" y2="16.9" />
              <line x1="16.9" y1="7.1" x2="18.6" y2="5.4" />
           </g>
         </svg>
        )}
     </motion.span>
  </button>
  );
}
