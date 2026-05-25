import { CalendarCheck, CalendarX } from "lucide-react";
import { EventCard } from "@/components/EventCard";
import { getCurrentUser } from "@/lib/auth";
import {
  getActiveEvents,
  getPastAndCanceledEvents,
} from "@/services/eventService";

export const metadata = {
  title: "Dashboard · Event Planner",
};

export default async function DashboardPage() {
  const user = (await getCurrentUser())!;

  const [activeEvents, pastEvents] = await Promise.all([
    getActiveEvents(),
    getPastAndCanceledEvents(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="mt-1 text-slate-600">
          Welcome back, <span className="font-medium">{user.name}</span>.
        </p>
      </header>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-indigo-600" />
          <h2 className="text-xl font-semibold text-slate-900">
            Upcoming Events
          </h2>
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
            {activeEvents.length}
          </span>
        </div>

        {activeEvents.length === 0 ? (
          <EmptyState
            title="No active events"
            description="When you or a group manager creates an event, it will appear here."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeEvents.map((event) => (
              <EventCard key={event.id} event={event} variant="active" />
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-center gap-2">
          <CalendarX className="h-5 w-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-700">
            Past &amp; Canceled Events
          </h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {pastEvents.length}
          </span>
        </div>

        {pastEvents.length === 0 ? (
          <EmptyState
            title="No past events yet"
            description="Past and canceled events will be archived here."
            muted
          />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {pastEvents.map((event) => (
              <EventCard key={event.id} event={event} variant="muted" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyState({
  title,
  description,
  muted = false,
}: {
  title: string;
  description: string;
  muted?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border border-dashed p-8 text-center ${
        muted
          ? "border-slate-200 bg-slate-50/50 text-slate-500"
          : "border-slate-300 bg-white text-slate-600"
      }`}
    >
      <p className="font-medium text-slate-700">{title}</p>
      <p className="mt-1 text-sm">{description}</p>
    </div>
  );
}
