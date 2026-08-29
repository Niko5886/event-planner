"use client";

import { useActionState, useState } from "react";
import { postEventCommentAction, type CommentActionState } from "@/lib/actions/events";
import { Button, Label, Textarea } from "@/components/ui";

const initialState: CommentActionState = { error: null, success: null };
const MAX_COMMENT_LENGTH = 2000;

export function EventCommentForm({ eventId }: { eventId: number }) {
  const [state, action, pending] = useActionState(
    postEventCommentAction,
    initialState
  );
  const [text, setText] = useState("");
  const [handledSuccess, setHandledSuccess] = useState(state.success);

  // Clear the textarea when a new successful post is registered. Adjusting
  // state during render (React-recommended) instead of syncing via useEffect.
  if (state.success !== handledSuccess) {
    setHandledSuccess(state.success);
    if (state.success) {
      setText("");
    }
  }

  return (
    <form action={action} className="mt-5 space-y-3">
      <input type="hidden" name="eventId" value={eventId} />
      <div>
        <Label htmlFor="comment-text">Add comment</Label>
        <Textarea
          id="comment-text"
          name="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_COMMENT_LENGTH}
          rows={3}
          placeholder="Write a comment..."
          className="mt-2"
        />
        <div className="mt-1 text-right text-xs text-ink-subtle">
          {text.length}/{MAX_COMMENT_LENGTH}
        </div>
      </div>

      {state.error && (
        <p className="rounded-lg border border-danger/20 bg-danger-soft px-3 py-2 text-sm text-danger-ink">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-lg border border-success/20 bg-success-soft px-3 py-2 text-sm text-success-ink">
          {state.success}
        </p>
      )}

      <Button
        type="submit"
        loading={pending}
        disabled={text.trim().length === 0}
      >
        {pending ? "Posting..." : "Post comment"}
      </Button>
    </form>
  );
}
