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
import { Card, CardContent, buttonVariants } from "@/components/ui";

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
      <section className="relative flex flex-1 items-center justify-center overflow-hidden bg-gradient-to-b from-brand-50 via-app to-app px-4 py-24">
        {/* soft radial glow behind the hero */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-brand-200/40 blur-3xl"
        />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="inline-flex animate-fade-in-up items-center gap-2 rounded-full border border-brand-200 bg-surface px-4 py-1.5 text-sm font-medium text-brand-700 shadow-xs">
            <Sparkles className="h-4 w-4" />
            Plan together. Show up together.
          </div>

          <h1
            className="mt-6 animate-fade-in-up text-4xl font-bold tracking-tight text-ink sm:text-5xl md:text-6xl"
            style={{ animationDelay: "80ms" }}
          >
            Events with friends,{" "}
            <span className="bg-gradient-to-r from-accent-from to-accent-to bg-clip-text text-transparent">
              made simple.
            </span>
          </h1>

          <p
            className="mt-6 max-w-xl animate-fade-in-up text-lg text-ink-muted"
            style={{ animationDelay: "160ms" }}
          >
            Event Planner helps you organize gatherings — from rooftop dinners
            to mountain hikes. Create a group, send invites, RSVP, and keep the
            chat in one place.
          </p>

          <div
            className="mt-8 flex animate-fade-in-up flex-col gap-3 sm:flex-row"
            style={{ animationDelay: "240ms" }}
          >
            <Link
              href="/register"
              className={buttonVariants({ variant: "primary", size: "lg" })}
            >
              <UserPlus className="h-5 w-5" />
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className={buttonVariants({ variant: "secondary", size: "lg" })}
            >
              <LogIn className="h-5 w-5" />
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-surface px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-ink">
            Everything you need to organize
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-ink-muted">
            Stop juggling group chats and shared docs. Event Planner brings
            invitations, RSVPs and comments into one calm space.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {FEATURES.map(({ title, description, icon: Icon }) => (
              <Card
                key={title}
                className="transition-shadow hover:shadow-md"
              >
                <CardContent className="p-6 pt-6">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-ink">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">
                    {description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-line bg-surface px-4 py-6 text-center text-sm text-ink-subtle">
        © {new Date().getFullYear()} Event Planner · Plan events with your friends.
      </footer>
    </div>
  );
}
