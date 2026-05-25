import { authenticateRequest } from "@/lib/apiAuth";
import { pagedResponse, parsePaging } from "@/lib/apiPaging";
import { badRequest, jsonOk, unauthorized } from "@/lib/apiResponse";
import { getEventAttendeesPaged } from "@/services/eventService";

export async function GET(
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

  const { searchParams } = new URL(req.url);
  const paging = parsePaging(searchParams);

  const { items, total } = await getEventAttendeesPaged({
    eventId,
    limit: paging.limit,
    offset: paging.offset,
  });

  const data = items.map((a) => ({
    userId: a.userId,
    name: a.name,
    photoUrl: a.photoUrl,
    extraSlots: a.extraSlots,
    rsvpAt: a.rsvpAt,
  }));

  return jsonOk(pagedResponse(data, paging, total));
}
