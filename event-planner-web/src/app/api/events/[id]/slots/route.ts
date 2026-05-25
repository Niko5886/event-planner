import { authenticateRequest } from "@/lib/apiAuth";
import {
  badRequest,
  eventErrorResponse,
  jsonOk,
  jsonError,
  unauthorized,
} from "@/lib/apiResponse";
import { updateRsvpSlots } from "@/services/eventService";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await authenticateRequest(req);
  if (!user) return unauthorized();

  const { id } = await params;
  const eventId = Number(id);
  if (!Number.isInteger(eventId) || eventId <= 0) {
    return badRequest("Invalid event id.");
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Request body must be valid JSON.");
  }

  const raw = (body as { extraSlots?: unknown })?.extraSlots;
  const extraSlots = Number(raw);
  if (!Number.isInteger(extraSlots) || extraSlots < 0) {
    return badRequest("Field 'extraSlots' must be a non-negative integer.");
  }

  try {
    await updateRsvpSlots({ eventId, userId: user.userId, extraSlots });
  } catch (err) {
    const res = eventErrorResponse(err);
    if (res) return res;
    // Log unexpected error for local debugging and return its message in the response
    // so the client shows the underlying cause during development.
    console.error("/api/events/[id]/slots unexpected error:", err);
    const msg = err instanceof Error ? err.message : "Internal server error.";
    return jsonError(500, "server_error", msg);
  }

  return jsonOk({ ok: true, extraSlots });
}
