import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui";

type IconType = ComponentType<{ className?: string }>;

interface SectionHeaderProps {
  title: string;
  description?: string;
  icon?: IconType;
  count?: number;
  actions?: ReactNode;
  as?: "h1" | "h2";
  className?: string;
}

/** Consistent section/page heading: optional icon, title, count and actions. */
export function SectionHeader({
  title,
  description,
  icon: Icon,
  count,
  actions,
  as = "h2",
  className,
}: SectionHeaderProps) {
  const Heading = as;
  return (
    <div
      className={cn(
        "mb-5 flex flex-wrap items-center justify-between gap-3",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div>
          <div className="flex items-center gap-2">
            <Heading
              className={cn(
                "text-ink",
                as === "h1"
                  ? "text-2xl font-bold tracking-tight sm:text-3xl"
                  : "text-xl font-semibold"
              )}
            >
              {title}
            </Heading>
            {typeof count === "number" && (
              <Badge variant="neutral">{count}</Badge>
            )}
          </div>
          {description && (
            <p className="mt-0.5 text-sm text-ink-muted">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
