"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { deleteGroup } from "@/services/groupService";
import { deleteEvent } from "@/services/eventService";

function ensureAdmin() {
  return getCurrentUser().then((user) => {
    if (!user) redirect("/login");
    if (user.role !== "admin") redirect("/dashboard");
    return user;
  });
}

export async function adminDeleteGroupAction(formData: FormData): Promise<void> {
  const user = await ensureAdmin();
  const groupId = Number(formData.get("groupId"));
  if (!Number.isInteger(groupId) || groupId <= 0) return;
  await deleteGroup({ groupId, userId: user.userId, role: user.role });
  revalidatePath("/", "layout");
}

export async function adminDeleteEventAction(formData: FormData): Promise<void> {
  const user = await ensureAdmin();
  const eventId = Number(formData.get("eventId"));
  if (!Number.isInteger(eventId) || eventId <= 0) return;
  const { groupId } = await deleteEvent({
    eventId,
    userId: user.userId,
    role: user.role,
  });
  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/groups/${groupId}`);
  revalidatePath("/", "layout");
}
