import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CalendarPlus, Crown, Users } from "lucide-react";
import { DeleteGroupButton } from "./DeleteGroupButton";
import { InviteLink } from "./InviteLink";
import { getCurrentUser } from "@/lib/auth";
import { GroupError, getGroupDetails } from "@/services/groupService";
import { Avatar, Badge, Card, buttonVariants } from "@/components/ui";

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

  const canDelete = group.createdBy === user.userId || user.role === "admin";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link
        href="/groups"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Groups
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            {group.title}
          </h1>
          {group.description && (
            <p className="mt-2 max-w-2xl text-ink-muted">{group.description}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {group.isManager && (
            <Badge variant="warning" className="px-3 py-1">
              <Crown className="h-3.5 w-3.5" />
              You are a manager
            </Badge>
          )}
          {(group.isManager || user.role === "admin") && (
            <Link
              href={`/groups/${group.id}/events/new`}
              className={buttonVariants({ variant: "primary", size: "sm" })}
            >
              <CalendarPlus className="h-4 w-4" />
              Create event
            </Link>
          )}
          {canDelete && (
            <DeleteGroupButton groupId={group.id} groupTitle={group.title} />
          )}
        </div>
      </header>

      {group.isManager && group.inviteCode && (
        <section className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Invite link
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Share this link with friends to let them join the group.
          </p>
          <div className="mt-3">
            <InviteLink groupId={group.id} code={group.inviteCode} />
          </div>
        </section>
      )}

      <section className="mt-8">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-brand-600" />
          <h2 className="text-xl font-semibold text-ink">Members</h2>
          <Badge variant="brand">{group.members.length}</Badge>
        </div>
        <Card className="mt-4 overflow-hidden p-0">
          <ul className="divide-y divide-line">
            {group.members.map((m) => (
              <li
                key={m.userId}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={m.name} size="sm" />
                  <div className="leading-tight">
                    <p className="text-sm font-medium text-ink">{m.name}</p>
                    <p className="text-xs text-ink-muted">{m.email}</p>
                  </div>
                </div>
                {m.isManager && (
                  <Badge variant="warning">
                    <Crown className="h-3 w-3" />
                    Manager
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
