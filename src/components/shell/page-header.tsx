import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "between";
  children?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, description, align = "between", children }: PageHeaderProps) {
  const isBetween = align === "between" && Boolean(children);
  const containerClass = cn(
    "flex gap-6 border-b border-border pb-6",
    isBetween ? "items-end justify-between" : "items-end"
  );
  const actions = children ? (
    <div className="flex items-center gap-2">
      {children}
   </div>
  ) : null;
  return (
    <header className={containerClass}>
      <div className="min-w-0">
        {eyebrow ? (
          <p
            className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-amber-600 dark:text-amber-400"
          >
            {eyebrow}
         </p>
        ) : null}
        <h1 className="mt-1 text-balance text-[clamp(1.625rem,2vw,2.25rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-ink-900">
          {title}
       </h1>
        {description ? (
          <p
            className="mt-1.5 max-w-prose text-[13.5px] leading-[1.55] text-ink-500"
          >
            {description}
         </p>
        ) : null}
     </div>
      {actions}
   </header>
  );
}
