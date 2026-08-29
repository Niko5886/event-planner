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
import { Badge, type BadgeVariant } from "@/components/ui";

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

const STATE_VARIANT: Record<EventState, BadgeVariant> = {
  upcoming: "brand",
  ongoing: "success",
  past: "neutral",
};

const CAPACITY_LABEL: Record<CapacityState, string> = {
  under: "Under capacity",
  full: "Full",
  over: "Over capacity",
};

const CAPACITY_VARIANT: Record<CapacityState, BadgeVariant> = {
  under: "neutral",
  full: "warning",
  over: "danger",
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
      className="group flex flex-col rounded-xl border border-line bg-surface p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium uppercase tracking-wide text-brand-600">
          {event.groupTitle}
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {event.canceled && <CanceledBadge />}
          <StateBadge state={state} />
        </div>
      </div>

      <h3 className="mt-2 text-lg font-semibold text-ink group-hover:text-brand-700">
        {event.title}
      </h3>

      <div className="mt-3 space-y-1.5 text-sm text-ink-muted">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-ink-subtle" />
          <span>{formatDate(event.date)}</span>
          <span className="text-line-strong">·</span>
          <Clock className="h-4 w-4 text-ink-subtle" />
          <span>{formatTime(event.time)}</span>
        </div>
        {event.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-ink-subtle" />
            <span className="truncate">{event.location}</span>
          </div>
        )}
        {event.eventType && (
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-ink-subtle" />
            <span className="capitalize">{event.eventType}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
        <div className="flex items-center gap-1.5 text-sm text-ink-muted">
          <Users className="h-4 w-4 text-ink-subtle" />
          <span className="font-medium text-ink">{event.attendees}</span>
          <span className="text-ink-subtle">/ {event.capacity}</span>
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
      className="group flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-muted/50 px-4 py-3 transition hover:bg-surface"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <span className="font-medium uppercase tracking-wide">
            {event.groupTitle}
          </span>
          {event.eventType && (
            <>
              <span className="text-line-strong">·</span>
              <span className="capitalize">{event.eventType}</span>
            </>
          )}
        </div>
        <h3 className="mt-0.5 truncate text-sm font-medium text-ink-muted group-hover:text-ink">
          {event.title}
        </h3>
        <div className="mt-1 flex items-center gap-3 text-xs text-ink-muted">
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
    <Badge variant={STATE_VARIANT[state]}>
      <CircleDot className="h-3 w-3" />
      {STATE_LABEL[state]}
    </Badge>
  );
}

function CanceledBadge() {
  return (
    <Badge variant="danger">
      <Ban className="h-3 w-3" />
      Canceled
    </Badge>
  );
}

function CapacityBadge({ capacity }: { capacity: CapacityState }) {
  return (
    <Badge variant={CAPACITY_VARIANT[capacity]}>
      {capacity === "over" && <AlertOctagon className="h-3 w-3" />}
      {CAPACITY_LABEL[capacity]}
    </Badge>
  );
}
