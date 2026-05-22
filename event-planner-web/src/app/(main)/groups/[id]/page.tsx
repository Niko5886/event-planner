import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Crown, Users } from "lucide-react";
import { InviteLink } from "./InviteLink";
import { getCurrentUser } from "@/lib/auth";
import { GroupError, getGroupDetails } from "@/services/groupService";

export default async function GroupDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = (await getCurrentUser())!;
  const { id } = await params;
  const groupId = Number(id);

  if (!Number.isInteger(groupId) || groupId <= 0) {
    notFound();
  }

  let group;
  try {
    group = await getGroupDetails(groupId, user.userId);
  } catch (err) {
    if (err instanceof GroupError) {
      if (err.code === "not_found") notFound();
      if (err.code === "not_member") redirect("/groups");
    }
    throw err;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/groups"
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Groups
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {group.title}
          </h1>
          {group.description && (
            <p className="mt-2 max-w-2xl text-slate-600">{group.description}</p>
          )}
        </div>
        {group.isManager && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
            <Crown className="h-3.5 w-3.5" />
            You are a manager
          </span>
        )}
      </header>

      {group.isManager && group.inviteCode && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Invite link
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Share this link with friends to let them join the group.
          </p>
          <div className="mt-3">
            <InviteLink groupId={group.id} code={group.inviteCode} />
          </div>
        </section>
      )}

      <section className="mt-8">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-600" />
          <h2 className="text-xl font-semibold text-slate-900">Members</h2>
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
            {group.members.length}
          </span>
        </div>
        <ul className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {group.members.map((m) => (
            <li
              key={m.userId}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-medium text-slate-900">
                    {m.name}
                  </p>
                  <p className="text-xs text-slate-500">{m.email}</p>
                </div>
              </div>
              {m.isManager && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                  <Crown className="h-3 w-3" />
                  Manager
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
