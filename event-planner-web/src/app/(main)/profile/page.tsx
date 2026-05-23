import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Mail, Shield, User } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-bold text-white shadow-sm">
          {initials || <User className="h-7 w-7" />}
        </div>
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-indigo-600">
            Profile
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {user.name}
          </h1>
        </div>
      </div>

      <section className="mt-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
        <InfoCard icon={<Mail className="h-4 w-4" />} label="Email" value={user.email} />
        <InfoCard
          icon={<Shield className="h-4 w-4" />}
          label="Role"
          value={user.role === "admin" ? "Admin" : "User"}
        />
        <InfoCard
          icon={<CalendarDays className="h-4 w-4" />}
          label="Account type"
          value="Registered account"
        />
        <InfoCard
          icon={<User className="h-4 w-4" />}
          label="Display name"
          value={user.name}
        />
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Quick actions
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/groups"
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            My Groups
          </Link>
        </div>
      </section>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}
