import { NextResponse } from "next/server";

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
  };
};

export function jsonOk<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, init);
}

export function jsonError(
  status: number,
  code: string,
  message: string
): NextResponse {
  const body: ApiErrorBody = { error: { code, message } };
  return NextResponse.json(body, { status });
}

export const unauthorized = () =>
  jsonError(401, "unauthorized", "Missing or invalid Bearer token.");

export const forbidden = (message = "Forbidden.") =>
  jsonError(403, "forbidden", message);

export const notFound = (message = "Not found.") =>
  jsonError(404, "not_found", message);

export const badRequest = (message = "Invalid request.", code = "invalid_input") =>
  jsonError(400, code, message);

export const conflict = (message: string, code = "conflict") =>
  jsonError(409, code, message);

import { EventError, type EventErrorCode } from "@/services/eventService";

const EVENT_ERROR_HTTP: Record<EventErrorCode, { status: number; message: string }> = {
  not_found: { status: 404, message: "Event not found." },
  forbidden: { status: 403, message: "You don't have permission for this action." },
  already_rsvped: { status: 409, message: "You are already signed up for this event." },
  not_rsvped: { status: 409, message: "You are not signed up for this event." },
  event_closed: { status: 409, message: "This event has already ended or has been canceled." },
  invalid_input: { status: 400, message: "Invalid event data." },
};

export function eventErrorResponse(err: unknown): NextResponse | null {
  if (!(err instanceof EventError)) return null;
  const info = EVENT_ERROR_HTTP[err.code];
  return jsonError(info.status, err.code, info.message);
}
