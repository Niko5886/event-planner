import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  smallint,
  text,
  time,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    photoUrl: text("photo_url"),
    role: userRoleEnum("role").notNull().default("user"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    emailUnique: uniqueIndex("users_email_unique").on(table.email),
  })
);

export const groups = pgTable(
  "groups",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    createdBy: integer("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    createdByIdx: index("groups_created_by_idx").on(table.createdBy),
  })
);

export const groupMembers = pgTable(
  "group_members",
  {
    id: serial("id").primaryKey(),
    groupId: integer("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    isManager: boolean("is_manager").notNull().default(false),
    joinedAt: timestamp("joined_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    groupUserUnique: uniqueIndex("group_members_group_id_user_id_unique").on(
      table.groupId,
      table.userId
    ),
    groupIdIdx: index("group_members_group_id_idx").on(table.groupId),
    userIdIdx: index("group_members_user_id_idx").on(table.userId),
  })
);

export const events = pgTable(
  "events",
  {
    id: serial("id").primaryKey(),
    groupId: integer("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    eventType: text("event_type"),
    date: date("date").notNull(),
    time: time("time").notNull(),
    location: text("location"),
    capacity: smallint("capacity").notNull().default(12),
    canceled: boolean("canceled").notNull().default(false),
    createdBy: integer("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    groupIdIdx: index("events_group_id_idx").on(table.groupId),
    createdByIdx: index("events_created_by_idx").on(table.createdBy),
    dateTimeIdx: index("events_date_time_idx").on(table.date, table.time),
    canceledIdx: index("events_canceled_idx").on(table.canceled),
    capacityCheck: check("events_capacity_check", sql`${table.capacity} >= 0`),
  })
);

export const eventRsvps = pgTable(
  "event_rsvps",
  {
    id: serial("id").primaryKey(),
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    extraSlots: smallint("extra_slots").notNull().default(0),
    rsvpAt: timestamp("rsvp_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    eventUserUnique: uniqueIndex("event_rsvps_event_id_user_id_unique").on(
      table.eventId,
      table.userId
    ),
    eventIdIdx: index("event_rsvps_event_id_idx").on(table.eventId),
    userIdIdx: index("event_rsvps_user_id_idx").on(table.userId),
    extraSlotsCheck: check(
      "event_rsvps_extra_slots_check",
      sql`${table.extraSlots} between 0 and 3`
    ),
  })
);

export const eventComments = pgTable(
  "event_comments",
  {
    id: serial("id").primaryKey(),
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    eventIdIdx: index("event_comments_event_id_idx").on(table.eventId),
    userIdIdx: index("event_comments_user_id_idx").on(table.userId),
    createdAtIdx: index("event_comments_created_at_idx").on(table.createdAt),
  })
);

export const groupInvitations = pgTable(
  "group_invitations",
  {
    id: serial("id").primaryKey(),
    groupId: integer("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    inviteCode: varchar("invite_code", { length: 64 }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true, mode: "date" }),
    usedByUserId: integer("used_by_user_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    inviteCodeUnique: uniqueIndex("group_invitations_invite_code_unique").on(
      table.inviteCode
    ),
    groupIdIdx: index("group_invitations_group_id_idx").on(table.groupId),
    usedByUserIdIdx: index("group_invitations_used_by_user_id_idx").on(
      table.usedByUserId
    ),
    activeInvitesIdx: index("group_invitations_active_idx")
      .on(table.groupId)
      .where(sql`${table.usedAt} is null`),
  })
);
