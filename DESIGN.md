---
version: alpha
name: TransitOps Depotsignal
description: Industrial-bomb operator console. Slate-graphite surfaces, single warm amber accent, calm purposeful motion. Restrained radii, no purple, no unneeded gradients, status communicated by icon + label.
colors:
  primary: "#0E1116"
  secondary: "#4A5260"
  tertiary: "#C75A1F"
  neutral: "#F4F2EE"
  surface-1: "#FFFFFF"
  surface-2: "#F7F6F2"
  surface-3: "#EFEDE7"
  ink-900: "#0E1116"
  ink-700: "#2A2F38"
  ink-500: "#5A6472"
  ink-300: "#9099A6"
  ink-100: "#D6D9DD"
  accent: "#C75A1F"
  accent-soft: "#F2D9C2"
  success: "#1F7A4D"
  warning: "#B7791F"
  danger: "#B42318"
  info: "#1C4E9A"
  chart-1: "#C75A1F"
  chart-2: "#1C4E9A"
  chart-3: "#1F7A4D"
  chart-4: "#A14B1F"
  chart-5: "#3A4150"
typography:
  display:
    fontFamily: Geist Sans
    fontSize: 48px
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: -0.025em
  h1:
    fontFamily: Geist Sans
    fontSize: 36px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.02em
  h2:
    fontFamily: Geist Sans
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.015em
  h3:
    fontFamily: Geist Sans
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0
  body-md:
    fontFamily: Geist Sans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body-sm:
    fontFamily: Geist Sans
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0.005em
  label-md:
    fontFamily: Geist Sans
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: 0
  label-caps:
    fontFamily: Geist Mono
    fontSize: 11px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 0.12em
  numeric-xl:
    fontFamily: Geist Mono
    fontSize: 32px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: -0.02em
    fontFeature: "tnum 1, cv11 1"
  numeric-md:
    fontFamily: Geist Mono
    fontSize: 15px
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: 0
    fontFeature: "tnum 1, cv11 1"
rounded:
  none: 0px
  xs: 4px
  sm: 6px
  md: 10px
  lg: 14px
  xl: 18px
  full: 9999px
spacing:
  base: 8px
  px: 1px
  0: 0
  1: 4px
  2: 8px
  3: 12px
  4: 16px
  5: 20px
  6: 24px
  8: 32px
  10: 40px
  12: 48px
  16: 64px
  20: 80px
  gutter: 24px
  margin: 32px
  max-content: 1440px
components:
  surface-card:
    backgroundColor: "{colors.surface-1}"
    borderColor: "{colors.ink-100}"
    borderWidth: 1px
    rounded: "{rounded.md}"
    padding: "{spacing.6}"
  button-primary:
    backgroundColor: "{colors.ink-900}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface-1}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
  status-badge:
    rounded: "{rounded.xs}"
    padding: "2px 8px"
    labelTypography: "{typography.label-caps}"
---

## Overview

A precise, operator-grade console for transport operations. Sophisticated without ornament, premium without warmth upmarket. Hierarchy is built from type weight, spacing, and one disciplined accent; status is rendered via icon + label, never color alone. Charts and graphs animate on enter and on data change, then stop. Everything else is calm.

The visual reference is engineered infrastructure: territorial but quiet slate, a single warm signal, restrained radii, monospace numerals where they matter. Closer to Versyl's editorial calm than to Render's terminal density, but in both skins the same amber accent carries the same intent.

## Colors

The palette is a **hierarchical slate-graphite ramp** plus a **single warm amber accent**, plus four reserved status hues that never bleed into the chart palette.

