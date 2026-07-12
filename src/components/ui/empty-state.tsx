import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  heading: string;
  description?: string;
  cta?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, heading, description, cta, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-md border border-dashed border-border py-16 text-center",
        className
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-md bg-surface-2 text-ink-400">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div className="max-w-xs">
        <p className="text-[14px] font-semibold text-ink-900">{heading}</p>
        {description && (
          <p className="mt-1 text-[13px] leading-[1.55] text-ink-500">{description}</p>
        )}
      </div>
      {cta && <div className="mt-1">{cta}</div>}
    </div>
  );
}
