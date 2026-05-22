import Link from "next/link";
import {
  AlertOctagon,
  Ban,
  CalendarDays,
  CircleDot,
  Clock,
  MapPin,
  Tag,
  Users,
} from "lucide-react";
import type { EventCardData } from "@/services/eventService";
import {
  getCapacityState,
  getEventState,
  type CapacityState,
  type EventState,
} from "@/lib/eventState";

type Variant = "active" | "muted";

function formatDate(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(time: string): string {
  return time.slice(0, 5);
}

const STATE_LABEL: Record<EventState, string> = {
  upcoming: "Upcoming",
  ongoing: "Ongoing",
  past: "Past",
};

const STATE_STYLE: Record<EventState, string> = {
  upcoming: "bg-indigo-100 text-indigo-700",
  ongoing: "bg-emerald-100 text-emerald-700",
  past: "bg-slate-200 text-slate-600",
};

const CAPACITY_LABEL: Record<CapacityState, string> = {
  under: "Under capacity",
  full: "Full",
  over: "Over capacity",
};

const CAPACITY_STYLE: Record<CapacityState, string> = {
  under: "bg-slate-100 text-slate-600",
  full: "bg-amber-100 text-amber-700",
  over: "bg-red-100 text-red-700",
};

export function EventCard({
  event,
  variant = "active",
}: {
  event: EventCardData;
  variant?: Variant;
}) {
  const state = getEventState(event.date, event.time);
  const capacity = getCapacityState(event.attendees, event.capacity);

  if (variant === "muted") {
    return <MutedEventCard event={event} state={state} />;
  }

  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium uppercase tracking-wide text-indigo-600">
          {event.groupTitle}
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {event.canceled && <CanceledBadge />}
          <StateBadge state={state} />
        </div>
      </div>

      <h3 className="mt-2 text-lg font-semibold text-slate-900 group-hover:text-indigo-700">
        {event.title}
      </h3>

      <div className="mt-3 space-y-1.5 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-slate-400" />
          <span>{formatDate(event.date)}</span>
          <span className="text-slate-300">·</span>
          <Clock className="h-4 w-4 text-slate-400" />
          <span>{formatTime(event.time)}</span>
        </div>
        {event.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span className="truncate">{event.location}</span>
          </div>
        )}
        {event.eventType && (
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-slate-400" />
            <span className="capitalize">{event.eventType}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <Users className="h-4 w-4 text-slate-400" />
          <span className="font-medium text-slate-900">
            {event.attendees}
          </span>
          <span className="text-slate-400">/ {event.capacity}</span>
        </div>
        <CapacityBadge capacity={capacity} />
      </div>
    </Link>
  );
}

function MutedEventCard({
  event,
  state,
}: {
  event: EventCardData;
  state: EventState;
}) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3 transition hover:bg-white"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-medium uppercase tracking-wide">
            {event.groupTitle}
          </span>
          {event.eventType && (
            <>
              <span className="text-slate-300">·</span>
              <span className="capitalize">{event.eventType}</span>
            </>
          )}
        </div>
        <h3 className="mt-0.5 truncate text-sm font-medium text-slate-700 group-hover:text-slate-900">
          {event.title}
        </h3>
        <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(event.date)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {event.attendees} / {event.capacity}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        {event.canceled ? <CanceledBadge /> : <StateBadge state={state} />}
      </div>
    </Link>
  );
}

function StateBadge({ state }: { state: EventState }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${STATE_STYLE[state]}`}
    >
      <CircleDot className="h-3 w-3" />
      {STATE_LABEL[state]}
    </span>
  );
}

function CanceledBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
      <Ban className="h-3 w-3" />
      Canceled
    </span>
  );
}

function CapacityBadge({ capacity }: { capacity: CapacityState }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${CAPACITY_STYLE[capacity]}`}
    >
      {capacity === "over" && <AlertOctagon className="h-3 w-3" />}
      {CAPACITY_LABEL[capacity]}
    </span>
  );
}
