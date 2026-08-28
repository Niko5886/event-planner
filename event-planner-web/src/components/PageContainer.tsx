import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const SIZES = {
  narrow: "max-w-3xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
} as const;

interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: keyof typeof SIZES;
}

/** Centered page wrapper with consistent horizontal padding and max width. */
export function PageContainer({
  size = "default",
  className,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-4 py-8 sm:px-6", SIZES[size], className)}
      {...props}
    />
  );
}
