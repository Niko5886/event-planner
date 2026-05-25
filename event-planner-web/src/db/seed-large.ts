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
const BCRYPT_ROUNDS = 8;

const TARGET = {
  users: 3000,
  groups: 500,
  eventsPerGroup: 10,
  membersPerGroupMin: 5,
  membersPerGroupMax: 40,
  rsvpsPerEventMin: 0,
  rsvpsPerEventMax: 15,
  commentsPerEventMin: 0,
  commentsPerEventMax: 6,
};

const BATCH = 1000;

const FIRST_NAMES = [
  "Alex", "Maria", "Ivan", "Elena", "Niko", "Sofia", "Dimi", "Kalina",
  "Petar", "Yana", "Borislav", "Mila", "Vlad", "Tina", "Stoyan", "Lora",
  "Georgi", "Vesi", "Krasi", "Rumi", "Mihail", "Desi", "Kostadin", "Nadya",
  "Hristo", "Iva", "Filip", "Lyuba", "Anton", "Daria",
];

const LAST_NAMES = [
  "Ivanov", "Petrov", "Dimitrov", "Georgiev", "Stoyanov", "Nikolov",
  "Hristov", "Iliev", "Kolev", "Todorov", "Marinov", "Pavlov",
  "Vasilev", "Angelov", "Mihaylov", "Stefanov", "Yordanov", "Atanasov",
];

const GROUP_THEMES = [
  ["Runners", "weekly run meetups"],
  ["Hikers", "weekend hikes and trips"],
  ["Foodies", "restaurant nights"],
  ["Cinephiles", "movie nights"],
  ["Boardgamers", "board game evenings"],
  ["Cyclists", "city and trail rides"],
  ["Coders", "code dojo and meetups"],
  ["Photographers", "photowalks"],
  ["Bookworms", "book club sessions"],
  ["Climbers", "climbing meetups"],
];

const CITIES = [
  "Sofia", "Plovdiv", "Varna", "Burgas", "Ruse", "Stara Zagora",
  "Pleven", "Veliko Tarnovo", "Blagoevgrad", "Sliven",
];

const EVENT_TYPES = ["party", "hike", "dinner", "sports", "other"];

const EVENT_TITLES = [
  "Weekly Meetup", "Sunday Outing", "Friday Night", "Casual Hangout",
  "Workshop", "Group Practice", "Special Event", "Quick Catchup",
  "Monthly Gathering", "Open Session",
];

const COMMENT_TEMPLATES = [
  "I'll be there!",
  "Looking forward to it.",
  "Is there parking nearby?",
  "Can I bring a friend?",
  "Count me in.",
  "Sorry, will arrive 15 min late.",
  "What should I bring?",
  "Awesome, see you there!",
  "First time joining — excited!",
  "Anyone need a ride?",
];

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function formatDateOffset(daysFromToday: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysFromToday);
  return d.toISOString().slice(0, 10);
}

function generateInviteCode(): string {
  return randomBytes(6).toString("base64url").slice(0, 8);
}

async function insertInBatches<T>(
  rows: T[],
  insertFn: (batch: T[]) => Promise<void>
): Promise<void> {
  for (let i = 0; i < rows.length; i += BATCH) {
    const slice = rows.slice(i, i + BATCH);
    await insertFn(slice);
    process.stdout.write(
      `   …${Math.min(i + BATCH, rows.length).toLocaleString()} / ${rows.length.toLocaleString()}\r`
    );
  }
  process.stdout.write("\n");
}

