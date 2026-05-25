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
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
        <p className="text-sm text-slate-600">
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
          <div
            key={item.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {item.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {item.value}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Users
          </h2>
          <span className="text-xs text-slate-500">
            Showing {users.length} of {usersResult.total}
          </span>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">Role</th>
                <th className="py-2">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="py-2 font-medium text-slate-900">{u.name}</td>
                  <td className="py-2 text-slate-600">{u.email}</td>
                  <td className="py-2 text-slate-600">{u.role}</td>
                  <td className="py-2 text-slate-600">
                    {formatDate(u.createdAt)}
                  </td>
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
              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Load more users
            </Link>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Groups
          </h2>
          <span className="text-xs text-slate-500">
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
            <thead className="text-xs uppercase text-slate-400">
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
                <tr key={g.id} className="border-t border-slate-100">
                  <td className="py-2 font-medium text-slate-900">{g.title}</td>
                  <td className="py-2 text-slate-600">{g.memberCount}</td>
                  <td className="py-2 text-slate-600">{g.eventCount}</td>
                  <td className="py-2 text-slate-600">{g.createdByName}</td>
                  <td className="py-2 text-slate-600">
                    {formatDate(g.createdAt)}
                  </td>
                  <td className="py-2 text-right">
                    <form action={adminDeleteGroupAction}>
                      <input type="hidden" name="groupId" value={g.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
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
              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Load more groups
            </Link>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Events
          </h2>
          <span className="text-xs text-slate-500">
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
            <thead className="text-xs uppercase text-slate-400">
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
                <tr key={e.id} className="border-t border-slate-100">
                  <td className="py-2 font-medium text-slate-900">{e.title}</td>
                  <td className="py-2 text-slate-600">{e.groupTitle}</td>
                  <td className="py-2 text-slate-600">
                    {formatDateTime(e.date, e.time)}
                  </td>
                  <td className="py-2 text-slate-600">
                    {e.attendees}/{e.capacity}
                  </td>
                  <td className="py-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        e.canceled
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {e.canceled ? "Canceled" : "Active"}
                    </span>
                  </td>
                  <td className="py-2 text-right">
                    <form action={adminDeleteEventAction}>
                      <input type="hidden" name="eventId" value={e.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
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
              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Load more events
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
