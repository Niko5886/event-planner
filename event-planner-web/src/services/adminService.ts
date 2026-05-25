import { asc, desc, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  eventComments,
  eventRsvps,
  events,
  groupMembers,
  groups,
  users,
} from "@/db/schema";
import type { EventSort } from "./eventService";
import type { GroupSort } from "./groupService";

const adminEventCityExpr = sql<string>`LOWER(TRIM(REGEXP_REPLACE(COALESCE(${events.location}, ''), '^.*,', '')))`;

function adminEventOrderBy(sort: EventSort) {
  const dateOrder = [desc(events.date), desc(events.time)];
  if (sort === "city") return [sql`${adminEventCityExpr} ASC`, ...dateOrder];
  if (sort === "title") return [asc(events.title), ...dateOrder];
  return dateOrder;
}

function adminGroupOrderBy(_sort: GroupSort) {
  return [asc(groups.title)];
}

export type AdminOverview = {
  users: number;
  groups: number;
  events: number;
  rsvps: number;
  comments: number;
};

export type AdminUserItem = {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: Date;
};

export type AdminGroupItem = {
  id: number;
  title: string;
  description: string | null;
  createdByName: string;
  createdAt: Date;
  memberCount: number;
  eventCount: number;
};

export type AdminEventItem = {
  id: number;
  title: string;
  date: string;
  time: string;
  canceled: boolean;
  capacity: number;
  attendees: number;
  groupTitle: string;
  createdByName: string;
};

const attendeesExpr = sql<number>`COALESCE((
  SELECT SUM(1 + ${eventRsvps.extraSlots})::int
  FROM ${eventRsvps}
  WHERE ${eventRsvps.eventId} = ${events.id}
), 0)`;

export async function getAdminOverview(): Promise<AdminOverview> {
  const [usersRow] = await db.select({ total: sql<number>`COUNT(*)::int` }).from(users);
  const [groupsRow] = await db.select({ total: sql<number>`COUNT(*)::int` }).from(groups);
  const [eventsRow] = await db.select({ total: sql<number>`COUNT(*)::int` }).from(events);
  const [rsvpsRow] = await db.select({ total: sql<number>`COUNT(*)::int` }).from(eventRsvps);
  const [commentsRow] = await db.select({ total: sql<number>`COUNT(*)::int` }).from(eventComments);

  return {
    users: Number(usersRow?.total ?? 0),
    groups: Number(groupsRow?.total ?? 0),
    events: Number(eventsRow?.total ?? 0),
    rsvps: Number(rsvpsRow?.total ?? 0),
    comments: Number(commentsRow?.total ?? 0),
  };
}

export async function listAdminUsers(limit = 20): Promise<AdminUserItem[]> {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(limit);
}

export async function listAdminUsersPaged(input: {
  limit: number;
  offset: number;
}): Promise<{ items: AdminUserItem[]; total: number }> {
  const items = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(input.limit)
    .offset(input.offset);

  const [countRow] = await db
    .select({ total: sql<number>`COUNT(*)::int` })
    .from(users);

  return { items, total: Number(countRow?.total ?? 0) };
}

export async function listAdminGroups(limit = 20): Promise<AdminGroupItem[]> {
  return db
    .select({
      id: groups.id,
      title: groups.title,
      description: groups.description,
      createdAt: groups.createdAt,
      createdByName: users.name,
      memberCount: sql<number>`(
        SELECT COUNT(*)::int FROM ${groupMembers}
        WHERE ${groupMembers.groupId} = ${groups.id}
      )`,
      eventCount: sql<number>`(
        SELECT COUNT(*)::int FROM ${events}
        WHERE ${events.groupId} = ${groups.id}
      )`,
    })
    .from(groups)
    .innerJoin(users, sql`${users.id} = ${groups.createdBy}`)
    .orderBy(desc(groups.createdAt))
    .limit(limit);
}

export async function listAdminGroupsPaged(input: {
  limit: number;
  offset: number;
  sort?: GroupSort;
}): Promise<{ items: AdminGroupItem[]; total: number }> {
  const items = await db
    .select({
      id: groups.id,
      title: groups.title,
      description: groups.description,
      createdAt: groups.createdAt,
      createdByName: users.name,
      memberCount: sql<number>`(
        SELECT COUNT(*)::int FROM ${groupMembers}
        WHERE ${groupMembers.groupId} = ${groups.id}
      )`,
      eventCount: sql<number>`(
        SELECT COUNT(*)::int FROM ${events}
        WHERE ${events.groupId} = ${groups.id}
      )`,
    })
    .from(groups)
    .innerJoin(users, sql`${users.id} = ${groups.createdBy}`)
    .orderBy(...adminGroupOrderBy(input.sort ?? "title"))
    .limit(input.limit)
    .offset(input.offset);

  const [countRow] = await db
    .select({ total: sql<number>`COUNT(*)::int` })
    .from(groups);

  return { items, total: Number(countRow?.total ?? 0) };
}

export async function listAdminEvents(limit = 20): Promise<AdminEventItem[]> {
  return db
    .select({
      id: events.id,
      title: events.title,
      date: events.date,
      time: events.time,
      canceled: events.canceled,
      capacity: events.capacity,
      attendees: attendeesExpr,
      groupTitle: groups.title,
      createdByName: users.name,
    })
    .from(events)
    .innerJoin(groups, sql`${groups.id} = ${events.groupId}`)
    .innerJoin(users, sql`${users.id} = ${events.createdBy}`)
    .orderBy(desc(events.date), desc(events.time))
    .limit(limit);
}

export async function listAdminEventsPaged(input: {
  limit: number;
  offset: number;
  sort?: EventSort;
}): Promise<{ items: AdminEventItem[]; total: number }> {
  const items = await db
    .select({
      id: events.id,
      title: events.title,
      date: events.date,
      time: events.time,
      canceled: events.canceled,
      capacity: events.capacity,
      attendees: attendeesExpr,
      groupTitle: groups.title,
      createdByName: users.name,
    })
    .from(events)
    .innerJoin(groups, sql`${groups.id} = ${events.groupId}`)
    .innerJoin(users, sql`${users.id} = ${events.createdBy}`)
    .orderBy(...adminEventOrderBy(input.sort ?? "date"))
    .limit(input.limit)
    .offset(input.offset);

  const [countRow] = await db
    .select({ total: sql<number>`COUNT(*)::int` })
    .from(events);

  return { items, total: Number(countRow?.total ?? 0) };
}
