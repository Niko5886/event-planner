import Link from "next/link";
import { CalendarCheck, CalendarX } from "lucide-react";
import { EventCard } from "@/components/EventCard";
import { SortLinks } from "@/components/SortLinks";
import { PageContainer } from "@/components/PageContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { EmptyState, buttonVariants } from "@/components/ui";
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
    <PageContainer>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-ink">
          Dashboard
        </h1>
        <p className="mt-1 text-ink-muted">
          Welcome back, <span className="font-medium text-ink">{user.name}</span>.
        </p>
      </header>

      <section>
        <SectionHeader
          title="Upcoming Events"
          icon={CalendarCheck}
          count={activeTotal}
          actions={
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
          }
        />

        {activeTotal === 0 ? (
          <EmptyState
            icon={CalendarCheck}
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
                  className={buttonVariants({ variant: "secondary" })}
                >
                  Load more upcoming events
                </Link>
              </div>
            )}
          </>
        )}
      </section>

      <section className="mt-12">
        <SectionHeader title="Past & Canceled Events" icon={CalendarX} count={pastTotal} />

        {pastTotal === 0 ? (
          <EmptyState
            icon={CalendarX}
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
                  className={buttonVariants({ variant: "secondary" })}
                >
                  Load more past events
                </Link>
              </div>
            )}
          </>
        )}
      </section>
    </PageContainer>
  );
}
