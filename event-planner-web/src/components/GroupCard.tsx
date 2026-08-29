import Link from "next/link";
import { CalendarDays, Crown, Users } from "lucide-react";
import type { GroupListItem } from "@/services/groupService";
import { Badge } from "@/components/ui";

export function GroupCard({ group }: { group: GroupListItem }) {
  return (
    <Link
      href={`/groups/${group.id}`}
      className="group flex flex-col rounded-xl border border-line bg-surface p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-ink group-hover:text-brand-700">
          {group.title}
        </h3>
        {group.isManager && (
          <Badge variant="warning">
            <Crown className="h-3 w-3" />
            Manager
          </Badge>
        )}
      </div>
      {group.description && (
        <p className="mt-2 line-clamp-2 text-sm text-ink-muted">
          {group.description}
        </p>
      )}
      <div className="mt-4 flex items-center gap-4 border-t border-line pt-3 text-sm text-ink-muted">
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4 text-ink-subtle" />
          <span className="font-medium text-ink">{group.memberCount}</span>
          <span>members</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4 text-ink-subtle" />
          <span className="font-medium text-ink">{group.eventCount}</span>
          <span>events</span>
        </div>
      </div>
    </Link>
  );
}
