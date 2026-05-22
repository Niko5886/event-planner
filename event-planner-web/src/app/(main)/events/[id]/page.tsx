import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">
        Event #{id}
      </h1>
      <p className="mt-6 rounded-md border border-dashed border-slate-300 bg-white p-6 text-slate-500">
        Event details, RSVP and comments will appear here.
      </p>
    </div>
  );
}
