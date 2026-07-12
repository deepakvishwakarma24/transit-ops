import { cn } from "@/lib/utils";

interface PageSectionProps {
  children: React.ReactNode;
  label?: string;
  action?: React.ReactNode;
  className?: string;
  noPad?: boolean;
}

export function PageSection({ children, label, action, className, noPad }: PageSectionProps) {
  return (
    <div className={cn("rounded-md border border-border bg-surface-1", !noPad && "p-6", className)}>
      {(label || action) && (
        <div className="mb-4 flex items-center justify-between">
          {label && (
            <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-500">
              {label}
            </p>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
