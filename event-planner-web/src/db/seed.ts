import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { db } from "./index";
import {
  eventComments,
  eventRsvps,
  events,
  groupInvitations,
  groupMembers,
  groups,
  users,
} from "./schema";

const PASSWORD = "demo123";
const BCRYPT_ROUNDS = 10;

type UserSeed = {
  name: string;
  email: string;
  role: "user" | "admin";
};

const USER_SEEDS: UserSeed[] = [
  { name: "Admin", email: "admin@demo.com", role: "admin" },
  { name: "Manager", email: "manager@demo.com", role: "user" },
  { name: "Member", email: "member@demo.com", role: "user" },
  { name: "Alice", email: "alice@gmail.com", role: "user" },
  { name: "Bob", email: "bob@gmail.com", role: "user" },
  { name: "Carol", email: "carol@gmail.com", role: "user" },
  { name: "Dave", email: "dave@gmail.com", role: "user" },
  { name: "Eva", email: "eva@gmail.com", role: "user" },
  ...Array.from({ length: 9 }, (_, i) => ({
    name: `User ${i + 1}`,
    email: `user${i + 1}@gmail.com`,
    role: "user" as const,
  })),
];

type GroupSeed = {
  title: string;
  description: string;
  managerEmail: string;
  memberEmails: string[];
  managerEmails: string[];
};

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => `user${from + i}@gmail.com`);

const GROUP_SEEDS: GroupSeed[] = [
  {
    title: "City Explorers",
    description: "a group for exploring the city together",
    managerEmail: "alice@gmail.com",
    memberEmails: [
      "alice@gmail.com",
      "carol@gmail.com",
      "dave@gmail.com",
      "eva@gmail.com",
      ...range(1, 9),
    ],
    managerEmails: ["alice@gmail.com"],
  },
  {
    title: "Weekend Wanderers",
    description: "a group for weekend outdoor activities",
    managerEmail: "alice@gmail.com",
    memberEmails: [
      "alice@gmail.com",
      "bob@gmail.com",
      "dave@gmail.com",
      "eva@gmail.com",
      ...range(1, 9),
    ],
    managerEmails: ["alice@gmail.com", "bob@gmail.com"],
  },
  {
    title: "Foodies United",
    description: "a group for restaurant visits and dinner events",
    managerEmail: "bob@gmail.com",
    memberEmails: [
      "bob@gmail.com",
      "carol@gmail.com",
      "eva@gmail.com",
      ...range(1, 5),
    ],
    managerEmails: ["bob@gmail.com"],
  },
];

type EventSeed = {
  groupTitle: string;
  title: string;
  description: string | null;
  eventType: string;
  daysFromToday: number;
  hour: number;
  minute: number;
  location: string;
  capacity: number;
};

const EVENT_SEEDS: EventSeed[] = [
  {
    groupTitle: "City Explorers",
    title: "Sunset Rooftop Gathering",
    description: null,
    eventType: "party",
    daysFromToday: 3,
    hour: 19,
    minute: 30,
    location: "Sky Bar, Sofia",
    capacity: 12,
  },
  {
    groupTitle: "City Explorers",
    title: "Old Town Walking Tour",
    description: null,
    eventType: "hike",
    daysFromToday: 6,
    hour: 10,
    minute: 0,
    location: "Largo, Sofia",
    capacity: 15,
  },
  {
    groupTitle: "City Explorers",
    title: "Summer Picnic in the Park",
    description: null,
    eventType: "other",
    daysFromToday: -20,
    hour: 12,
    minute: 0,
    location: "South Park, Sofia",
    capacity: 20,
  },
  {
    groupTitle: "Weekend Wanderers",
    title: "Vitosha Mountain Hike",
    description: null,
    eventType: "hike",
    daysFromToday: 5,
    hour: 9,
    minute: 0,
    location: "Aleko Hut, Vitosha",
    capacity: 10,
  },
  {
    groupTitle: "Weekend Wanderers",
    title: "Plovdiv Day Trip",
    description: null,
    eventType: "other",
    daysFromToday: -30,
    hour: 8,
    minute: 30,
    location: "Old Town, Plovdiv",
    capacity: 12,
  },
  {
    groupTitle: "Foodies United",
    title: "Italian Night at La Piazza",
    description: null,
    eventType: "dinner",
    daysFromToday: 4,
    hour: 20,
    minute: 0,
    location: "La Piazza Restaurant, Sofia",
    capacity: 8,
  },
  {
    groupTitle: "Foodies United",
    title: "Sushi Evening",
    description: null,
    eventType: "dinner",
    daysFromToday: -10,
    hour: 19,
    minute: 30,
    location: "Sushi Bar Sakura, Sofia",
    capacity: 10,
  },
];

