import { CalendarDays } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-ink-muted sm:flex-row sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-600 text-white">
            <CalendarDays className="h-3.5 w-3.5" />
          </span>
          <span className="font-semibold text-ink">Event Planner</span>
          <span className="hidden text-line-strong sm:inline">·</span>
          <span className="hidden sm:inline">
            Plan events with your friends.
          </span>
        </div>
        <span>© {year} Event Planner &amp; Nikolay Stoyanov</span>
      </div>
    </footer>
  );
}
