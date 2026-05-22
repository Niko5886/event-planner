"use client";

import { useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";

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
      <div className="flex flex-1 items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700">
        <Link2 className="h-4 w-4 flex-shrink-0 text-slate-400" />
        <span className="truncate font-mono text-xs sm:text-sm">{url}</span>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-emerald-600" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Copy
          </>
        )}
      </button>
    </div>
  );
}
