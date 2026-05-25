"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  Loader2,
  LogIn,
  Mail,
  Lock,
  AlertCircle,
  ShieldCheck,
  UserCog,
  User as UserIcon,
} from "lucide-react";
import { loginAction, type AuthFormState } from "@/lib/actions/auth";

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
    accent: "bg-rose-50 text-rose-700 ring-rose-200",
  },
  {
    label: "Manager",
    role: "Group Manager",
    email: "hristo.yordanov40@example.com",
    password: "demo123",
    description: "Manages groups and creates events.",
    icon: UserCog,
    accent: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  {
    label: "Member",
    role: "Group Member",
    email: "ivan.marinov39@example.com",
    password: "demo123",
    description: "RSVPs and comments on events.",
    icon: UserIcon,
    accent: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
];

export function LoginForm({ redirectTo }: { redirectTo: string | null }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Sign In</h1>
      <p className="mt-1 text-sm text-slate-500">
        Welcome back — let&apos;s plan something fun.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        {redirectTo && (
          <input type="hidden" name="redirect" value={redirectTo} />
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <div className="relative mt-1">
            <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              id="email"
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <div className="relative mt-1">
            <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              id="password"
              name="password"
              type="password"
              required
              maxLength={200}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>
        </div>

        {state.error && (
          <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogIn className="h-4 w-4" />
          )}
          {pending ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <div className="mt-6">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Demo Accounts
          </span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <ul className="mt-4 space-y-3">
          {DEMO_ACCOUNTS.map((account) => {
            const Icon = account.icon;
            return (
              <li
                key={account.email}
                className="rounded-lg border border-slate-200 bg-white p-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ring-1 ring-inset ${account.accent}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {account.label}
                      </span>
                      <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        {account.role}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
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

      <p className="mt-6 text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
          Register
        </Link>
      </p>
    </div>
  );
}

function CredentialRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5">
      <span className="w-16 flex-shrink-0 text-[10px] font-medium uppercase tracking-wide text-slate-500">
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
        className="min-w-0 flex-1 cursor-text select-all border-none bg-transparent p-0 font-mono text-xs text-slate-800 focus:outline-none focus:ring-0"
      />
    </div>
  );
}
