"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import {
  GroupError,
  MAX_GROUP_DESCRIPTION_LENGTH,
  MAX_GROUP_TITLE_LENGTH,
  createGroup,
  deleteGroup,
  joinGroupByInviteCode,
} from "@/services/groupService";

export type GroupFormState = {
  error: string | null;
};

export async function createGroupAction(
  _prev: GroupFormState,
  formData: FormData
): Promise<GroupFormState> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!title) {
    return { error: "Моля въведи име на групата." };
  }
  if (title.length < 2) {
    return { error: "Името трябва да е поне 2 символа." };
  }
  if (
    title.length > MAX_GROUP_TITLE_LENGTH ||
    (description && description.length > MAX_GROUP_DESCRIPTION_LENGTH)
  ) {
    return { error: "Едно от полетата е твърде дълго." };
  }

  let created;
  try {
    created = await createGroup({
      title,
      description,
      createdBy: user.userId,
    });
  } catch (err) {
    if (err instanceof GroupError) {
      return { error: "Невалидни данни за групата." };
    }
    throw err;
  }

  revalidatePath("/groups");
  redirect(`/groups/${created.id}`);
}

export async function deleteGroupAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const groupId = Number(formData.get("groupId"));
  if (!Number.isInteger(groupId) || groupId <= 0) {
    redirect("/groups");
  }

  try {
    await deleteGroup({
      groupId,
      userId: user.userId,
      role: user.role,
    });
  } catch (err) {
    if (err instanceof GroupError) {
      if (err.code === "not_found" || err.code === "forbidden") {
        redirect("/groups");
      }
    }
    throw err;
  }

  revalidatePath("/groups");
  revalidatePath("/dashboard");
  redirect("/groups");
}

export async function joinGroupAction(
  _prev: GroupFormState,
  formData: FormData
): Promise<GroupFormState> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const code = String(formData.get("code") ?? "").trim();
  if (!code) {
    return { error: "Липсва код за покана." };
  }

  let result;
  try {
    result = await joinGroupByInviteCode({ code, userId: user.userId });
  } catch (err) {
    if (err instanceof GroupError) {
      if (err.code === "not_found") {
        return { error: "Невалиден код за покана." };
      }
      if (err.code === "already_member") {
        return { error: "Вече си член на тази група." };
      }
    }
    throw err;
  }

  revalidatePath("/groups");
  revalidatePath("/dashboard");
  redirect(`/groups/${result.groupId}`);
}
