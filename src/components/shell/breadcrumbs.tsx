interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <span key={`${item.label}-${idx}`} className="flex items-center gap-1.5">
            <span
              className={
                isLast
                  ? "font-mono text-[11px] uppercase tracking-[0.14em] text-ink-700"
                  : "font-mono text-[11px] uppercase tracking-[0.14em] text-ink-500 hover:text-ink-900"
              }
            >
              {item.label}
        </span>
            {!isLast ? (
              <span
                aria-hidden="true"
                className="text-ink-300"
              >
                /
        </span>
            ) : null}
        </span>
        );
      })}
 </nav>
  );
}
