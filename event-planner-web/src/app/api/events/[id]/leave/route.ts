import { authenticateRequest } from "@/lib/apiAuth";
import {
  badRequest,
  eventErrorResponse,
  jsonOk,
  unauthorized,
} from "@/lib/apiResponse";
import { leaveEvent } from "@/services/eventService";

export async function POST(
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

  try {
    await leaveEvent({ eventId, userId: user.userId });
  } catch (err) {
    const res = eventErrorResponse(err);
    if (res) return res;
    throw err;
  }

  return jsonOk({ ok: true, isRsvped: false });
}
