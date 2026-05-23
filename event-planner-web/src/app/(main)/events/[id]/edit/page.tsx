import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { EditEventForm } from "./EditEventForm";
import { getCurrentUser } from "@/lib/auth";
import { EventError, getEventDetails } from "@/services/eventService";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = (await getCurrentUser())!;
  const { id } = await params;
  const eventId = Number(id);

  if (!Number.isInteger(eventId) || eventId <= 0) {
    notFound();
  }

  let event;
  try {
    event = await getEventDetails(eventId, user.userId, user.role);
  } catch (err) {
    if (err instanceof EventError && err.code === "not_found") notFound();
    throw err;
  }

  if (!event.canManage) {
    redirect(`/events/${eventId}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href={`/events/${eventId}`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Обратно към събитието
      </Link>

      <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
        Редактирай събитие
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Промени дата, час, място, капацитет или отмени събитието.
      </p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <EditEventForm
          eventId={event.id}
          initial={{
            title: event.title,
            description: event.description ?? "",
            eventType: event.eventType ?? "",
            date: event.date,
            time: event.time.slice(0, 5),
            location: event.location ?? "",
            capacity: event.capacity,
            canceled: event.canceled,
          }}
        />
      </div>
    </div>
  );
}
