import type { Transition, Variants } from "motion/react";

export const easeOutQuart: Transition["ease"] = [0.25, 1, 0.5, 1];
export const easeOutQuint: Transition["ease"] = [0.22, 1, 0.36, 1];
export const easeOutExpo: Transition["ease"] = [0.16, 1, 0.3, 1];
export const easeInOut: Transition["ease"] = [0.4, 0, 0.2, 1];

export const duration = {
  fast: 0.14,
  base: 0.22,
  slow: 0.36,
} as const;

export const motionSafeTransition: Transition = {
  duration: duration.base,
  ease: easeOutQuint,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease: easeOutQuint },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.base, ease: easeOutQuart },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.04,
      staggerChildren: 0.04,
    },
  },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: duration.base, ease: easeOutQuint },
  },
};

export const drawLine: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: duration.slow, ease: easeOutExpo },
  },
};

export const growUp: Variants = {
  hidden: { scaleY: 0, transformOrigin: "bottom" },
  visible: {
    scaleY: 1,
    transformOrigin: "bottom",
    transition: { duration: duration.slow, ease: easeOutExpo },
  },
};
