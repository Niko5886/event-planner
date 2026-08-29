import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertOctagon,
  ArrowLeft,
  Ban,
  CalendarDays,
  CircleDot,
  Clock,
  MapPin,
  Tag,
  User,
  Users,
} from "lucide-react";
import { EventActions } from "./EventActions";
import { EventCommentForm } from "./EventCommentForm";
import { getCurrentUser } from "@/lib/auth";
import {
  EventError,
  getEventComments,
  getEventDetails,
  type EventCommentData,
} from "@/services/eventService";
import {
  getCapacityState,
  getEventState,
  isEventActive,
  type CapacityState,
  type EventState,
} from "@/lib/eventState";
import { Avatar, Badge, Card, type BadgeVariant } from "@/components/ui";

function formatDate(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
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

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = (await getCurrentUser())!;
  const { id } = await params;
  const eventId = Number(id);

  if (!Number.isInteger(eventId) || eventId <= 0) {
    notFound();
  }

  let event;
  try {
    event = await getEventDetails(eventId, user.userId, user.role);
  } catch (err) {
    if (err instanceof EventError && err.code === "not_found") notFound();
    throw err;
  }

  const state = getEventState(event.date, event.time);
  const capacity = getCapacityState(event.attendees, event.capacity);
  const isOpen = isEventActive(event.date, event.time, event.canceled);
  const comments = await getEventComments(event.id);
  const maxExtraSlots = Math.max(
    0,
    event.capacity - event.attendees + event.userExtraSlots
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <header className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/groups/${event.groupId}`}
            className="text-xs font-medium uppercase tracking-wide text-brand-600 transition-colors hover:text-brand-700"
          >
            {event.groupTitle}
          </Link>
          <div className="flex flex-wrap items-center gap-1.5">
            {event.canceled && (
              <Badge variant="danger">
                <Ban className="h-3 w-3" />
                Canceled
              </Badge>
            )}
            <Badge variant={STATE_VARIANT[state]}>
              <CircleDot className="h-3 w-3" />
              {STATE_LABEL[state]}
            </Badge>
          </div>
        </div>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">
          {event.title}
        </h1>
        {event.description && (
          <p className="mt-3 whitespace-pre-line text-ink-muted">
            {event.description}
          </p>
        )}
      </header>

      <Card className="mt-6 grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
        <InfoRow
          icon={<CalendarDays className="h-4 w-4 text-ink-subtle" />}
          label="Date"
          value={formatDate(event.date)}
        />
        <InfoRow
          icon={<Clock className="h-4 w-4 text-ink-subtle" />}
          label="Time"
          value={formatTime(event.time)}
        />
        {event.location && (
          <InfoRow
            icon={<MapPin className="h-4 w-4 text-ink-subtle" />}
            label="Location"
            value={event.location}
          />
        )}
        {event.eventType && (
          <InfoRow
            icon={<Tag className="h-4 w-4 text-ink-subtle" />}
            label="Type"
            value={<span className="capitalize">{event.eventType}</span>}
          />
        )}
        <InfoRow
          icon={<Users className="h-4 w-4 text-ink-subtle" />}
          label="Attendees"
          value={
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-ink">{event.attendees}</span>
              <span className="text-ink-subtle">/ {event.capacity}</span>
              <Badge variant={CAPACITY_VARIANT[capacity]}>
                {capacity === "over" && <AlertOctagon className="h-3 w-3" />}
                {CAPACITY_LABEL[capacity]}
              </Badge>
            </span>
          }
        />
        <InfoRow
          icon={<User className="h-4 w-4 text-ink-subtle" />}
          label="Created by"
          value={event.creatorName}
        />
      </Card>

      <Card className="mt-6 p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Actions
        </h2>
        <div className="mt-3">
          <EventActions
            key={`${event.id}:${event.isRsvped ? 1 : 0}`}
            eventId={event.id}
            isRsvped={event.isRsvped}
            canManage={event.canManage}
            isOpen={isOpen}
            userExtraSlots={event.userExtraSlots}
            maxExtraSlots={maxExtraSlots}
          />
        </div>
      </Card>

      <Card className="mt-6 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Comments
          </h2>
          <span className="text-sm text-ink-muted">{comments.length} total</span>
        </div>

        <div className="mt-4 space-y-4">
          {comments.length === 0 ? (
            <p className="text-sm text-ink-muted">No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>

        <EventCommentForm eventId={event.id} />
      </Card>
    </div>
  );
}

function CommentItem({ comment }: { comment: EventCommentData }) {
  return (
    <article className="flex gap-3 rounded-lg border border-line bg-surface-muted/60 p-4">
      <Avatar
        name={comment.authorName}
        src={comment.authorPhotoUrl}
        size="md"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="text-sm font-semibold text-ink">
            {comment.authorName}
          </p>
          <span className="text-xs text-ink-subtle">
            {formatCommentDate(comment.createdAt)}
          </span>
        </div>
        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-ink-muted">
          {comment.text}
        </p>
      </div>
    </article>
  );
}

function formatCommentDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
          {label}
        </p>
        <div className="mt-0.5 text-sm text-ink">{value}</div>
      </div>
    </div>
  );
}
