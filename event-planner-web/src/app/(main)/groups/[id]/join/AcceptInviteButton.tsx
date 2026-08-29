"use client";

import { useActionState } from "react";
import { AlertCircle, Check } from "lucide-react";
import {
  joinGroupAction,
  type GroupFormState,
} from "@/lib/actions/groups";
import { Button } from "@/components/ui";

const initialState: GroupFormState = { error: null };

export function AcceptInviteButton({ code }: { code: string }) {
  const [state, formAction, pending] = useActionState(
    joinGroupAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="code" value={code} />
      <Button type="submit" loading={pending} className="w-full">
        {!pending && <Check className="h-4 w-4" />}
        {pending ? "Joining…" : "Accept invitation"}
      </Button>
      {state.error && (
        <div className="flex items-start gap-2 rounded-lg border border-danger/20 bg-danger-soft p-3 text-left text-sm text-danger-ink">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{state.error}</span>
        </div>
      )}
    </form>
  );
}
