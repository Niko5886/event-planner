import Link from "next/link";
import { CalendarDays, Crown, Users } from "lucide-react";
import type { GroupListItem } from "@/services/groupService";

export function GroupCard({ group }: { group: GroupListItem }) {
  return (
    <Link
      href={`/groups/${group.id}`}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-700">
          {group.title}
        </h3>
        {group.isManager && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            <Crown className="h-3 w-3" />
            Manager
          </span>
        )}
      </div>
      {group.description && (
        <p className="mt-2 line-clamp-2 text-sm text-slate-600">
          {group.description}
        </p>
      )}
      <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3 text-sm text-slate-600">
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4 text-slate-400" />
          <span className="font-medium">{group.memberCount}</span>
          <span className="text-slate-500">members</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4 text-slate-400" />
          <span className="font-medium">{group.eventCount}</span>
          <span className="text-slate-500">events</span>
        </div>
      </div>
    </Link>
  );
}
