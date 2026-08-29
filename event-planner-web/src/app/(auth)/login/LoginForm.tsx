"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  LogIn,
  Mail,
  Lock,
  AlertCircle,
  ShieldCheck,
  UserCog,
  User as UserIcon,
} from "lucide-react";
import { loginAction, type AuthFormState } from "@/lib/actions/auth";
import { Button, Card, Input, Label } from "@/components/ui";

const initialState: AuthFormState = { error: null };

type DemoAccount = {
  label: string;
  role: string;
  email: string;
  password: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
};

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    label: "Admin",
    role: "Administrator",
    email: "admin@demo.com",
    password: "demo123",
    description: "Full access to the admin panel.",
    icon: ShieldCheck,
    accent: "bg-danger-soft text-danger-ink ring-danger/20",
  },
  {
    label: "Manager",
    role: "Group Manager",
    email: "hristo.yordanov40@example.com",
    password: "demo123",
    description: "Manages groups and creates events.",
    icon: UserCog,
    accent: "bg-warning-soft text-warning-ink ring-warning/20",
  },
  {
    label: "Member",
    role: "Group Member",
    email: "ivan.marinov39@example.com",
    password: "demo123",
    description: "RSVPs and comments on events.",
    icon: UserIcon,
    accent: "bg-success-soft text-success-ink ring-success/20",
  },
];

export function LoginForm({ redirectTo }: { redirectTo: string | null }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Card className="w-full max-w-md animate-fade-in p-8 shadow-lg">
      <h1 className="text-2xl font-bold tracking-tight text-ink">Sign In</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Welcome back — let&apos;s plan something fun.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        {redirectTo && (
          <input type="hidden" name="redirect" value={redirectTo} />
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
            <Input
              id="email"
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
            <Input
              id="password"
              name="password"
              type="password"
              required
              maxLength={200}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9"
              placeholder="••••••••"
            />
          </div>
        </div>

        {state.error && (
          <div className="flex items-start gap-2 rounded-lg border border-danger/20 bg-danger-soft p-3 text-sm text-danger-ink">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <Button type="submit" loading={pending} className="w-full">
          {!pending && <LogIn className="h-4 w-4" />}
          {pending ? "Signing in…" : "Sign In"}
        </Button>
      </form>

      <div className="mt-6">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-line" />
          <span className="text-xs font-medium uppercase tracking-wider text-ink-subtle">
            Demo Accounts
          </span>
          <div className="h-px flex-1 bg-line" />
        </div>

        <ul className="mt-4 space-y-3">
          {DEMO_ACCOUNTS.map((account) => {
            const Icon = account.icon;
            return (
              <li
                key={account.email}
                className="rounded-lg border border-line bg-surface p-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ring-1 ring-inset ${account.accent}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-ink">
                        {account.label}
                      </span>
                      <span className="text-[10px] font-medium uppercase tracking-wide text-ink-subtle">
                        {account.role}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {account.description}
                    </p>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5">
                  <CredentialRow label="Email" value={account.email} />
                  <CredentialRow label="Password" value={account.password} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-brand-600 hover:text-brand-700"
        >
          Register
        </Link>
      </p>
    </Card>
  );
}

function CredentialRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-line bg-surface-muted px-2.5 py-1.5">
      <span className="w-16 flex-shrink-0 text-[10px] font-medium uppercase tracking-wide text-ink-muted">
        {label}
      </span>
      <input
        type="text"
        value={value}
        readOnly
        aria-label={label}
        title={label}
        placeholder={label}
        onFocus={(e) => e.currentTarget.select()}
        onClick={(e) => e.currentTarget.select()}
        className="min-w-0 flex-1 cursor-text select-all border-none bg-transparent p-0 font-mono text-xs text-ink focus:outline-none focus:ring-0"
      />
    </div>
  );
}
