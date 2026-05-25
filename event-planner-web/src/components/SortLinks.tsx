import Link from "next/link";
import { ArrowUpDown } from "lucide-react";

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
      <span className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
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
              className={`rounded-md border px-3 py-1 text-xs font-medium transition ${
                isActive
                  ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {opt.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
