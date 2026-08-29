import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Mail, Shield, User } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Card, buttonVariants } from "@/components/ui";

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
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-2xl font-bold text-white shadow-sm">
          {initials || <User className="h-7 w-7" />}
        </div>
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-brand-600">
            Profile
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            {user.name}
          </h1>
        </div>
      </div>

      <Card className="mt-6 grid gap-4 p-5 sm:grid-cols-2">
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
      </Card>

      <Card className="mt-6 p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Quick actions
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/dashboard" className={buttonVariants({ variant: "primary" })}>
            Go to Dashboard
          </Link>
          <Link href="/groups" className={buttonVariants({ variant: "secondary" })}>
            My Groups
          </Link>
        </div>
      </Card>
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
    <div className="flex items-start gap-3 rounded-lg border border-line bg-surface-muted p-4">
      <span className="mt-0.5 text-ink-subtle">{icon}</span>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium text-ink">{value}</p>
      </div>
    </div>
  );
}
