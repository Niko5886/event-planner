import Link from "next/link";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/cn";

export type SortOption = {
  value: string;
  label: string;
};

export function SortLinks({
  label = "Sort by",
  param,
  current,
  options,
  basePath,
  extraParams = {},
}: {
  label?: string;
  param: string;
  current: string;
  options: SortOption[];
  basePath: string;
  extraParams?: Record<string, string>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-ink-muted">
        <ArrowUpDown className="h-3.5 w-3.5" />
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const isActive = opt.value === current;
          return (
            <Link
              key={opt.value}
              href={{
                pathname: basePath,
                query: { ...extraParams, [param]: opt.value },
              }}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "rounded-md border px-3 py-1 text-xs font-medium transition-colors",
                isActive
                  ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                  : "border-line bg-surface text-ink-muted hover:bg-surface-muted hover:text-ink"
              )}
            >
              {opt.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
