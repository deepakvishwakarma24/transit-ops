import { TriangleAlert, ShieldCheck } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/status-badge";

interface ExpiryWatchlistProps {
  items: {
    driverName: string;
    licenseNumber: string;
    daysToExpiry: number;
  }[];
}

export function ExpiryWatchlist({ items }: ExpiryWatchlistProps) {
  return (
    <div className="flex flex-col gap-4 rounded-md border border-border bg-surface-1 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-warning">
            Compliance
  </p>
          <h2 className="text-[18px] font-semibold tracking-[-0.015em] text-ink-900">
            License expiry watchlist
  </h2>
          <p className="mt-1 max-w-prose text-[13px] leading-[1.55] text-ink-500">
            Drivers with licenses expiring within 60 days. Dispatch refuses
            assignment automatically the moment a license hits expiry.
  </p>
    </div>
        <StatusBadge status="warning" label={`${items.length} pending`} />
  </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-success/40 bg-success/[0.04] py-10 text-center text-[14px] text-success">
          <ShieldCheck className="size-5" aria-hidden="true" />
          <span className="font-medium">All licenses valid for the next 60 days</span>
  </div>
      ) : (
        <ul className="flex flex-col">
          {items.map((it) => {
            const severity =
              it.daysToExpiry <= 7
                ? ("danger" as const)
                : it.daysToExpiry <= 30
                ? ("warning" as const)
                : ("info" as const);
            const urgency =
              it.daysToExpiry <= 30 ? "Renew today" : "Plan renewal";
            return (
              <li
                key={it.licenseNumber}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-border py-3 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-medium text-ink-900">
                    {it.driverName}
       </p>
                  <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-500">
                    {it.licenseNumber}
       </p>
      </div>
                <span className="font-mono text-[15px] font-medium tabular-nums tracking-[-0.01em] text-ink-900">
                  {Math.max(0, it.daysToExpiry)}<span className="ml-1 text-[10.5px] uppercase tracking-[0.12em] text-ink-500">days</span>
      </span>
                <StatusBadge status={severity} label={urgency} />
             </li>
            );
          })}
      </ul>
      )}
</div>
  );
}
