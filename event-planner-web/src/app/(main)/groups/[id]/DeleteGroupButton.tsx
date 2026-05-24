"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";

import { deleteGroupAction } from "@/lib/actions/groups";

type Props = {
  groupId: number;
  groupTitle: string;
};

export function DeleteGroupButton({ groupId, groupTitle }: Props) {
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    const ok = window.confirm(
      `Delete group "${groupTitle}"?\n\nThis will permanently remove the group, all its events, RSVPs, comments and invitations. This cannot be undone.`
    );
    if (!ok) return;

    const fd = new FormData();
    fd.set("groupId", String(groupId));
    startTransition(() => deleteGroupAction(fd));
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
      {isPending ? "Deleting…" : "Delete group"}
    </button>
  );
}
