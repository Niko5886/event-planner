import Link from "next/link";
import { CalendarCheck, CalendarX } from "lucide-react";
import { EventCard } from "@/components/EventCard";
import { SortLinks } from "@/components/SortLinks";
import { getCurrentUser } from "@/lib/auth";
import {
  getActiveEventsPaged,
  getPastAndCanceledEventsPaged,
  parseEventSort,
} from "@/services/eventService";

const EVENT_SORT_OPTIONS = [
  { value: "date", label: "Date" },
  { value: "city", label: "City" },
  { value: "title", label: "Title" },
];

export const metadata = {
  title: "Dashboard · Event Planner",
};

const ACTIVE_PAGE_SIZE = 9;
const PAST_PAGE_SIZE = 8;

function parsePageParam(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw ?? "1");
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = (await getCurrentUser())!;

  const params = (await searchParams) ?? {};
  const activePage = parsePageParam(params.activePage);
  const pastPage = parsePageParam(params.pastPage);
  const sort = parseEventSort(params.sort);

  const activeLimit = activePage * ACTIVE_PAGE_SIZE;
  const pastLimit = pastPage * PAST_PAGE_SIZE;

  const [activeResult, pastResult] = await Promise.all([
    getActiveEventsPaged({ limit: activeLimit, offset: 0, sort }),
    getPastAndCanceledEventsPaged({ limit: pastLimit, offset: 0, sort }),
  ]);

  const activeEvents = activeResult.items;
  const pastEvents = pastResult.items;
  const activeTotal = activeResult.total;
  const pastTotal = pastResult.total;
  const hasMoreActive = activeEvents.length < activeTotal;
  const hasMorePast = pastEvents.length < pastTotal;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="mt-1 text-slate-600">
          Welcome back, <span className="font-medium">{user.name}</span>.
        </p>
      </header>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-slate-900">
              Upcoming Events
            </h2>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
              {activeTotal}
            </span>
          </div>
          <SortLinks
            param="sort"
            current={sort}
            options={EVENT_SORT_OPTIONS}
            basePath="/dashboard"
            extraParams={{
              activePage: String(activePage),
              pastPage: String(pastPage),
            }}
          />
        </div>

        {activeTotal === 0 ? (
          <EmptyState
            title="No active events"
            description="When you or a group manager creates an event, it will appear here."
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeEvents.map((event) => (
                <EventCard key={event.id} event={event} variant="active" />
              ))}
            </div>
            {hasMoreActive && (
              <div className="mt-6 flex justify-center">
                <Link
                  href={{
                    pathname: "/dashboard",
                    query: {
                      activePage: String(activePage + 1),
                      pastPage: String(pastPage),
                      sort,
                    },
                  }}
                  className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Load more upcoming events
                </Link>
              </div>
            )}
          </>
        )}
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-center gap-2">
          <CalendarX className="h-5 w-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-700">
            Past &amp; Canceled Events
          </h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {pastTotal}
          </span>
        </div>

        {pastTotal === 0 ? (
          <EmptyState
            title="No past events yet"
            description="Past and canceled events will be archived here."
            muted
          />
        ) : (
          <>
            <div className="grid gap-2 sm:grid-cols-2">
              {pastEvents.map((event) => (
                <EventCard key={event.id} event={event} variant="muted" />
              ))}
            </div>
            {hasMorePast && (
              <div className="mt-6 flex justify-center">
                <Link
                  href={{
                    pathname: "/dashboard",
                    query: {
                      activePage: String(activePage),
                      pastPage: String(pastPage + 1),
                      sort,
                    },
                  }}
                  className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Load more past events
                </Link>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function EmptyState({
  title,
  description,
  muted = false,
}: {
  title: string;
  description: string;
  muted?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border border-dashed p-8 text-center ${
        muted
          ? "border-slate-200 bg-slate-50/50 text-slate-500"
          : "border-slate-300 bg-white text-slate-600"
      }`}
    >
      <p className="font-medium text-slate-700">{title}</p>
      <p className="mt-1 text-sm">{description}</p>
    </div>
  );
}
