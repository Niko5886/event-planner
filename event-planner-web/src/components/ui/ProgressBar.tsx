import { cn } from "@/lib/cn";

export type ProgressTone = "brand" | "success" | "warning" | "danger";

const TONE: Record<ProgressTone, string> = {
  brand: "bg-brand-600",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export interface ProgressBarProps {
  value: number;
  max?: number;
  tone?: ProgressTone;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  tone = "brand",
  className,
}: ProgressBarProps) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-surface-muted",
        className
      )}
    >
      <div
        className={cn("h-full rounded-full transition-all", TONE[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
