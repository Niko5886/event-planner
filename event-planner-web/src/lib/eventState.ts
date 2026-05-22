export type EventState = "upcoming" | "ongoing" | "past";
export type CapacityState = "under" | "full" | "over";

const ONGOING_WINDOW_MS = 60 * 60 * 1000;

function eventStart(date: string, time: string): Date {
  return new Date(`${date}T${time}`);
}

export function getEventState(
  date: string,
  time: string,
  now: Date = new Date()
): EventState {
  const start = eventStart(date, time);
  const end = new Date(start.getTime() + ONGOING_WINDOW_MS);
  if (now < start) return "upcoming";
  if (now < end) return "ongoing";
  return "past";
}

export function isEventActive(
  date: string,
  time: string,
  canceled: boolean,
  now: Date = new Date()
): boolean {
  if (canceled) return false;
  return getEventState(date, time, now) !== "past";
}

export function getCapacityState(
  attendees: number,
  capacity: number
): CapacityState {
  if (attendees > capacity) return "over";
  if (attendees === capacity) return "full";
  return "under";
}
