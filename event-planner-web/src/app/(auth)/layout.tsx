import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-12">
      {/* soft brand glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-brand-100/50 blur-3xl"
      />
      <Link href="/" className="relative mb-8 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
          <CalendarDays className="h-5 w-5" />
        </span>
        <span className="text-xl font-bold tracking-tight text-ink">
          Event Planner
        </span>
      </Link>
      <div className="relative flex w-full justify-center">{children}</div>
    </div>
  );
}
