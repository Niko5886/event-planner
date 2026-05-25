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
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <header className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/groups/${event.groupId}`}
            className="text-xs font-medium uppercase tracking-wide text-indigo-600 hover:text-indigo-700"
          >
            {event.groupTitle}
          </Link>
          <div className="flex flex-wrap items-center gap-1.5">
            {event.canceled && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                <Ban className="h-3 w-3" />
                Canceled
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${STATE_STYLE[state]}`}
            >
              <CircleDot className="h-3 w-3" />
              {STATE_LABEL[state]}
            </span>
          </div>
        </div>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          {event.title}
        </h1>
        {event.description && (
          <p className="mt-3 whitespace-pre-line text-slate-600">
            {event.description}
          </p>
        )}
      </header>

      <section className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
        <InfoRow
          icon={<CalendarDays className="h-4 w-4 text-slate-400" />}
          label="Date"
          value={formatDate(event.date)}
        />
        <InfoRow
          icon={<Clock className="h-4 w-4 text-slate-400" />}
          label="Time"
          value={formatTime(event.time)}
        />
        {event.location && (
          <InfoRow
            icon={<MapPin className="h-4 w-4 text-slate-400" />}
            label="Location"
            value={event.location}
          />
        )}
        {event.eventType && (
          <InfoRow
            icon={<Tag className="h-4 w-4 text-slate-400" />}
            label="Type"
            value={
              <span className="capitalize">{event.eventType}</span>
            }
          />
        )}
        <InfoRow
          icon={<Users className="h-4 w-4 text-slate-400" />}
          label="Attendees"
          value={
            <span className="flex items-center gap-2">
              <span className="font-medium text-slate-900">
                {event.attendees}
              </span>
              <span className="text-slate-400">/ {event.capacity}</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${CAPACITY_STYLE[capacity]}`}
              >
                {capacity === "over" && (
                  <AlertOctagon className="h-3 w-3" />
                )}
                {CAPACITY_LABEL[capacity]}
              </span>
            </span>
          }
        />
        <InfoRow
          icon={<User className="h-4 w-4 text-slate-400" />}
          label="Created by"
          value={event.creatorName}
        />
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
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
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Comments
          </h2>
          <span className="text-sm text-slate-500">{comments.length} total</span>
        </div>

        <div className="mt-4 space-y-4">
          {comments.length === 0 ? (
            <p className="text-sm text-slate-500">
              No comments yet.
            </p>
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>

        <EventCommentForm eventId={event.id} />
      </section>
    </div>
  );
}

function CommentItem({ comment }: { comment: EventCommentData }) {
  const initials = comment.authorName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
        {comment.authorPhotoUrl ? (
          <img
            src={comment.authorPhotoUrl}
            alt={comment.authorName}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          initials || <User className="h-4 w-4" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="text-sm font-semibold text-slate-900">
            {comment.authorName}
          </p>
          <span className="text-xs text-slate-400">
            {formatCommentDate(comment.createdAt)}
          </span>
        </div>
        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
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
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <div className="mt-0.5 text-sm text-slate-700">{value}</div>
      </div>
    </div>
  );
}
