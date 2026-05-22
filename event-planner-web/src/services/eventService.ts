import { and, asc, desc, eq, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { eventRsvps, events, groupMembers, groups } from "@/db/schema";

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
