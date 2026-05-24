import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getAdminOverview,
  listAdminEvents,
  listAdminGroups,
  listAdminUsers,
} from "@/services/adminService";
import {
  adminDeleteEventAction,
  adminDeleteGroupAction,
} from "@/lib/actions/admin";

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

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  const [overview, users, groups, events] = await Promise.all([
    getAdminOverview(),
    listAdminUsers(10),
    listAdminGroups(10),
    listAdminEvents(10),
  ]);

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
            Recent Users
          </h2>
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
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Groups
          </h2>
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
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Events
          </h2>
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
      </section>
    </div>
  );
}