- **Primary (#0E1116 — Ink 900)** Body text on light surfaces, dense buttons, the highest-contrast text. Primary surface fill in the dark skin for the deepest level.
- **Secondary (#4A5260 — Ink 500)** Metadata, captions, axis labels, and rule lines. Reads as the engineered, utilitarian tier of the same neutral family.
- **Tertiary (#C75A1F — Amber)** Single accent. Reserved for: primary action buttons, current/active nav, the single most important highlight per surface, and data callouts the reader is meant to notice first. Never decoratively, never on status.
- **Neutral (#F4F2EE — Limestone)** Body background for the light skin. A true off-white at near-zero chroma. Warmth when it appears comes from accent and typography, not from the body bg itself.
- **Surface 1 (#FFFFFF), Surface 2 (#F7F6F2), Surface 3 (#EFEDE7)** Three tonal layers in light mode for cards, raised panels, and grouping, replacing shadow stack.
- **Status roles** (reserved, do not use as chart colors):
  - Success **#1F7A4D** — Completed, Available, Confirmed
  - Warning **#B7791F** — Pending, Expiring soon
  - Danger **#B42318** — Canceled, Suspended, Expired, In Shop alert
  - Info **#1C4E9A** — Draft, Dispatched, On Trip
- **Chart palette** (reserved for data viz, never UI status):
  - chart-1 **#C75A1F** (amber, brand anchor),
  - chart-2 **#1C4E9A** (cobalt),
  - chart-3 **#1F7A4D** (forest),
  - chart-4 **#A14B1F** (rust),
  - chart-5 **#3A4150** (graphite).

Dark mode keeps the same hierarchy: a slate-graphite ramp from `#0B0D11` (background) through `#161A20` (card) to `#222831` (raised), with the **same amber accent** at the same role. The warm light flips to cool dark without changing the accent — that is the entire point of a single accent.

## Typography

Two type families only, on purpose: **Geist Sans** for everything readable and **Geist Mono** for every number and every machine-id string (fleets, trips, plates, fuel logs). Pairing on a contrast axis keeps numbers honest and prose calm.

- **Display / Headlines (Geist Sans 600).** Sizes descend in 12px steps. Letter-spacing floors at **-0.025em** on display, **-0.02em** on h1, **-0.015em** on h2, and stops there. Tighter than that and the letters touch.
- **Body.** Geist Sans 400, 16/14/12 across levels. Long-form tested at 65–75ch.
- **Labels.** Geist Sans 500, 13px default, 1.3 line-height. Reserved for in-component labeling.
- **Caps labels.** Geist Mono 500, 11px, **0.12em tracking**, uppercase. Used sparingly for category and section names — never as a kicker above every heading.
- **Numerics.** Geist Mono 500 with `tnum 1` (tabular figures) and `cv11 1` (one-storey `a`). Big figures (KPIs) at 32px mono. Inline figures (trip numbers, costs) at 15px mono.
- Display headings balance with `text-wrap: balance`; long prose uses `text-wrap: pretty`.

## Layout

A strict 8px grid with a 4px half-step for micro-adjustment. Three tonal layers carry hierarchy in place of a heavy shadow stack.

- App shell uses a fixed 240px sidebar on desktop (collapses to a bottom sheet on mobile) plus a fluid main column.
- Main column maxes at **1440px** content width with **24px gutter** and **32px page margin**. Pages never span the full bleed.
- KPIs are 4-up on desktop, 2-up on tablet, 1-up on phone — built with `repeat(auto-fit, minmax(220px, 1fr))`.
- Tables interleave cards. Long lists get a dedicated listing surface with sticky header and a 12px rule separating footer actions.
- Cards top out at **10px radius**, modals at **14px**, toasts at **8px**. Pills and avatars are full-round. 24px+ on a card is forbidden — it reads as a toy, not an operator tool.

## Elevation & Depth

Depth is **tonal**, built from layered surfaces (background → card → raised) plus a single restrained shadow reserved for popovers, modals, and dragged elements.

- Cards: no shadow, 1px border in `--ink-100` (light) or `--ink-700` (dark).
- Popovers / dropdowns: 1px border + a small, defined shadow (`0 4px 16px -8px rgba(...)`).
- Modals: 1px border + slightly larger shadow (`0 16px 40px -16px rgba(...)`).
- Never pair `border` and a wide blur shadow on the same card — that is the ghost-card tell.

## Shapes

A deliberate, **engineered** shape language. Corners are slightly soft, never sharp, never pill-soft.

- `xs` 4px — chips, small tags.
- `sm` 6px — buttons, inputs, standard controls.
- `md` 10px — cards, panels.
- `lg` 14px — modals, large panels.
- `xl` 18px — hero surfaces, splash panels.
- `full` 9999px — pills, avatars, status-color dot.

## Components

- **Button.** Three tiers: primary (ink-900 fill, neutral text), accent (amber fill, used exactly once per view, for the dominant action), and outline. Sized sm / md / lg. Disabled state via opacity 0.5, never color desaturation.
- **Card.** Surface-1 bg, 1px ink-100 border, 10px radius, 24px padding. Never paired with a wide soft shadow. Cards are not the lazy answer — they appear when there's a distinct concern to surface, not as filler.
- **Status badge.** Square badge (4px radius) with leading status icon (8px dot or 14px icon) and uppercase label. Color reserved to status semantic.
- **Input.** 6px radius, 1px ink-100 border, 36px height, 12px horizontal padding. Focus state uses a 3px ring in the active accent, never a halo.
- **Data row.** 56px tall, 1px ink-100 bottom rule. Leading icon column, primary text column, numeric mono column. Hover surfaces a subtle ink-300 row tint — no full-bleed backgrounds.
- **Chart container.** Tonal card with a top-axis rule and a deck of animated chart primitives. Always renders a legend (icon + label), an axis with mono numerals, and a small footnote slot for source/period.
- **Toast.** Bottom-right on desktop, top on mobile. 14px radius, 4px status dot, mono time-stamp.

Charts and graphs are first-class components and animate:

- On enter: bars/areas/lines draw via **`motion`** (the Framer Motion package, imported as `motion`), with an ease-out-quart timing curve, never bounce. Numbers count up with `useMotionValue` + `animate`.
- On data change: bars re-rasterize with a 240ms crossfade; series enter via spring (`stiffness: 220, damping: 28`), no overshoot.
- Axis labels, axis ticks, gridlines, and tooltips fade in at the same time as the data, never earlier.
- Reduced motion: every chart collapses to a single 200ms opacity crossfade. Numbers appear at their final value, no count-up.

## Do's and Don'ts

- **Do** keep one amber accent per surface, used once for the dominant action.
- **Do** pair status color with an icon and an explicit label. Never color alone.
- **Do** use mono numerals inside any table, KPI, or chart axis.
- **Do** animate charts on enter and on data change; keep other surfaces quiet.
- **Do** maintain 4.5:1 contrast for body text and 3:1 for the muted tier.
- **Don't** use purple, violet, lavender, fuchsia, or any hue in 270–310°. They are part of the saturated-AI tell and they clash with the operator tone.
- **Don't** apply unneeded gradients to backgrounds, headings, or large surfaces.
- **Don't** pair a 1px border plus a wide soft shadow on the same card or button.
- **Don't** round cards ≥ 24px. Cards max at 10px; modals max at 14px.
- **Don't** animate layout properties (height, width) on mount/unmount of a card or row — animate opacity and transform instead.
- **Don't** place a tiny uppercase tracked kicker above every heading. Caps labels are reserved for category labels and section names within complex surfaces.
- **Don't** repeat a generic inner-card-inside-card pattern. Compose with surface tones, not nesting.
- **Don't** ship chart text below AA contrast against its plot background.
