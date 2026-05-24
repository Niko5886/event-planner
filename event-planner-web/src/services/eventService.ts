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
  userExtraSlots: number;
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

export type EventAttendee = {
  userId: number;
  name: string;
  photoUrl: string | null;
  extraSlots: number;
  rsvpAt: Date;
};

export const MAX_COMMENT_LENGTH = 2000;
export const MIN_COMMENT_LENGTH = 1;

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

export async function getActiveEventsForUserPaged(input: {
  userId: number;
  limit: number;
  offset: number;
}): Promise<{ items: EventCardData[]; total: number }> {
  const whereClause = and(
    eq(events.canceled, false),
    sql`${eventEndUtcExpr} > ${nowUtcExpr}`
  );

  const items = await db
    .select(baseSelect)
    .from(events)
    .innerJoin(groups, eq(groups.id, events.groupId))
    .innerJoin(
      groupMembers,
      and(
        eq(groupMembers.groupId, events.groupId),
        eq(groupMembers.userId, input.userId)
      )
    )
    .where(whereClause)
    .orderBy(asc(events.date), asc(events.time))
    .limit(input.limit)
    .offset(input.offset);

  const [countRow] = await db
    .select({ total: sql<number>`COUNT(*)::int` })
    .from(events)
    .innerJoin(
      groupMembers,
      and(
        eq(groupMembers.groupId, events.groupId),
        eq(groupMembers.userId, input.userId)
      )
    )
    .where(whereClause);

  return { items, total: Number(countRow?.total ?? 0) };
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
    .select({ id: eventRsvps.id, extraSlots: eventRsvps.extraSlots })
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
    userExtraSlots: rsvp ? Number(rsvp.extraSlots ?? 0) : 0,
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

export async function getEventCommentsPaged(input: {
  eventId: number;
  limit: number;
  offset: number;
}): Promise<{ items: EventCommentData[]; total: number }> {
  const items = await db
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
    .where(eq(eventComments.eventId, input.eventId))
    .orderBy(asc(eventComments.createdAt), asc(eventComments.id))
    .limit(input.limit)
    .offset(input.offset);

  const [countRow] = await db
    .select({ total: sql<number>`COUNT(*)::int` })
    .from(eventComments)
    .where(eq(eventComments.eventId, input.eventId));

  return { items, total: Number(countRow?.total ?? 0) };
}

export async function postEventComment(input: {
  eventId: number;
  userId: number;
  text: string;
}): Promise<EventCommentData> {
  const text = input.text.trim();
  if (text.length < MIN_COMMENT_LENGTH || text.length > MAX_COMMENT_LENGTH) {
    throw new EventError("invalid_input");
  }

  const [event] = await db
    .select({ id: events.id })
    .from(events)
    .where(eq(events.id, input.eventId))
    .limit(1);
  if (!event) {
    throw new EventError("not_found");
  }

  const [created] = await db
    .insert(eventComments)
    .values({
      eventId: input.eventId,
      userId: input.userId,
      text,
    })
    .returning({
      id: eventComments.id,
      text: eventComments.text,
      createdAt: eventComments.createdAt,
      updatedAt: eventComments.updatedAt,
      userId: eventComments.userId,
    });

  const [author] = await db
    .select({ name: users.name, photoUrl: users.photoUrl })
    .from(users)
    .where(eq(users.id, input.userId))
    .limit(1);

  return {
    ...created,
    authorName: author?.name ?? "",
    authorPhotoUrl: author?.photoUrl ?? null,
  };
}

export async function getEventAttendees(
  eventId: number
): Promise<EventAttendee[]> {
  return db
    .select({
      userId: eventRsvps.userId,
      name: users.name,
      photoUrl: users.photoUrl,
      extraSlots: eventRsvps.extraSlots,
      rsvpAt: eventRsvps.rsvpAt,
    })
    .from(eventRsvps)
    .innerJoin(users, eq(users.id, eventRsvps.userId))
    .where(eq(eventRsvps.eventId, eventId))
    .orderBy(asc(eventRsvps.rsvpAt), asc(eventRsvps.id));
}

export async function rsvpToEvent(input: {
  eventId: number;
  userId: number;
  extraSlots?: number;
}): Promise<void> {
  const [event] = await db
    .select({
      id: events.id,
      date: events.date,
      time: events.time,
      canceled: events.canceled,
      capacity: events.capacity,
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
    .select({ id: eventRsvps.id, extraSlots: eventRsvps.extraSlots })
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

  const extra = Number(input.extraSlots ?? 0);
  if (!Number.isInteger(extra) || extra < 0) {
    throw new EventError("invalid_input");
  }

  const [current] = await db
    .select({
      attendees: sql<number>`COALESCE(SUM(1 + ${eventRsvps.extraSlots})::int, 0)`,
    })
    .from(eventRsvps)
    .where(eq(eventRsvps.eventId, input.eventId));

  const currentAttendees = Number(current?.attendees ?? 0);
  const newTotal = currentAttendees + 1 + extra;
  if (newTotal > Number(event.capacity)) {
    throw new EventError("invalid_input");
  }

  await db.insert(eventRsvps).values({
    eventId: input.eventId,
    userId: input.userId,
    extraSlots: extra,
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
      capacity: events.capacity,
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

export async function updateRsvpSlots(input: {
  eventId: number;
  userId: number;
  extraSlots: number;
}): Promise<void> {
  const [event] = await db
    .select({
      id: events.id,
      date: events.date,
      time: events.time,
      canceled: events.canceled,
      capacity: events.capacity,
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
    .select({ id: eventRsvps.id, extraSlots: eventRsvps.extraSlots })
    .from(eventRsvps)
    .where(
      and(
        eq(eventRsvps.eventId, input.eventId),
        eq(eventRsvps.userId, input.userId)
      )
    )
    .limit(1);

  if (!existing) {
    throw new EventError("not_rsvped");
  }

  const extra = Number(input.extraSlots ?? 0);
  if (!Number.isInteger(extra) || extra < 0) {
    throw new EventError("invalid_input");
  }

  const currentExtra = Number(existing?.extraSlots ?? 0);

  const [current] = await db
    .select({
      attendees: sql<number>`COALESCE(SUM(1 + ${eventRsvps.extraSlots})::int, 0)`,
    })
    .from(eventRsvps)
    .where(eq(eventRsvps.eventId, input.eventId));
  const currentAttendees = Number(current?.attendees ?? 0);

  const newTotal = currentAttendees - currentExtra + extra;
  const cap = Number(event.capacity ?? NaN);
  if (!Number.isFinite(cap)) {
    throw new EventError("invalid_input");
  }
  if (newTotal > cap) {
    throw new EventError("invalid_input");
  }

  // Defensive: clamp to a reasonable server-side max and convert DB constraint
  // violations into `invalid_input` to avoid 500s if DB migrations haven't
  // been applied yet.
  const MAX_EXTRA_SLOTS = 1000;
  const toWrite = Math.min(extra, MAX_EXTRA_SLOTS);

  try {
    await db
      .update(eventRsvps)
      .set({ extraSlots: toWrite })
      .where(
        and(
          eq(eventRsvps.eventId, input.eventId),
          eq(eventRsvps.userId, input.userId)
        )
      );
  } catch (err: any) {
    const msg = String(err?.message ?? err);
    // Postgres CHECK constraint name for extra_slots usually contains
    // 'event_rsvps_extra_slots_check' — treat that as invalid input.
    if (msg.includes("event_rsvps_extra_slots_check") || msg.includes("check constraint")) {
      throw new EventError("invalid_input");
    }
    throw err;
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

export type CreateEventInput = {
  groupId: number;
  userId: number;
  role: "user" | "admin";
  title: string;
  description: string | null;
  eventType: string | null;
  date: string;
  time: string;
  location: string | null;
  capacity: number;
};

export async function createEvent(
  input: CreateEventInput
): Promise<{ id: number }> {
  if (!Number.isInteger(input.groupId) || input.groupId <= 0) {
    throw new EventError("invalid_input");
  }

  const isAdmin = input.role === "admin";
  if (!isAdmin) {
    const [membership] = await db
      .select({ isManager: groupMembers.isManager })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, input.groupId),
          eq(groupMembers.userId, input.userId)
        )
      )
      .limit(1);

    if (!membership || !membership.isManager) {
      throw new EventError("forbidden");
    }
  }

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

  const [created] = await db
    .insert(events)
    .values({
      groupId: input.groupId,
      title,
      description,
      eventType,
      date: input.date,
      time,
      location,
      capacity: input.capacity,
      canceled: false,
      createdBy: input.userId,
    })
    .returning({ id: events.id });

  return { id: created.id };
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
