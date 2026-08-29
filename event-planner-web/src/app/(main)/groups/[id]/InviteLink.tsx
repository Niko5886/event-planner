"use client";

import { useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { Button } from "@/components/ui";

export function InviteLink({
  groupId,
  code,
}: {
  groupId: number;
  code: string;
}) {
  const [copied, setCopied] = useState(false);

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/groups/${groupId}/join?code=${code}`
      : `/groups/${groupId}/join?code=${code}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <div className="flex flex-1 items-center gap-2 rounded-lg border border-line bg-surface-muted px-3 py-2 text-sm text-ink">
        <Link2 className="h-4 w-4 flex-shrink-0 text-ink-subtle" />
        <span className="truncate font-mono text-xs sm:text-sm">{url}</span>
      </div>
      <Button type="button" variant="secondary" onClick={handleCopy}>
        {copied ? (
          <>
            <Check className="h-4 w-4 text-success" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Copy
          </>
        )}
      </Button>
    </div>
  );
}
