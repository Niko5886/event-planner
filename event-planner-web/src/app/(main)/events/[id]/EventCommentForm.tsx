"use client";

import { useActionState, useEffect, useState } from "react";
import { postEventCommentAction, type CommentActionState } from "@/lib/actions/events";

const initialState: CommentActionState = { error: null, success: null };
const MAX_COMMENT_LENGTH = 2000;

export function EventCommentForm({ eventId }: { eventId: number }) {
  const [state, action, pending] = useActionState(
    postEventCommentAction,
    initialState
  );
  const [text, setText] = useState("");

  useEffect(() => {
    if (state.success) {
      setText("");
    }
  }, [state.success]);

  return (
    <form action={action} className="mt-5 space-y-3">
      <input type="hidden" name="eventId" value={eventId} />
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Add comment
        </label>
        <textarea
          name="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_COMMENT_LENGTH}
          rows={3}
          placeholder="Write a comment..."
          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        <div className="mt-1 text-right text-xs text-slate-400">
          {text.length}/{MAX_COMMENT_LENGTH}
        </div>
      </div>

      {state.error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {state.success}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || text.trim().length === 0}
        className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Posting..." : "Post comment"}
      </button>
    </form>
  );
}
