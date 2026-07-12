"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  Activity,
  ClipboardList,
  Cog,
  Fuel,
  Gauge,
  LayoutDashboard,
  type LucideIcon,
  Truck,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { BrandMark } from "@/components/marketing/brand-mark";
import { StatusBadge } from "@/components/dashboard/status-badge";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  group: "operate" | "manage";
  count?: number;
  countStatus?: "neutral" | "warning";
}

const PRIMARY_NAV: NavItem[] = [
  { href: "/", label: "Overview", icon: LayoutDashboard, group: "operate" },
  { href: "/trips", label: "Trips", icon: ClipboardList, group: "operate", count: 3, countStatus: "warning" },
  { href: "/vehicles", label: "Vehicles", icon: Truck, group: "operate" },
  { href: "/drivers", label: "Drivers", icon: Users, group: "operate" },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/maintenance", label: "Maintenance", icon: Activity, group: "manage" },
  { href: "/fuel", label: "Fuel & Expenses", icon: Fuel, group: "manage" },
  { href: "/analytics", label: "Analytics", icon: Gauge, group: "manage" },
  { href: "/finance", label: "Cost Ledger", icon: Wallet, group: "manage" },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex h-9 items-center gap-3 rounded-md px-3 text-[13px] font-medium",
        "transition-colors duration-200 ease-out-quart",
        active
          ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
          : "text-ink-600 hover:bg-surface-2 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-ink-200/40 dark:hover:text-ink-900"
      )}
    >
      {active ? (
        <motion.span
          layoutId="sidebar-active-bar"
          className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-amber-500"
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
        />
      ) : null}
      <Icon
        className={cn(
          "size-4 shrink-0",
          active
            ? "text-amber-600 dark:text-amber-300"
            : "text-ink-400 group-hover:text-ink-700 dark:text-ink-500 dark:group-hover:text-ink-700"
        )}
        aria-hidden="true"
      />
      <span className="flex-1">{item.label}</span>
      {typeof item.count === "number" ? (
        <StatusBadge
          status={item.countStatus ?? "neutral"}
          label={String(item.count)}
          withDot={false}
          className="h-4 px-1.5 text-[10px]"
        />
      ) : null}
  </Link>
  );
}

export function AppSidebar({ userName, userRole }: { userName: string; userRole: string }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside className="hidden h-full w-[240px] shrink-0 flex-col border-r border-border bg-surface-1 lg:flex">
      <div className="flex h-16 items-center gap-2.5 px-4">
        <BrandMark size={28} />
        <div className="leading-tight">
          <p className="text-[15px] font-semibold tracking-[-0.015em] text-ink-900">
            TransitOps
        </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500">
            Depot · Andheri
        </p>
       </div>
     </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <p className="mt-2 px-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500">
          Operate
      </p>
        <div className="mt-1 flex flex-col gap-0.5">
          {PRIMARY_NAV.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActive(item.href)}
            />
          ))}
       </div>

        <p className="mt-6 px-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500">
          Manage
      </p>
        <div className="mt-1 flex flex-col gap-0.5">
          {ADMIN_NAV.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActive(item.href)}
            />
          ))}
       </div>
     </div>

      <div className="border-t border-border px-3 py-3">
        <Link
          href="/settings"
          className="flex h-9 items-center gap-3 rounded-md px-3 text-[13px] font-medium text-ink-600 transition-colors duration-200 ease-out-quart hover:bg-surface-2 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-ink-200/40 dark:hover:text-ink-900"
        >
          <Cog className="size-4 text-ink-400" aria-hidden="true" />
          Settings
       </Link>
        <div className="mt-3 flex items-center gap-3 rounded-md border border-border px-3 py-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-ink-100 font-mono text-[11px] font-medium uppercase tracking-wide text-ink-700 dark:bg-ink-300 dark:text-ink-900">
            {userName
              .split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")}
         </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-semibold text-ink-900">
              {userName}
          </p>
            <p className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500">
              {userRole}
          </p>
         </div>
          <ThemeToggle />
       </div>
     </div>
  </aside>
  );
}
