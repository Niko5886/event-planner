import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CalendarPlus } from "lucide-react";
import { CreateEventForm } from "./CreateEventForm";
import { getCurrentUser } from "@/lib/auth";
import { GroupError, getGroupDetails } from "@/services/groupService";
import { Card } from "@/components/ui";

export const metadata = {
  title: "Create Event · Event Planner",
};

export default async function NewEventPage({
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

  const canCreate = group.isManager || user.role === "admin";
  if (!canCreate) {
    redirect(`/groups/${groupId}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href={`/groups/${groupId}`}
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {group.title}
      </Link>

      <header className="mt-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
          <CalendarPlus className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-brand-600">
            {group.title}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            New event
          </h1>
        </div>
      </header>

      <Card className="mt-8 p-6">
        <CreateEventForm groupId={groupId} />
      </Card>
    </div>
  );
}
