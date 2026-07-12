import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  size?: number;
  title?: string;
}

export function BrandMark({
  className,
  size = 28,
  title = "TransitOps",
}: BrandMarkProps) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center text-amber-500",
        className
      )}
      style={{ width: size, height: size }}
      aria-label={title}
      role="img"
    >
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        aria-hidden="true"
        className="overflow-visible"
      >
        <defs>
          <clipPath id="transitops-brand-clip">
            <rect x="2" y="2" width="28" height="28" rx="6" />
         </clipPath>
        </defs>
        <g clipPath="url(#transitops-brand-clip)">
          <rect
            x="2"
            y="2"
            width="28"
            height="28"
            rx="6"
            className="fill-ink-900 dark:fill-ink-950"
          />
          <path
            d="M9 8h11.5a5 5 0 0 1 5 5v5.5"
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="square"
            className="stroke-amber-500"
          />
          <circle cx="11.25" cy="22.5" r="2" className="fill-amber-500" />
          <circle cx="22.25" cy="22.5" r="2" className="fill-amber-500" />
          <rect
            x="13.25"
            y="20.5"
            width="7"
            height="1.6"
            className="fill-amber-500/90"
          />
        </g>
        <rect
          x="2"
          y="2"
          width="28"
          height="28"
          rx="6"
          fill="none"
          className="stroke-ink-100 dark:stroke-ink-300"
          strokeWidth="1"
        />
    </svg>
  </div>
  );
}
