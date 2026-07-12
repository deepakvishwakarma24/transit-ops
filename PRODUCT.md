# Product

## Register

product

## Platform

web

## Users

**Primary operator — Fleet Manager.** Owns fleet assets, vehicle lifecycle, and operational efficiency. Lives in TransitOps through the day, opening it before the dispatchers do. Cares whether the numbers reconcile.

**Secondary operators — Dispatcher, Safety Officer, Financial Analyst.** Each spends focused time in one or two screens, not the whole app:

- Dispatcher creates and monitors trips, needs the dispatch board to be unambiguous about which vehicle and driver are free at a glance.
- Safety Officer tracks license validity, suspensions, and safety scores. Hits the app when an expiry window opens or an incident lands, not to browse.
- Financial Analyst reviews operational expense, fuel consumption, maintenance cost, and per-vehicle ROI. Treats reports as evidence for a meeting next morning.

Drivers themselves are not app users in this build; their records are managed by the dispatcher.

## Product Purpose

Centralize transport operations into a single source of truth so the fleet stops running on spreadsheets and group chats. Vehicles, drivers, trips, maintenance, fuel, and expenses move through one lifecycle with rules that prevent the mistakes a manual logbook lets through.

Success means a fleet manager can answer "what is happening, where is the money going, and what is about to break" without pivoting between tabs or asking someone.

## Positioning

The end-to-end lifecycle, with the rules built in — every screen reinforces that a trip that shouldn't have dispatched didn't, and the cost ledger matches the warehouse.

## Brand Personality

Precise, dependable, premium. Calm, not joyful. Sophisticated without being ornamental.

Voice: short, factual, no celebration emojis, no exclamation marks on a deployed trip, no marketing on a system page. Confidence comes from the numbers being right, not from adjectives.

## Anti-references

- Generic SaaS dashboard clichés: greeting hero, gradient stat blocks, four identical KPI cards, soft purple, decorative gradients, glassmorphism.
- Spreadsheet admin tools: dense tables with no hierarchy, monochrome grid, everything the same weight.
- Terminal-heavy operator tools: dense monospace columns, neon accents on dark, ironic no-decoration styling — we are not a hacker console.
- Anything that hides a violation of a business rule behind a friendly toast.
- Pastel card colors as visual grouping.

## Design Principles

1. **The rule is the UI.** Business rules (license expiry, cargo vs capacity, status transitions) are visible on the surface they govern, not buried in a help page.
2. **Calm is a feature.** Information density without noise. Hierarchy comes from type and spacing, not from color shouting.
3. **Show the number, then the meaning.** Every KPI shows current value next to the small delta and the thing that produced it. Reporting screens explain themselves.
4. **One accent, used with intent.** A single warm accent marks action and active state. Status colors are reserved for status — they are not decoration.
5. **Motion that earns the screen.** Charts animate on enter and on data change. Other transitions are short and stoppable. Nothing bounces, nothing loops for no reason.

## Accessibility & Inclusion

WCAG 2.2 AA. All interactive surfaces operable by keyboard. Focus rings visible against both skins. Status communicated by icon + label + color, never color alone. Chart text and data labels at AA contrast against their plotting surface. Respect `prefers-reduced-motion`: crossfade-only or instant fallbacks for every animated surface including charts.
