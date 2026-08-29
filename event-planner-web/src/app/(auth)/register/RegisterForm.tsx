"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  AlertCircle,
  Lock,
  Mail,
  User as UserIcon,
  UserPlus,
} from "lucide-react";
import { registerAction, type AuthFormState } from "@/lib/actions/auth";
import { Button, Card, Input, Label } from "@/components/ui";
import { cn } from "@/lib/cn";

const initialState: AuthFormState = { error: null };

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <Card className="w-full max-w-sm animate-fade-in p-8 shadow-lg">
      <h1 className="text-2xl font-bold tracking-tight text-ink">
        Create account
      </h1>
      <p className="mt-1 text-sm text-ink-muted">
        Join Event Planner and start organizing.
      </p>

      <form
        action={formAction}
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          if (password !== confirmPassword) {
            e.preventDefault();
          }
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <div className="relative">
            <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
            <Input
              id="name"
              name="name"
              type="text"
              required
              minLength={2}
              maxLength={120}
              autoComplete="name"
              className="pl-9"
              placeholder="Jane Doe"
            />
          </div>
        </div>

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
              minLength={6}
              maxLength={200}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9"
              placeholder="at least 6 characters"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              maxLength={200}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={cn(
                "pl-9",
                mismatch &&
                  "border-danger focus:border-danger focus:ring-danger/20"
              )}
              placeholder="repeat password"
            />
          </div>
          {mismatch && (
            <p className="text-xs text-danger-ink">Passwords do not match.</p>
          )}
        </div>

        {state.error && (
          <div className="flex items-start gap-2 rounded-lg border border-danger/20 bg-danger-soft p-3 text-sm text-danger-ink">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <Button
          type="submit"
          loading={pending}
          disabled={mismatch}
          className="w-full"
        >
          {!pending && <UserPlus className="h-4 w-4" />}
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-brand-600 hover:text-brand-700"
        >
          Sign in
        </Link>
      </p>
    </Card>
  );
}