type RsvpSeed = {
  eventTitle: string;
  userEmails: string[];
  extraSlots?: Record<string, number>;
};

const RSVP_SEEDS: RsvpSeed[] = [
  {
    eventTitle: "Sunset Rooftop Gathering",
    userEmails: [
      "alice@gmail.com",
      "carol@gmail.com",
      "dave@gmail.com",
      "user1@gmail.com",
      "user2@gmail.com",
      "user3@gmail.com",
    ],
    extraSlots: { "alice@gmail.com": 1 },
  },
  {
    eventTitle: "Old Town Walking Tour",
    userEmails: [
      "alice@gmail.com",
      "eva@gmail.com",
      "user2@gmail.com",
      "user4@gmail.com",
      "user5@gmail.com",
      "user6@gmail.com",
      "user7@gmail.com",
    ],
  },
  {
    eventTitle: "Vitosha Mountain Hike",
    userEmails: [
      "alice@gmail.com",
      "bob@gmail.com",
      "dave@gmail.com",
      "user1@gmail.com",
      "user3@gmail.com",
    ],
    extraSlots: { "bob@gmail.com": 2 },
  },
  {
    eventTitle: "Italian Night at La Piazza",
    userEmails: [
      "bob@gmail.com",
      "carol@gmail.com",
      "eva@gmail.com",
      "user1@gmail.com",
    ],
    extraSlots: { "eva@gmail.com": 1 },
  },
  {
    eventTitle: "Summer Picnic in the Park",
    userEmails: [
      "alice@gmail.com",
      "carol@gmail.com",
      "dave@gmail.com",
      "eva@gmail.com",
      ...range(1, 6),
    ],
  },
  {
    eventTitle: "Plovdiv Day Trip",
    userEmails: [
      "alice@gmail.com",
      "bob@gmail.com",
      "dave@gmail.com",
      "user2@gmail.com",
      "user3@gmail.com",
      "user4@gmail.com",
      "user5@gmail.com",
    ],
  },
  {
    eventTitle: "Sushi Evening",
    userEmails: [
      "bob@gmail.com",
      "carol@gmail.com",
      "eva@gmail.com",
      "user1@gmail.com",
      "user2@gmail.com",
      "user3@gmail.com",
    ],
  },
];

type CommentSeed = {
  eventTitle: string;
  comments: Array<{ email: string; text: string }>;
};

const COMMENT_SEEDS: CommentSeed[] = [
  {
    eventTitle: "Sunset Rooftop Gathering",
    comments: [
      { email: "alice@gmail.com", text: "Can't wait – the view from up there is amazing! 🌇" },
      { email: "carol@gmail.com", text: "Should we bring anything to drink?" },
      { email: "dave@gmail.com", text: "I'll be there! Bringing my camera." },
      { email: "user1@gmail.com", text: "Is there parking nearby?" },
    ],
  },
  {
    eventTitle: "Old Town Walking Tour",
    comments: [
      { email: "eva@gmail.com", text: "Perfect timing for spring – the flowers are blooming!" },
      { email: "user2@gmail.com", text: "How long is the walk approximately?" },
      { email: "alice@gmail.com", text: "Wear comfortable shoes everyone 👟" },
    ],
  },
  {
    eventTitle: "Vitosha Mountain Hike",
    comments: [
      { email: "bob@gmail.com", text: "Checking the weather – looks clear for Saturday!" },
      { email: "dave@gmail.com", text: "Anyone need a ride from the city center?" },
      { email: "user3@gmail.com", text: "What's the difficulty level?" },
      { email: "alice@gmail.com", text: "Moderate – suitable for everyone 🏔️" },
    ],
  },
  {
    eventTitle: "Italian Night at La Piazza",
    comments: [
      { email: "carol@gmail.com", text: "I've heard their pasta is incredible 🍝" },
      { email: "eva@gmail.com", text: "Should we book the big table?" },
      { email: "bob@gmail.com", text: "Already reserved for 8 – we're all set!" },
    ],
  },
  {
    eventTitle: "Summer Picnic in the Park",
    comments: [
      { email: "alice@gmail.com", text: "That was such a great afternoon ☀️" },
      { email: "user4@gmail.com", text: "We should do this every month!" },
      { email: "carol@gmail.com", text: "The food was amazing – great job everyone" },
    ],
  },
  {
    eventTitle: "Plovdiv Day Trip",
    comments: [
      { email: "bob@gmail.com", text: "Old Town Plovdiv never disappoints 🏛️" },
      { email: "dave@gmail.com", text: "Next time we should stay overnight" },
      { email: "user2@gmail.com", text: "Loved the art galleries!" },
    ],
  },
  {
    eventTitle: "Sushi Evening",
    comments: [
      { email: "eva@gmail.com", text: "Best sushi in Sofia, hands down 🍣" },
      { email: "carol@gmail.com", text: "Already looking forward to the next one" },
      { email: "user1@gmail.com", text: "Can we make this a monthly tradition?" },
    ],
  },
];

