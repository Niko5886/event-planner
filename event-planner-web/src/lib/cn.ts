export type ClassValue = string | number | null | false | undefined;

/**
 * Minimal className joiner (clsx-lite). Filters out falsy values and joins the
 * rest with spaces. Keeps component call-sites readable without a dependency.
 */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
