import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle, ArrowRight, Users } from "lucide-react";
import { AcceptInviteButton } from "./AcceptInviteButton";
import { getCurrentUser } from "@/lib/auth";
import {
  getGroupByInviteCode,
  isGroupMember,
} from "@/services/groupService";
import { Card } from "@/components/ui";

export const metadata = {
  title: "Join group · Event Planner",
};

export default async function JoinGroupPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ code?: string }>;
}) {
  const user = (await getCurrentUser())!;
  const { id } = await params;
  const { code } = await searchParams;

  if (!code) {
    return (
      <ErrorView
        title="Missing invite code"
        message="This link is incomplete. Ask the group manager to send you the full link."
      />
    );
  }

  const invite = await getGroupByInviteCode(code);
  if (!invite || String(invite.groupId) !== id) {
    return (
      <ErrorView
        title="Invalid invite link"
        message="The invite code does not exist or points to a different group."
      />
    );
  }

  const alreadyMember = await isGroupMember(invite.groupId, user.userId);
  if (alreadyMember) {
    redirect(`/groups/${invite.groupId}`);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <Card className="p-8 text-center shadow-lg">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
          <Users className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-ink">
          You&apos;re invited to join
        </h1>
        <h2 className="mt-1 text-2xl font-semibold text-brand-600">
          {invite.title}
        </h2>
        {invite.description && (
          <p className="mt-3 text-sm text-ink-muted">{invite.description}</p>
        )}
        <div className="mt-6">
          <AcceptInviteButton code={code} />
        </div>
        <Link
          href="/groups"
          className="mt-3 inline-block text-sm text-ink-muted transition-colors hover:text-ink"
        >
          Decline
        </Link>
      </Card>
    </div>
  );
}

function ErrorView({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <div className="rounded-xl border border-danger/20 bg-danger-soft p-6 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-danger" />
        <h1 className="mt-3 text-lg font-semibold text-danger-ink">{title}</h1>
        <p className="mt-1 text-sm text-danger-ink/90">{message}</p>
        <Link
          href="/groups"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-danger-ink transition-colors hover:opacity-80"
        >
          Go to My Groups
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