function formatDate(daysFromToday: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysFromToday);
  return d.toISOString().slice(0, 10);
}

function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
}

function generateInviteCode(): string {
  return randomBytes(6).toString("base64url").slice(0, 8);
}

async function seed() {
  console.log("🌱 Starting seed…");

  console.log("🧹 Truncating tables…");
  await db.execute(sql`
    TRUNCATE TABLE
      event_comments,
      event_rsvps,
      group_invitations,
      events,
      group_members,
      groups,
      users
    RESTART IDENTITY CASCADE
  `);

  console.log("🔐 Hashing passwords…");
  const passwordHash = await bcrypt.hash(PASSWORD, BCRYPT_ROUNDS);

  console.log("👤 Inserting users…");
  const insertedUsers = await db
    .insert(users)
    .values(
      USER_SEEDS.map((u) => ({
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
      }))
    )
    .returning({ id: users.id, email: users.email });

  const userIdByEmail = new Map(insertedUsers.map((u) => [u.email, u.id]));

  console.log("👥 Inserting groups…");
  const insertedGroups = await db
    .insert(groups)
    .values(
      GROUP_SEEDS.map((g) => ({
        title: g.title,
        description: g.description,
        createdBy: userIdByEmail.get(g.managerEmail)!,
      }))
    )
    .returning({ id: groups.id, title: groups.title });

  const groupIdByTitle = new Map(insertedGroups.map((g) => [g.title, g.id]));

  console.log("🪪 Inserting group members…");
  const memberRows = GROUP_SEEDS.flatMap((g) => {
    const groupId = groupIdByTitle.get(g.title)!;
    const managerSet = new Set(g.managerEmails);
    return g.memberEmails.map((email) => ({
      groupId,
      userId: userIdByEmail.get(email)!,
      isManager: managerSet.has(email),
    }));
  });
  await db.insert(groupMembers).values(memberRows);

  console.log("🎟️ Inserting group invitations…");
  await db.insert(groupInvitations).values(
    insertedGroups.map((g) => ({
      groupId: g.id,
      inviteCode: generateInviteCode(),
    }))
  );

  console.log("📅 Inserting events…");
  const insertedEvents = await db
    .insert(events)
    .values(
      EVENT_SEEDS.map((e) => ({
        groupId: groupIdByTitle.get(e.groupTitle)!,
        title: e.title,
        description: e.description,
        eventType: e.eventType,
        date: formatDate(e.daysFromToday),
        time: formatTime(e.hour, e.minute),
        location: e.location,
        capacity: e.capacity,
        createdBy: userIdByEmail.get(
          GROUP_SEEDS.find((g) => g.title === e.groupTitle)!.managerEmail
        )!,
      }))
    )
    .returning({ id: events.id, title: events.title });

  const eventIdByTitle = new Map(insertedEvents.map((e) => [e.title, e.id]));

  console.log("✋ Inserting RSVPs…");
  const rsvpRows = RSVP_SEEDS.flatMap((r) => {
    const eventId = eventIdByTitle.get(r.eventTitle)!;
    return r.userEmails.map((email) => ({
      eventId,
      userId: userIdByEmail.get(email)!,
      extraSlots: r.extraSlots?.[email] ?? 0,
    }));
  });
  await db.insert(eventRsvps).values(rsvpRows);

  console.log("💬 Inserting comments…");
  const commentRows = COMMENT_SEEDS.flatMap((c) => {
    const eventId = eventIdByTitle.get(c.eventTitle)!;
    return c.comments.map((comment) => ({
      eventId,
      userId: userIdByEmail.get(comment.email)!,
      text: comment.text,
    }));
  });
  await db.insert(eventComments).values(commentRows);

  console.log("");
  console.log(`✅ Seeded ${insertedUsers.length} users`);
  console.log(`✅ Seeded ${insertedGroups.length} groups`);
  console.log(`✅ Seeded ${insertedEvents.length} events`);
  console.log(`✅ Seeded ${rsvpRows.length} RSVPs`);
  console.log(`✅ Seeded ${commentRows.length} comments`);
  console.log(`✅ Seeded ${insertedGroups.length} group invitation codes`);
  console.log(`🎉 Database seeded successfully!`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
