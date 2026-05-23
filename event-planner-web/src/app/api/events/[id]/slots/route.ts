import { authenticateRequest } from "@/lib/apiAuth";
import {
  badRequest,
  eventErrorResponse,
  jsonOk,
  unauthorized,
} from "@/lib/apiResponse";
import { updateRsvpSlots } from "@/services/eventService";

const MAX_EXTRA_SLOTS = 3;

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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Request body must be valid JSON.");
  }

  const raw = (body as { extraSlots?: unknown })?.extraSlots;
  const extraSlots = Number(raw);
  if (
    !Number.isInteger(extraSlots) ||
    extraSlots < 0 ||
    extraSlots > MAX_EXTRA_SLOTS
  ) {
    return badRequest(
      `Field 'extraSlots' must be an integer between 0 and ${MAX_EXTRA_SLOTS}.`
    );
  }

  try {
    await updateRsvpSlots({ eventId, userId: user.userId, extraSlots });
  } catch (err) {
    const res = eventErrorResponse(err);
    if (res) return res;
    throw err;
  }

  return jsonOk({ ok: true, extraSlots });
}
