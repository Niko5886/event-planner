import { and, asc, desc, eq, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  eventComments,
  eventRsvps,
  events,
  groupMembers,
  groups,
  users,
} from "@/db/schema";
import { isEventActive } from "@/lib/eventState";

export type EventCardData = {
  id: number;
  title: string;
  description: string | null;
  eventType: string | null;
  date: string;
  time: string;
  location: string | null;
  capacity: number;
  canceled: boolean;
  groupId: number;
  groupTitle: string;
  attendees: number;
};

export type EventDetails = EventCardData & {
  createdBy: number;
  creatorName: string;
  isRsvped: boolean;
  isCreator: boolean;
  canManage: boolean;
};

export type EventCommentData = {
  id: number;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  authorName: string;
  authorPhotoUrl: string | null;
};

export type EventErrorCode =
  | "not_found"
  | "forbidden"
  | "already_rsvped"
  | "not_rsvped"
  | "event_closed"
  | "invalid_input";

export class EventError extends Error {
  constructor(public code: EventErrorCode) {
    super(code);
    this.name = "EventError";
  }
}

export const MAX_EVENT_TITLE_LENGTH = 120;
export const MAX_EVENT_DESCRIPTION_LENGTH = 2000;
export const MAX_EVENT_LOCATION_LENGTH = 200;
export const MIN_EVENT_TITLE_LENGTH = 2;
export const MAX_EVENT_CAPACITY = 1000;

const attendeesExpr = sql<number>`COALESCE((
  SELECT SUM(1 + ${eventRsvps.extraSlots})::int
  FROM ${eventRsvps}
  WHERE ${eventRsvps.eventId} = ${events.id}
), 0)`;

const eventEndUtcExpr = sql`((${events.date}::timestamp + ${events.time}) + interval '1 hour')`;
const nowUtcExpr = sql`(now() at time zone 'utc')::timestamp`;

const baseSelect = {
  id: events.id,
  title: events.title,
  description: events.description,
  eventType: events.eventType,
  date: events.date,
  time: events.time,
  location: events.location,
  capacity: events.capacity,
  canceled: events.canceled,
  groupId: events.groupId,
  groupTitle: groups.title,
  attendees: attendeesExpr,
};

export async function getActiveEventsForUser(
  userId: number
): Promise<EventCardData[]> {
  return db
    .select(baseSelect)
    .from(events)
    .innerJoin(groups, eq(groups.id, events.groupId))
    .innerJoin(
      groupMembers,
      and(
        eq(groupMembers.groupId, events.groupId),
        eq(groupMembers.userId, userId)
      )
    )
    .where(
      and(eq(events.canceled, false), sql`${eventEndUtcExpr} > ${nowUtcExpr}`)
    )
    .orderBy(asc(events.date), asc(events.time));
}

export async function getPastAndCanceledEventsForUser(
  userId: number
): Promise<EventCardData[]> {
  return db
    .select(baseSelect)
    .from(events)
    .innerJoin(groups, eq(groups.id, events.groupId))
    .innerJoin(
      groupMembers,
      and(
        eq(groupMembers.groupId, events.groupId),
        eq(groupMembers.userId, userId)
      )
    )
    .where(
      or(eq(events.canceled, true), sql`${eventEndUtcExpr} <= ${nowUtcExpr}`)
    )
    .orderBy(desc(events.date), desc(events.time));
}

export async function getEventDetails(
  eventId: number,
  viewerId: number,
  viewerRole: "user" | "admin"
): Promise<EventDetails> {
  const [row] = await db
    .select({
      ...baseSelect,
      createdBy: events.createdBy,
      creatorName: users.name,
    })
    .from(events)
    .innerJoin(groups, eq(groups.id, events.groupId))
    .innerJoin(users, eq(users.id, events.createdBy))
    .where(eq(events.id, eventId))
    .limit(1);

  if (!row) {
    throw new EventError("not_found");
  }

  const [rsvp] = await db
    .select({ id: eventRsvps.id })
    .from(eventRsvps)
    .where(
      and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.userId, viewerId))
    )
    .limit(1);

  const isCreator = row.createdBy === viewerId;
  const isAdmin = viewerRole === "admin";

  return {
    ...row,
    isRsvped: Boolean(rsvp),
    isCreator,
    canManage: isCreator || isAdmin,
  };
}

export async function getEventComments(eventId: number): Promise<
  EventCommentData[]
> {
  return db
    .select({
      id: eventComments.id,
      text: eventComments.text,
      createdAt: eventComments.createdAt,
      updatedAt: eventComments.updatedAt,
      userId: eventComments.userId,
      authorName: users.name,
      authorPhotoUrl: users.photoUrl,
    })
    .from(eventComments)
    .innerJoin(users, eq(users.id, eventComments.userId))
    .where(eq(eventComments.eventId, eventId))
    .orderBy(asc(eventComments.createdAt), asc(eventComments.id));
}

