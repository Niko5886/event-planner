import Link from "next/link";
import { redirect } from "next/navigation";
import { SortLinks } from "@/components/SortLinks";
import { getCurrentUser } from "@/lib/auth";
import {
  getAdminOverview,
  listAdminEventsPaged,
  listAdminGroupsPaged,
  listAdminUsersPaged,
} from "@/services/adminService";
import { parseEventSort } from "@/services/eventService";
import { parseGroupSort } from "@/services/groupService";
import {
  adminDeleteEventAction,
  adminDeleteGroupAction,
} from "@/lib/actions/admin";
import { Badge, Card, buttonVariants } from "@/components/ui";

const USERS_PAGE_SIZE = 10;
const GROUPS_PAGE_SIZE = 10;
const EVENTS_PAGE_SIZE = 10;

const ADMIN_GROUP_SORT_OPTIONS = [
  { value: "title", label: "Title" },
  { value: "city", label: "City" },
];

const ADMIN_EVENT_SORT_OPTIONS = [
  { value: "date", label: "Date" },
  { value: "city", label: "City" },
  { value: "title", label: "Title" },
];

const deleteButtonClass =
  "inline-flex items-center rounded-md border border-danger/30 bg-danger-soft px-3 py-1.5 text-xs font-semibold text-danger-ink transition-colors hover:bg-danger/10";

