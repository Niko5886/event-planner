import { randomBytes } from "node:crypto";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  events,
  groupInvitations,
  groupMembers,
  groups,
} from "@/db/schema";

export const MAX_GROUP_TITLE_LENGTH = 120;
export const MAX_GROUP_DESCRIPTION_LENGTH = 2000;
export const MIN_GROUP_TITLE_LENGTH = 2;

export type GroupErrorCode =
  | "not_found"
  | "not_member"
  | "already_member"
  | "forbidden"
  | "invalid_input"
  | "input_too_long"
  | "input_too_short";

export class GroupError extends Error {
  constructor(public code: GroupErrorCode) {
    super(code);
    this.name = "GroupError";
  }
}

export type GroupListItem = {
  id: number;
  title: string;
  description: string | null;
  memberCount: number;
  eventCount: number;
  isManager: boolean;
};

export type GroupDetails = {
  id: number;
  title: string;
  description: string | null;
  createdBy: number;
  createdAt: Date;
  isManager: boolean;
  members: Array<{
    userId: number;
    name: string;
    email: string;
    isManager: boolean;
  }>;
  inviteCode: string | null;
};

function generateInviteCode(): string {
  return randomBytes(6).toString("base64url").slice(0, 8);
}

export async function listUserGroups(
  userId: number
): Promise<GroupListItem[]> {
  const rows = await db
    .select({
      id: groups.id,
      title: groups.title,
      description: groups.description,
      isManager: groupMembers.isManager,
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
    .innerJoin(
      groupMembers,
      and(
        eq(groupMembers.groupId, groups.id),
        eq(groupMembers.userId, userId)
      )
    )
    .orderBy(asc(groups.title));

  return rows;
}

export async function listUserGroupsPaged(input: {
  userId: number;
  limit: number;
  offset: number;
}): Promise<{ items: GroupListItem[]; total: number }> {
  const rows = await db
    .select({
      id: groups.id,
      title: groups.title,
      description: groups.description,
      isManager: groupMembers.isManager,
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
    .innerJoin(
      groupMembers,
      and(
        eq(groupMembers.groupId, groups.id),
        eq(groupMembers.userId, input.userId)
      )
    )
    .orderBy(asc(groups.title))
    .limit(input.limit)
    .offset(input.offset);

  const [countRow] = await db
    .select({ total: sql<number>`COUNT(*)::int` })
    .from(groups)
    .innerJoin(
      groupMembers,
      and(
        eq(groupMembers.groupId, groups.id),
        eq(groupMembers.userId, input.userId)
      )
    );

  return { items: rows, total: Number(countRow?.total ?? 0) };
}

export async function createGroup(input: {
  title: string;
  description: string | null;
  createdBy: number;
}): Promise<{ id: number; inviteCode: string }> {
  const title = input.title.trim();
  const description = input.description?.trim() || null;

  if (title.length < MIN_GROUP_TITLE_LENGTH) {
    throw new GroupError("input_too_short");
  }
  if (
    title.length > MAX_GROUP_TITLE_LENGTH ||
    (description && description.length > MAX_GROUP_DESCRIPTION_LENGTH)
  ) {
    throw new GroupError("input_too_long");
  }

  const [created] = await db
    .insert(groups)
    .values({ title, description, createdBy: input.createdBy })
    .returning({ id: groups.id });

  await db.insert(groupMembers).values({
    groupId: created.id,
    userId: input.createdBy,
    isManager: true,
  });

  const inviteCode = generateInviteCode();
  await db.insert(groupInvitations).values({
    groupId: created.id,
    inviteCode,
  });

  return { id: created.id, inviteCode };
}

export async function getGroupDetails(
  groupId: number,
  viewerUserId: number
): Promise<GroupDetails> {
  const [group] = await db
    .select({
      id: groups.id,
      title: groups.title,
      description: groups.description,
      createdBy: groups.createdBy,
      createdAt: groups.createdAt,
    })
    .from(groups)
    .where(eq(groups.id, groupId))
    .limit(1);

  if (!group) {
    throw new GroupError("not_found");
  }

  const memberRows = await db
    .select({
      userId: groupMembers.userId,
      name: sql<string>`u.name`,
      email: sql<string>`u.email`,
      isManager: groupMembers.isManager,
    })
    .from(groupMembers)
    .innerJoin(sql`users u`, sql`u.id = ${groupMembers.userId}`)
    .where(eq(groupMembers.groupId, groupId))
    .orderBy(desc(groupMembers.isManager), asc(sql`u.name`));

  const viewer = memberRows.find((m) => m.userId === viewerUserId);
  if (!viewer) {
    throw new GroupError("not_member");
  }

  let inviteCode: string | null = null;
  if (viewer.isManager) {
    const [invite] = await db
      .select({ code: groupInvitations.inviteCode })
      .from(groupInvitations)
      .where(eq(groupInvitations.groupId, groupId))
      .orderBy(desc(groupInvitations.createdAt))
      .limit(1);
    inviteCode = invite?.code ?? null;
  }

  return {
    ...group,
    isManager: viewer.isManager,
    members: memberRows,
    inviteCode,
  };
}

export async function getGroupByInviteCode(
  code: string
): Promise<{ groupId: number; title: string; description: string | null } | null> {
  const [row] = await db
    .select({
      groupId: groupInvitations.groupId,
      title: groups.title,
      description: groups.description,
    })
    .from(groupInvitations)
    .innerJoin(groups, eq(groups.id, groupInvitations.groupId))
    .where(eq(groupInvitations.inviteCode, code))
    .limit(1);

  return row ?? null;
}

export async function isGroupMember(
  groupId: number,
  userId: number
): Promise<boolean> {
  const [row] = await db
    .select({ id: groupMembers.id })
    .from(groupMembers)
    .where(
      and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId))
    )
    .limit(1);
  return Boolean(row);
}

export async function deleteGroup(input: {
  groupId: number;
  userId: number;
  role: "user" | "admin";
}): Promise<void> {
  const [group] = await db
    .select({ id: groups.id, createdBy: groups.createdBy })
    .from(groups)
    .where(eq(groups.id, input.groupId))
    .limit(1);

  if (!group) {
    throw new GroupError("not_found");
  }

  const isCreator = group.createdBy === input.userId;
  const isAdmin = input.role === "admin";
  if (!isCreator && !isAdmin) {
    throw new GroupError("forbidden");
  }

  await db.delete(groups).where(eq(groups.id, input.groupId));
}

export async function joinGroupByInviteCode(input: {
  code: string;
  userId: number;
}): Promise<{ groupId: number }> {
  const invite = await getGroupByInviteCode(input.code);
  if (!invite) {
    throw new GroupError("not_found");
  }

  const alreadyMember = await isGroupMember(invite.groupId, input.userId);
  if (alreadyMember) {
    throw new GroupError("already_member");
  }

  await db.insert(groupMembers).values({
    groupId: invite.groupId,
    userId: input.userId,
    isManager: false,
  });

  return { groupId: invite.groupId };
}