export async function rsvpToEvent(input: {
  eventId: number;
  userId: number;
}): Promise<void> {
  const [event] = await db
    .select({
      id: events.id,
      date: events.date,
      time: events.time,
      canceled: events.canceled,
    })
    .from(events)
    .where(eq(events.id, input.eventId))
    .limit(1);

  if (!event) {
    throw new EventError("not_found");
  }
  if (!isEventActive(event.date, event.time, event.canceled)) {
    throw new EventError("event_closed");
  }

  const [existing] = await db
    .select({ id: eventRsvps.id })
    .from(eventRsvps)
    .where(
      and(
        eq(eventRsvps.eventId, input.eventId),
        eq(eventRsvps.userId, input.userId)
      )
    )
    .limit(1);

  if (existing) {
    throw new EventError("already_rsvped");
  }

  await db.insert(eventRsvps).values({
    eventId: input.eventId,
    userId: input.userId,
    extraSlots: 0,
  });
}

export async function leaveEvent(input: {
  eventId: number;
  userId: number;
}): Promise<void> {
  const [event] = await db
    .select({
      id: events.id,
      date: events.date,
      time: events.time,
      canceled: events.canceled,
    })
    .from(events)
    .where(eq(events.id, input.eventId))
    .limit(1);

  if (!event) {
    throw new EventError("not_found");
  }
  if (!isEventActive(event.date, event.time, event.canceled)) {
    throw new EventError("event_closed");
  }

  const result = await db
    .delete(eventRsvps)
    .where(
      and(
        eq(eventRsvps.eventId, input.eventId),
        eq(eventRsvps.userId, input.userId)
      )
    )
    .returning({ id: eventRsvps.id });

  if (result.length === 0) {
    throw new EventError("not_rsvped");
  }
}

type AuthorizedEventInput = {
  eventId: number;
  userId: number;
  role: "user" | "admin";
};

async function loadEventForManagement(input: AuthorizedEventInput): Promise<{
  id: number;
  groupId: number;
  createdBy: number;
}> {
  const [event] = await db
    .select({
      id: events.id,
      groupId: events.groupId,
      createdBy: events.createdBy,
    })
    .from(events)
    .where(eq(events.id, input.eventId))
    .limit(1);

  if (!event) {
    throw new EventError("not_found");
  }

  const isCreator = event.createdBy === input.userId;
  const isAdmin = input.role === "admin";
  if (!isCreator && !isAdmin) {
    throw new EventError("forbidden");
  }

  return event;
}

export type UpdateEventInput = AuthorizedEventInput & {
  title: string;
  description: string | null;
  eventType: string | null;
  date: string;
  time: string;
  location: string | null;
  capacity: number;
  canceled: boolean;
};

function validateEventInput(input: {
  title: string;
  description: string | null;
  location: string | null;
  date: string;
  time: string;
  capacity: number;
}): void {
  const title = input.title.trim();
  if (title.length < MIN_EVENT_TITLE_LENGTH) {
    throw new EventError("invalid_input");
  }
  if (title.length > MAX_EVENT_TITLE_LENGTH) {
    throw new EventError("invalid_input");
  }
  if (
    input.description &&
    input.description.length > MAX_EVENT_DESCRIPTION_LENGTH
  ) {
    throw new EventError("invalid_input");
  }
  if (input.location && input.location.length > MAX_EVENT_LOCATION_LENGTH) {
    throw new EventError("invalid_input");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    throw new EventError("invalid_input");
  }
  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(input.time)) {
    throw new EventError("invalid_input");
  }
  if (
    !Number.isInteger(input.capacity) ||
    input.capacity < 0 ||
    input.capacity > MAX_EVENT_CAPACITY
  ) {
    throw new EventError("invalid_input");
  }
}

export async function updateEvent(input: UpdateEventInput): Promise<void> {
  await loadEventForManagement(input);

  const title = input.title.trim();
  const description = input.description?.trim() || null;
  const eventType = input.eventType?.trim() || null;
  const location = input.location?.trim() || null;

  validateEventInput({
    title,
    description,
    location,
    date: input.date,
    time: input.time,
    capacity: input.capacity,
  });

  const time =
    /^\d{2}:\d{2}$/.test(input.time) ? `${input.time}:00` : input.time;

  await db
    .update(events)
    .set({
      title,
      description,
      eventType,
      date: input.date,
      time,
      location,
      capacity: input.capacity,
      canceled: input.canceled,
    })
    .where(eq(events.id, input.eventId));
}

export async function deleteEvent(input: AuthorizedEventInput): Promise<{
  groupId: number;
}> {
  const event = await loadEventForManagement(input);
  await db.delete(events).where(eq(events.id, input.eventId));
  return { groupId: event.groupId };
}
