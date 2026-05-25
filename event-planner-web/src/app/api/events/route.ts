import { authenticateRequest } from "@/lib/apiAuth";
import { pagedResponse, parsePaging } from "@/lib/apiPaging";
import { jsonOk, unauthorized } from "@/lib/apiResponse";
import { getActiveEventsPaged } from "@/services/eventService";
import { getEventState } from "@/lib/eventState";

export async function GET(req: Request) {
  const user = await authenticateRequest(req);
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const paging = parsePaging(searchParams);

  const { items, total } = await getActiveEventsPaged({
    limit: paging.limit,
    offset: paging.offset,
  });

  const data = items.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    type: e.eventType,
    date: e.date,
    time: e.time,
    location: e.location,
    capacity: e.capacity,
    canceled: e.canceled,
    state: getEventState(e.date, e.time),
    attendees: e.attendees,
    groupId: e.groupId,
    groupTitle: e.groupTitle,
  }));

  return jsonOk(pagedResponse(data, paging, total));
}
