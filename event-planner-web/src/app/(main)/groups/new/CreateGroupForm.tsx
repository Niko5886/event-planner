"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AlertCircle, ArrowLeft, Plus } from "lucide-react";
import {
  createGroupAction,
  type GroupFormState,
} from "@/lib/actions/groups";
import { Button, Card, Input, Label, Textarea } from "@/components/ui";

const initialState: GroupFormState = { error: null };

export function CreateGroupForm() {
  const [state, formAction, pending] = useActionState(
    createGroupAction,
    initialState
  );

  return (
    <Card className="p-6">
      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="title">
            Name <span className="text-danger">*</span>
          </Label>
          <Input
            id="title"
            name="title"
            type="text"
            required
            minLength={2}
            maxLength={120}
            placeholder="e.g. Mountain Hikers"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={4}
            maxLength={2000}
            placeholder="Optional — what is this group about?"
          />
        </div>

        {state.error && (
          <div className="flex items-start gap-2 rounded-lg border border-danger/20 bg-danger-soft p-3 text-sm text-danger-ink">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Link
            href="/groups"
            className="inline-flex items-center gap-1 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <Button type="submit" loading={pending}>
            {!pending && <Plus className="h-4 w-4" />}
            {pending ? "Creating…" : "Create group"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
