import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  LogIn,
  MessageCircle,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

const FEATURES = [
  {
    title: "Create Events",
    description:
      "Set the date, location and capacity. Share with your group in seconds.",
    icon: CalendarDays,
  },
  {
    title: "Invite Friends",
    description:
      "Create a group and send an invite link. Promote managers to help organize.",
    icon: Users,
  },
  {
    title: "RSVP & Chat",
    description:
      "Members RSVP with +1 / +2 / +3 extra slots, comment and coordinate.",
    icon: MessageCircle,
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 flex-col">
      <section className="flex flex-1 items-center justify-center bg-gradient-to-b from-indigo-50 via-white to-white px-4 py-20">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-4 py-1.5 text-sm font-medium text-indigo-700 shadow-sm">
            <Sparkles className="h-4 w-4" />
            Plan together. Show up together.
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Events with friends,{" "}
            <span className="text-indigo-600">made simple.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg text-slate-600">
            Event Planner helps you organize gatherings — from rooftop dinners
            to mountain hikes. Create a group, send invites, RSVP, and keep the
            chat in one place.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <UserPlus className="h-5 w-5" />
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <LogIn className="h-5 w-5" />
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-slate-900">
            Everything you need to organize
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-slate-600">
            Stop juggling group chats and shared docs. Event Planner brings
            invitations, RSVPs and comments into one calm space.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {FEATURES.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Event Planner · Plan events with your friends.
      </footer>
    </div>
  );
}