function formatDate(value: string | Date) {
  const d = typeof value === "string" ? new Date(`${value}T00:00:00`) : value;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(date: string, time: string) {
  return `${formatDate(date)} ${time.slice(0, 5)}`;
}

function parsePageParam(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw ?? "1");
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  const params = (await searchParams) ?? {};
  const usersPage = parsePageParam(params.usersPage);
  const groupsPage = parsePageParam(params.groupsPage);
  const eventsPage = parsePageParam(params.eventsPage);
  const groupsSort = parseGroupSort(params.groupsSort);
  const eventsSort = parseEventSort(params.eventsSort);

  const usersLimit = usersPage * USERS_PAGE_SIZE;
  const groupsLimit = groupsPage * GROUPS_PAGE_SIZE;
  const eventsLimit = eventsPage * EVENTS_PAGE_SIZE;

  const [overview, usersResult, groupsResult, eventsResult] = await Promise.all([
    getAdminOverview(),
    listAdminUsersPaged({ limit: usersLimit, offset: 0 }),
    listAdminGroupsPaged({ limit: groupsLimit, offset: 0, sort: groupsSort }),
    listAdminEventsPaged({ limit: eventsLimit, offset: 0, sort: eventsSort }),
  ]);

  const users = usersResult.items;
  const groups = groupsResult.items;
  const events = eventsResult.items;
  const hasMoreUsers = users.length < usersResult.total;
  const hasMoreGroups = groups.length < groupsResult.total;
  const hasMoreEvents = events.length < eventsResult.total;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-ink">Admin Panel</h1>
        <p className="text-sm text-ink-muted">
          Lightweight overview of users, groups, and events.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Users", value: overview.users },
          { label: "Groups", value: overview.groups },
          { label: "Events", value: overview.events },
          { label: "RSVPs", value: overview.rsvps },
          { label: "Comments", value: overview.comments },
        ].map((item) => (
          <Card key={item.label} className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
              {item.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-ink">{item.value}</p>
          </Card>
        ))}
      </section>

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Users
          </h2>
          <span className="text-xs text-ink-muted">
            Showing {users.length} of {usersResult.total}
          </span>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-ink-subtle">
              <tr>
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">Role</th>
                <th className="py-2">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-line">
                  <td className="py-2 font-medium text-ink">{u.name}</td>
                  <td className="py-2 text-ink-muted">{u.email}</td>
                  <td className="py-2 text-ink-muted">{u.role}</td>
                  <td className="py-2 text-ink-muted">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {hasMoreUsers && (
          <div className="mt-4 flex justify-center">
            <Link
              href={{
                pathname: "/admin",
                query: {
                  usersPage: String(usersPage + 1),
                  groupsPage: String(groupsPage),
                  eventsPage: String(eventsPage),
                },
              }}
              className={buttonVariants({ variant: "secondary" })}
            >
              Load more users
            </Link>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Groups
          </h2>
          <span className="text-xs text-ink-muted">
            Showing {groups.length} of {groupsResult.total}
          </span>
        </div>
        <div className="mt-3">
          <SortLinks
            param="groupsSort"
            current={groupsSort}
            options={ADMIN_GROUP_SORT_OPTIONS}
            basePath="/admin"
            extraParams={{
              usersPage: String(usersPage),
              groupsPage: String(groupsPage),
              eventsPage: String(eventsPage),
              eventsSort,
            }}
          />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-ink-subtle">
              <tr>
                <th className="py-2">Group</th>
                <th className="py-2">Members</th>
                <th className="py-2">Events</th>
                <th className="py-2">Created by</th>
                <th className="py-2">Created</th>
                <th className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.id} className="border-t border-line">
                  <td className="py-2 font-medium text-ink">{g.title}</td>
                  <td className="py-2 text-ink-muted">{g.memberCount}</td>
                  <td className="py-2 text-ink-muted">{g.eventCount}</td>
                  <td className="py-2 text-ink-muted">{g.createdByName}</td>
                  <td className="py-2 text-ink-muted">{formatDate(g.createdAt)}</td>
                  <td className="py-2 text-right">
                    <form action={adminDeleteGroupAction}>
                      <input type="hidden" name="groupId" value={g.id} />
                      <button type="submit" className={deleteButtonClass}>
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {hasMoreGroups && (
          <div className="mt-4 flex justify-center">
            <Link
              href={{
                pathname: "/admin",
                query: {
                  usersPage: String(usersPage),
                  groupsPage: String(groupsPage + 1),
                  eventsPage: String(eventsPage),
                  groupsSort,
                  eventsSort,
                },
              }}
              className={buttonVariants({ variant: "secondary" })}
            >
              Load more groups
            </Link>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Events
          </h2>
          <span className="text-xs text-ink-muted">
            Showing {events.length} of {eventsResult.total}
          </span>
        </div>
        <div className="mt-3">
          <SortLinks
            param="eventsSort"
            current={eventsSort}
            options={ADMIN_EVENT_SORT_OPTIONS}
            basePath="/admin"
            extraParams={{
              usersPage: String(usersPage),
              groupsPage: String(groupsPage),
              eventsPage: String(eventsPage),
              groupsSort,
            }}
          />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-ink-subtle">
              <tr>
                <th className="py-2">Event</th>
                <th className="py-2">Group</th>
                <th className="py-2">When</th>
                <th className="py-2">Capacity</th>
                <th className="py-2">Status</th>
                <th className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-t border-line">
                  <td className="py-2 font-medium text-ink">{e.title}</td>
                  <td className="py-2 text-ink-muted">{e.groupTitle}</td>
                  <td className="py-2 text-ink-muted">
                    {formatDateTime(e.date, e.time)}
                  </td>
                  <td className="py-2 text-ink-muted">
                    {e.attendees}/{e.capacity}
                  </td>
                  <td className="py-2">
                    <Badge variant={e.canceled ? "danger" : "success"}>
                      {e.canceled ? "Canceled" : "Active"}
                    </Badge>
                  </td>
                  <td className="py-2 text-right">
                    <form action={adminDeleteEventAction}>
                      <input type="hidden" name="eventId" value={e.id} />
                      <button type="submit" className={deleteButtonClass}>
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {hasMoreEvents && (
          <div className="mt-4 flex justify-center">
            <Link
              href={{
                pathname: "/admin",
                query: {
                  usersPage: String(usersPage),
                  groupsPage: String(groupsPage),
                  eventsPage: String(eventsPage + 1),
                  groupsSort,
                  eventsSort,
                },
              }}
              className={buttonVariants({ variant: "secondary" })}
            >
              Load more events
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
