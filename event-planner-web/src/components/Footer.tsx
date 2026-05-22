import { CalendarDays } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-600 sm:flex-row">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-indigo-600" />
          <span className="font-semibold text-slate-900">Event Planner</span>
          <span className="hidden text-slate-400 sm:inline">·</span>
          <span className="hidden sm:inline">
            Plan events with your friends.
          </span>
        </div>
        <span>© {year} Event Planner</span>
      </div>
    </footer>
  );
}
