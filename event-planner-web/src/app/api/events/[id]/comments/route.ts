import { authenticateRequest } from "@/lib/apiAuth";
import { pagedResponse, parsePaging } from "@/lib/apiPaging";
import {
  badRequest,
  eventErrorResponse,
  jsonOk,
  unauthorized,
} from "@/lib/apiResponse";
import {
  MAX_COMMENT_LENGTH,
  MIN_COMMENT_LENGTH,
  getEventCommentsPaged,
  postEventComment,
} from "@/services/eventService";

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

  const { searchParams } = new URL(req.url);
  const paging = parsePaging(searchParams);

  const { items, total } = await getEventCommentsPaged({
    eventId,
    limit: paging.limit,
    offset: paging.offset,
  });

  const data = items.map((c) => ({
    id: c.id,
    text: c.text,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    author: {
      id: c.userId,
      name: c.authorName,
      photoUrl: c.authorPhotoUrl,
    },
  }));

  return jsonOk(pagedResponse(data, paging, total));
}

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

  const text = (body as { text?: unknown })?.text;
  if (typeof text !== "string") {
    return badRequest("Field 'text' is required.");
  }
  const trimmed = text.trim();
  if (trimmed.length < MIN_COMMENT_LENGTH) {
    return badRequest("Comment cannot be empty.");
  }
  if (trimmed.length > MAX_COMMENT_LENGTH) {
    return badRequest(
      `Comment is too long (max ${MAX_COMMENT_LENGTH} characters).`
    );
  }

  let comment;
  try {
    comment = await postEventComment({
      eventId,
      userId: user.userId,
      text: trimmed,
    });
  } catch (err) {
    const res = eventErrorResponse(err);
    if (res) return res;
    throw err;
  }

  return jsonOk(
    {
      id: comment.id,
      text: comment.text,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: {
        id: comment.userId,
        name: comment.authorName,
        photoUrl: comment.authorPhotoUrl,
      },
    },
    { status: 201 }
  );
}
