"use client";

import { useState } from "react";
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { TableIcon } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortable?: boolean;
  mono?: boolean;
  align?: "left" | "right" | "center";
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  emptyHeading?: string;
  emptyDescription?: string;
  rowClassName?: (row: T) => string;
  onRowClick?: (row: T) => void;
  footer?: React.ReactNode;
}

type SortDir = "asc" | "desc" | null;

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  emptyHeading = "No records found",
  emptyDescription = "Try adjusting your filters.",
  rowClassName,
  onRowClick,
  footer,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"));
      if (sortDir === "desc") setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = [...rows].sort((a, b) => {
    if (!sortKey || !sortDir) return 0;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return 0;
    const aVal = col.render(a);
    const bVal = col.render(b);
    const aStr = String(aVal ?? "");
    const bStr = String(bVal ?? "");
    const n = aStr.localeCompare(bStr, undefined, { numeric: true });
    return sortDir === "asc" ? n : -n;
  });

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-2.5 text-left font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-500 select-none whitespace-nowrap",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.sortable && "cursor-pointer hover:text-ink-900 transition-colors duration-150",
                    col.width
                  )}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <span className="shrink-0 text-ink-300">
                        {sortKey === col.key && sortDir === "asc" ? (
                          <ChevronUp className="size-3" />
                        ) : sortKey === col.key && sortDir === "desc" ? (
                          <ChevronDown className="size-3" />
                        ) : (
                          <ChevronsUpDown className="size-3 opacity-50" />
                        )}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12">
                  <EmptyState
                    icon={TableIcon}
                    heading={emptyHeading}
                    description={emptyDescription}
                  />
                </td>
              </tr>
            )}
            {sorted.map((row) => (
              <tr
                key={getRowKey(row)}
                className={cn(
                  "group border-b border-border last:border-b-0 transition-colors duration-150 ease-out-quart",
                  onRowClick && "cursor-pointer hover:bg-surface-2/60",
                  rowClassName?.(row)
                )}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 py-3.5 text-ink-900",
                      col.mono && "font-mono tabular-nums",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center"
                    )}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footer && (
        <div className="border-t border-border px-4 py-3">{footer}</div>
      )}
    </div>
  );
}

// ─── SearchInput ──────────────────────────────────────────────────────────────

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = "Search…" }: SearchInputProps) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-400"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-9 w-full rounded-md border border-border bg-surface-1 pl-8 pr-3 text-[13px] text-ink-900 placeholder:text-ink-400",
          "outline-none transition-shadow duration-150 ease-out-quart",
          "focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25",
          "dark:bg-surface-2"
        )}
      />
    </div>
  );
}

// ─── FilterSelect ─────────────────────────────────────────────────────────────

interface FilterSelectProps {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  className?: string;
}

export function FilterSelect({
  value,
  onChange,
  options,
  placeholder = "All",
  className,
}: FilterSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-9 rounded-md border border-border bg-surface-1 px-3 text-[13px] text-ink-900",
        "outline-none transition-shadow duration-150 ease-out-quart",
        "focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25",
        "dark:bg-surface-2",
        className
      )}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
