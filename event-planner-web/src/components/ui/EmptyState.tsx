import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/cn";

type IconType = ComponentType<{ className?: string }>;

export interface EmptyStateProps {
  icon?: IconType;
  title: string;
  description?: string;
  action?: ReactNode;
  muted?: boolean;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  muted = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-xl border border-dashed p-8 text-center",
        muted
          ? "border-line bg-surface-muted/50"
          : "border-line-strong bg-surface",
        className
      )}
    >
      {Icon && (
        <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <p className="font-semibold text-ink">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