async function seedLarge() {
  console.log("🌱 Large-scale seed starting…");
  console.log(`   Target: ${TARGET.users} users, ${TARGET.groups} groups, ~${TARGET.groups * TARGET.eventsPerGroup} events`);

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

  console.log("🔐 Hashing password (one shared bcrypt hash for all seed users)…");
  const passwordHash = await bcrypt.hash(PASSWORD, BCRYPT_ROUNDS);

  // ---------- USERS ----------
  console.log(`👤 Inserting ${TARGET.users} users…`);

  const fixedUsers = [
    { name: "Admin", email: "admin@demo.com", role: "admin" as const },
    { name: "Manager", email: "manager@demo.com", role: "user" as const },
    { name: "Member", email: "member@demo.com", role: "user" as const },
  ];

  const usedEmails = new Set(fixedUsers.map((u) => u.email));
  const generatedUsers: Array<{
    name: string;
    email: string;
    role: "user" | "admin";
  }> = [];
  let suffix = 1;
  while (generatedUsers.length < TARGET.users - fixedUsers.length) {
    const fn = pick(FIRST_NAMES);
    const ln = pick(LAST_NAMES);
    const name = `${fn} ${ln}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${suffix}@example.com`;
    suffix++;
    if (usedEmails.has(email)) continue;
    usedEmails.add(email);
    generatedUsers.push({ name, email, role: "user" });
  }

  const allUsers = [...fixedUsers, ...generatedUsers];
  const userRows = allUsers.map((u) => ({
    name: u.name,
    email: u.email,
    passwordHash,
    role: u.role,
  }));

  const insertedUserIds: number[] = [];
  await insertInBatches(userRows, async (batch) => {
    const ret = await db.insert(users).values(batch).returning({ id: users.id });
    ret.forEach((r) => insertedUserIds.push(r.id));
  });

  const adminId = insertedUserIds[0];
  const managerId = insertedUserIds[1];
  const memberId = insertedUserIds[2];
  const allUserIds = insertedUserIds;

  // ---------- GROUPS ----------
  console.log(`👥 Inserting ${TARGET.groups} groups…`);
  const groupRows = Array.from({ length: TARGET.groups }, (_, i) => {
    const [theme, desc] = pick(GROUP_THEMES);
    const city = pick(CITIES);
    return {
      title: `${city} ${theme} #${i + 1}`,
      description: `${city} group for ${desc}`,
      createdBy: allUserIds[rand(0, allUserIds.length - 1)],
    };
  });

  // ensure manager@demo.com is the creator of group #4 (a known demo group)
  groupRows[3] = {
    title: "Team Runners Demo",
    description: "demo group managed by manager@demo.com",
    createdBy: managerId,
  };

  const insertedGroupIds: number[] = [];
  await insertInBatches(groupRows, async (batch) => {
    const ret = await db.insert(groups).values(batch).returning({ id: groups.id });
    ret.forEach((r) => insertedGroupIds.push(r.id));
  });

  // ---------- GROUP MEMBERS ----------
  console.log("🪪 Inserting group members…");
  type MemberRow = { groupId: number; userId: number; isManager: boolean };
  const memberRows: MemberRow[] = [];
  // map groupId → set of userIds (to avoid duplicates)
  const groupMembersMap = new Map<number, Set<number>>();

  for (let i = 0; i < insertedGroupIds.length; i++) {
    const groupId = insertedGroupIds[i];
    const creatorId = groupRows[i].createdBy;
    const memberSet = new Set<number>();
    memberSet.add(creatorId);
    memberRows.push({ groupId, userId: creatorId, isManager: true });

    const targetCount = rand(TARGET.membersPerGroupMin, TARGET.membersPerGroupMax);
    while (memberSet.size < targetCount) {
      const uid = allUserIds[rand(0, allUserIds.length - 1)];
      if (!memberSet.has(uid)) {
        memberSet.add(uid);
        memberRows.push({ groupId, userId: uid, isManager: false });
      }
    }
    groupMembersMap.set(groupId, memberSet);
  }

  // ensure demo accounts are in a few groups
  const demoMembershipTargets = insertedGroupIds.slice(0, 5);
  for (const groupId of demoMembershipTargets) {
    const set = groupMembersMap.get(groupId)!;
    for (const uid of [memberId, managerId]) {
      if (!set.has(uid)) {
        set.add(uid);
        memberRows.push({ groupId, userId: uid, isManager: uid === managerId });
      }
    }
  }

  await insertInBatches(memberRows, async (batch) => {
    await db.insert(groupMembers).values(batch);
  });

  // ---------- INVITATIONS ----------
  console.log("🎟️ Inserting group invitations…");
  const inviteRows = insertedGroupIds.map((groupId) => ({
    groupId,
    inviteCode: generateInviteCode(),
  }));
  await insertInBatches(inviteRows, async (batch) => {
    await db.insert(groupInvitations).values(batch);
  });

  // ---------- EVENTS ----------
  console.log(`📅 Inserting ${TARGET.groups * TARGET.eventsPerGroup} events…`);
  type EventRow = {
    groupId: number;
    title: string;
    description: string | null;
    eventType: string;
    date: string;
    time: string;
    location: string;
    capacity: number;
    canceled: boolean;
    createdBy: number;
  };
  const eventRows: EventRow[] = [];

  for (let i = 0; i < insertedGroupIds.length; i++) {
    const groupId = insertedGroupIds[i];
    const creatorId = groupRows[i].createdBy;
    for (let j = 0; j < TARGET.eventsPerGroup; j++) {
      // mix of past (60%) and future (40%) events for realistic state distribution
      const isPast = Math.random() < 0.6;
      const daysOffset = isPast ? -rand(1, 365) : rand(1, 60);
      const hour = rand(8, 21);
      const minute = pick([0, 15, 30, 45]);
      const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
      eventRows.push({
        groupId,
        title: `${pick(EVENT_TITLES)} #${j + 1}`,
        description: Math.random() < 0.5 ? `Join us — ${pick(EVENT_TYPES)} session.` : null,
        eventType: pick(EVENT_TYPES),
        date: formatDateOffset(daysOffset),
        time,
        location: `${pick(["Cafe", "Hall", "Park", "Stadium", "Bar"])}, ${pick(CITIES)}`,
        capacity: pick([8, 10, 12, 15, 20, 30]),
        canceled: Math.random() < 0.05,
        createdBy: creatorId,
      });
    }
  }

  const insertedEventIds: number[] = [];
  const eventGroupMap: number[] = []; // index → groupId
  await insertInBatches(eventRows, async (batch) => {
    const ret = await db.insert(events).values(batch).returning({
      id: events.id,
      groupId: events.groupId,
    });
    ret.forEach((r) => {
      insertedEventIds.push(r.id);
      eventGroupMap.push(r.groupId);
    });
  });

  // ---------- RSVPs ----------
  console.log("✋ Inserting RSVPs…");
  type RsvpRow = { eventId: number; userId: number; extraSlots: number };
  const rsvpRows: RsvpRow[] = [];

  for (let i = 0; i < insertedEventIds.length; i++) {
    const eventId = insertedEventIds[i];
    const groupId = eventGroupMap[i];
    const memberIds = Array.from(groupMembersMap.get(groupId) ?? []);
    if (memberIds.length === 0) continue;
    const targetCount = Math.min(
      memberIds.length,
      rand(TARGET.rsvpsPerEventMin, TARGET.rsvpsPerEventMax)
    );
    const chosen = shuffle(memberIds).slice(0, targetCount);
    for (const userId of chosen) {
      rsvpRows.push({
        eventId,
        userId,
        extraSlots: Math.random() < 0.2 ? rand(1, 3) : 0,
      });
    }
  }

  await insertInBatches(rsvpRows, async (batch) => {
    await db.insert(eventRsvps).values(batch);
  });

  // ---------- COMMENTS ----------
  console.log("💬 Inserting comments…");
  type CommentRow = { eventId: number; userId: number; text: string };
  const commentRows: CommentRow[] = [];

  for (let i = 0; i < insertedEventIds.length; i++) {
    const eventId = insertedEventIds[i];
    const groupId = eventGroupMap[i];
    const memberIds = Array.from(groupMembersMap.get(groupId) ?? []);
    if (memberIds.length === 0) continue;
    const count = rand(TARGET.commentsPerEventMin, TARGET.commentsPerEventMax);
    for (let c = 0; c < count; c++) {
      commentRows.push({
        eventId,
        userId: memberIds[rand(0, memberIds.length - 1)],
        text: pick(COMMENT_TEMPLATES),
      });
    }
  }

  await insertInBatches(commentRows, async (batch) => {
    await db.insert(eventComments).values(batch);
  });

  // ---------- SUMMARY ----------
  console.log("");
  console.log(`✅ ${userRows.length.toLocaleString()} users`);
  console.log(`✅ ${groupRows.length.toLocaleString()} groups`);
  console.log(`✅ ${memberRows.length.toLocaleString()} group members`);
  console.log(`✅ ${eventRows.length.toLocaleString()} events`);
  console.log(`✅ ${rsvpRows.length.toLocaleString()} RSVPs`);
  console.log(`✅ ${commentRows.length.toLocaleString()} comments`);
  console.log(`📊 Total: ${(
    userRows.length + groupRows.length + memberRows.length +
    eventRows.length + rsvpRows.length + commentRows.length
  ).toLocaleString()} records`);
  console.log("🎉 Done.");
}

seedLarge()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
