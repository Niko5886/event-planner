"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  LogIn,
  LogOut,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import {
  deleteEventAction,
  leaveEventAction,
  rsvpEventAction,
  type EventActionState,
} from "@/lib/actions/events";

const initialState: EventActionState = { error: null, success: null };

type Props = {
  eventId: number;
  isRsvped: boolean;
  canManage: boolean;
  isOpen: boolean;
  capacity: number;
  attendees: number;
};

export function EventActions({
  eventId,
  isRsvped,
  canManage,
  isOpen,
  capacity,
  attendees,
}: Props) {
  const [rsvpState, rsvpAction, rsvpPending] = useActionState(
    rsvpEventAction,
    initialState
  );
  const [leaveState, leaveAction, leavePending] = useActionState(
    leaveEventAction,
    initialState
  );

  const remainingSeats = Math.max(0, capacity - attendees);

  const feedback =
    rsvpState.error || leaveState.error
      ? {
          type: "error" as const,
          text: rsvpState.error || leaveState.error || "",
        }
      : rsvpState.success || leaveState.success
      ? {
          type: "success" as const,
          text: rsvpState.success || leaveState.success || "",
        }
      : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {!isRsvped ? (
          <form action={rsvpAction}>
            <input type="hidden" name="eventId" value={eventId} />
            <button
              type="submit"
              disabled={!isOpen || rsvpPending || remainingSeats <= 0}
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {rsvpPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {rsvpPending ? "Joining…" : "Join"}
            </button>
          </form>
        ) : (
          <form action={leaveAction}>
            <input type="hidden" name="eventId" value={eventId} />
            <button
              type="submit"
              disabled={!isOpen || leavePending}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {leavePending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              {leavePending ? "Leaving…" : "Leave"}
            </button>
          </form>
        )}

        {canManage && (
          <>
            <Link
              href={`/events/${eventId}/edit`}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
            <DeleteButton eventId={eventId} />
          </>
        )}
      </div>

      {!isOpen && !isRsvped && (
        <p className="text-xs text-slate-500">
          This event has already ended or has been canceled — joining is not
          possible.
        </p>
      )}

      {feedback && (
        <div
          className={`flex items-start gap-2 rounded-md border p-3 text-sm ${
            feedback.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {feedback.type === "error" ? (
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}
    </div>
  );
}

function DeleteButton({ eventId }: { eventId: number }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2">
      <span className="text-sm font-medium text-red-700">Are you sure?</span>
      <form action={deleteEventAction}>
        <input type="hidden" name="eventId" value={eventId} />
        <button
          type="submit"
          className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Yes, delete
        </button>
      </form>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        aria-label="Cancel"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
