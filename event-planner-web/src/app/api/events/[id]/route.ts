import { authenticateRequest } from "@/lib/apiAuth";
import { badRequest, jsonOk, notFound, unauthorized } from "@/lib/apiResponse";
import {
  EventError,
  getEventAttendees,
  getEventComments,
  getEventDetails,
} from "@/services/eventService";
import { getCapacityState, getEventState } from "@/lib/eventState";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = authenticateRequest(req);
  if (!user) return unauthorized();

  const { id } = await params;
  const eventId = Number(id);
  if (!Number.isInteger(eventId) || eventId <= 0) {
    return badRequest("Invalid event id.");
  }

  let event;
  try {
    event = await getEventDetails(eventId, user.userId, user.role);
  } catch (err) {
    if (err instanceof EventError && err.code === "not_found") {
      return notFound("Event not found.");
    }
    throw err;
  }

  const [attendees, comments] = await Promise.all([
    getEventAttendees(eventId),
    getEventComments(eventId),
  ]);

  return jsonOk({
    id: event.id,
    title: event.title,
    description: event.description,
    type: event.eventType,
    date: event.date,
    time: event.time,
    location: event.location,
    capacity: event.capacity,
    canceled: event.canceled,
    state: getEventState(event.date, event.time),
    capacityState: getCapacityState(event.attendees, event.capacity),
    attendeesCount: event.attendees,
    groupId: event.groupId,
    groupTitle: event.groupTitle,
    createdBy: {
      id: event.createdBy,
      name: event.creatorName,
    },
    isRsvped: event.isRsvped,
    userExtraSlots: event.userExtraSlots,
    canManage: event.canManage,
    attendees: attendees.map((a) => ({
      userId: a.userId,
      name: a.name,
      photoUrl: a.photoUrl,
      extraSlots: a.extraSlots,
      rsvpAt: a.rsvpAt,
    })),
    comments: comments.map((c) => ({
      id: c.id,
      text: c.text,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      author: {
        id: c.userId,
        name: c.authorName,
        photoUrl: c.authorPhotoUrl,
      },
    })),
  });
}
