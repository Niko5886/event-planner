"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
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
  updateSlotsAction,
  type EventActionState,
} from "@/lib/actions/events";
import { Button, buttonVariants } from "@/components/ui";
import { cn } from "@/lib/cn";

const initialState: EventActionState = { error: null, success: null };

type Props = {
  eventId: number;
  isRsvped: boolean;
  canManage: boolean;
  isOpen: boolean;
  userExtraSlots: number;
  maxExtraSlots: number;
};

const stepperClass =
  "inline-flex h-7 w-7 items-center justify-center rounded-md border border-line-strong bg-surface text-sm font-semibold text-ink shadow-xs transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60";

export function EventActions({
  eventId,
  isRsvped,
  canManage,
  isOpen,
  userExtraSlots,
  maxExtraSlots,
}: Props) {
  const [rsvpState, rsvpAction, rsvpPending] = useActionState(
    rsvpEventAction,
    initialState
  );
  const [leaveState, leaveAction, leavePending] = useActionState(
    leaveEventAction,
    initialState
  );
  const [slotsState, slotsAction, slotsPending] = useActionState(
    updateSlotsAction,
    initialState
  );

  const canDecSlots = userExtraSlots > 0;
  const canIncSlots = userExtraSlots < maxExtraSlots;

  const feedback =
    rsvpState.error || leaveState.error || slotsState.error
      ? {
          type: "error" as const,
          text: rsvpState.error || leaveState.error || slotsState.error || "",
        }
      : rsvpState.success || leaveState.success || slotsState.success
      ? {
          type: "success" as const,
          text:
            rsvpState.success || leaveState.success || slotsState.success || "",
        }
      : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {!isRsvped ? (
          <form action={rsvpAction}>
            <input type="hidden" name="eventId" value={eventId} />
            <Button type="submit" loading={rsvpPending} disabled={!isOpen}>
              {!rsvpPending && <LogIn className="h-4 w-4" />}
              {rsvpPending ? "Joining…" : "Join"}
            </Button>
          </form>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-muted px-3 py-2">
              <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                Extra slots (available: {maxExtraSlots})
              </span>
              <div className="flex items-center gap-2">
                <form action={slotsAction}>
                  <input type="hidden" name="eventId" value={eventId} />
                  <input
                    type="hidden"
                    name="extraSlots"
                    value={String(userExtraSlots - 1)}
                  />
                  <button
                    type="submit"
                    disabled={!isOpen || slotsPending || !canDecSlots}
                    className={stepperClass}
                    aria-label="Decrease extra slots"
                  >
                    −
                  </button>
                </form>
                <span className="min-w-[1.5rem] text-center text-sm font-semibold text-ink">
                  {userExtraSlots}
                </span>
                <form action={slotsAction}>
                  <input type="hidden" name="eventId" value={eventId} />
                  <input
                    type="hidden"
                    name="extraSlots"
                    value={String(userExtraSlots + 1)}
                  />
                  <button
                    type="submit"
                    disabled={!isOpen || slotsPending || !canIncSlots}
                    className={stepperClass}
                    aria-label="Increase extra slots"
                  >
                    +
                  </button>
                </form>
              </div>
            </div>

            <form action={leaveAction}>
              <input type="hidden" name="eventId" value={eventId} />
              <Button
                type="submit"
                variant="secondary"
                loading={leavePending}
                disabled={!isOpen}
              >
                {!leavePending && <LogOut className="h-4 w-4" />}
                {leavePending ? "Leaving…" : "Leave"}
              </Button>
            </form>
          </div>
        )}

        {canManage && (
          <>
            <Link
              href={`/events/${eventId}/edit`}
              className={buttonVariants({ variant: "secondary" })}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
            <DeleteButton eventId={eventId} />
          </>
        )}
      </div>

      {!isOpen && !isRsvped && (
        <p className="text-xs text-ink-muted">
          This event has already ended or has been canceled — joining is not
          possible.
        </p>
      )}

      {feedback && (
        <div
          className={cn(
            "flex items-start gap-2 rounded-lg border p-3 text-sm",
            feedback.type === "error"
              ? "border-danger/20 bg-danger-soft text-danger-ink"
              : "border-success/20 bg-success-soft text-success-ink"
          )}
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
        className="inline-flex items-center gap-2 rounded-lg border border-danger/30 bg-surface px-4 py-2 text-sm font-semibold text-danger-ink shadow-xs transition-colors hover:bg-danger-soft"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-danger/20 bg-danger-soft px-3 py-2">
      <span className="text-sm font-medium text-danger-ink">Are you sure?</span>
      <form action={deleteEventAction}>
        <input type="hidden" name="eventId" value={eventId} />
        <Button type="submit" variant="danger" size="sm">
          <Trash2 className="h-3.5 w-3.5" />
          Yes, delete
        </Button>
      </form>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="inline-flex items-center gap-1 rounded-md border border-line-strong bg-surface px-2 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-surface-muted"
        aria-label="Cancel"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
