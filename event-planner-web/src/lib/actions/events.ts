"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import {
  EventError,
  deleteEvent,
  leaveEvent,
  rsvpToEvent,
  updateRsvpSlots,
  updateEvent,
} from "@/services/eventService";

export type EventActionState = {
  error: string | null;
  success?: string | null;
};

const EVENT_ERROR_MESSAGES: Record<string, string> = {
  not_found: "Event not found.",
  forbidden: "You don't have permission to perform this action.",
  already_rsvped: "You are already signed up for this event.",
  not_rsvped: "You are not signed up for this event.",
  event_closed: "This event has already ended or has been canceled.",
  invalid_input: "Invalid event data.",
};

function mapEventError(err: unknown): string {
  if (err instanceof EventError) {
    return EVENT_ERROR_MESSAGES[err.code] ?? "Something went wrong.";
  }
  throw err;
}

export async function rsvpEventAction(
  _prev: EventActionState,
  formData: FormData
): Promise<EventActionState> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const eventId = Number(formData.get("eventId"));
  const extraRaw = String(formData.get("extraSlots") ?? "0");
  const extraSlots = extraRaw ? Number(extraRaw) : 0;
  if (!Number.isInteger(eventId) || eventId <= 0) {
    return { error: "Invalid event." };
  }

  try {
    await rsvpToEvent({ eventId, userId: user.userId, extraSlots });
  } catch (err) {
    return { error: mapEventError(err) };
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/dashboard");
  return { error: null, success: "You're signed up for this event." };
}

export async function updateSlotsAction(
  _prev: EventActionState,
  formData: FormData
): Promise<EventActionState> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const eventId = Number(formData.get("eventId"));
  const extraRaw = String(formData.get("extraSlots") ?? "0");
  const extraSlots = extraRaw ? Number(extraRaw) : 0;
  if (!Number.isInteger(eventId) || eventId <= 0) {
    return { error: "Invalid event." };
  }

  try {
    await updateRsvpSlots({ eventId, userId: user.userId, extraSlots });
  } catch (err) {
    return { error: mapEventError(err) };
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/dashboard");
  return { error: null, success: "Updated guest slots." };
}

export async function leaveEventAction(
  _prev: EventActionState,
  formData: FormData
): Promise<EventActionState> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const eventId = Number(formData.get("eventId"));
  if (!Number.isInteger(eventId) || eventId <= 0) {
    return { error: "Invalid event." };
  }

  try {
    await leaveEvent({ eventId, userId: user.userId });
  } catch (err) {
    return { error: mapEventError(err) };
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/dashboard");
  return { error: null, success: "You've left this event." };
}

export async function updateEventAction(
  _prev: EventActionState,
  formData: FormData
): Promise<EventActionState> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const eventId = Number(formData.get("eventId"));
  if (!Number.isInteger(eventId) || eventId <= 0) {
    return { error: "Invalid event." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const eventType = String(formData.get("eventType") ?? "").trim() || null;
  const date = String(formData.get("date") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim() || null;
  const capacityRaw = String(formData.get("capacity") ?? "").trim();
  const capacity = capacityRaw ? Number(capacityRaw) : NaN;
  const canceled = formData.get("canceled") === "on";

  if (!title) {
    return { error: "Please enter an event title." };
  }
  if (!date || !time) {
    return { error: "Please provide both date and time." };
  }
  if (!Number.isFinite(capacity)) {
    return { error: "Invalid capacity." };
  }

  try {
    await updateEvent({
      eventId,
      userId: user.userId,
      role: user.role,
      title,
      description,
      eventType,
      date,
      time,
      location,
      capacity,
      canceled,
    });
  } catch (err) {
    return { error: mapEventError(err) };
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/dashboard");
  redirect(`/events/${eventId}`);
}

export async function deleteEventAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const eventId = Number(formData.get("eventId"));
  if (!Number.isInteger(eventId) || eventId <= 0) {
    redirect("/dashboard");
  }

  let groupId: number | null = null;
  try {
    const result = await deleteEvent({
      eventId,
      userId: user.userId,
      role: user.role,
    });
    groupId = result.groupId;
  } catch (err) {
    if (err instanceof EventError) {
      redirect(`/events/${eventId}?error=${encodeURIComponent(err.code)}`);
    }
    throw err;
  }

  revalidatePath("/dashboard");
  if (groupId) {
    revalidatePath(`/groups/${groupId}`);
    redirect(`/groups/${groupId}`);
  }
  redirect("/dashboard");
}
