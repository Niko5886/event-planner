"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Clock,
  Loader2,
  MapPin,
  Plus,
  Tag,
  Users,
  X,
} from "lucide-react";
import {
  createEventAction,
  type EventActionState,
} from "@/lib/actions/events";

const initialState: EventActionState = { error: null };

type Props = {
  groupId: number;
};

export function CreateEventForm({ groupId }: Props) {
  const [state, action, pending] = useActionState(
    createEventAction,
    initialState
  );

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="groupId" value={groupId} />

      <Field
        label="Title"
        name="title"
        required
        maxLength={120}
        placeholder="Event name"
      />

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-slate-700"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={2000}
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="A short description of the event…"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Date"
          name="date"
          type="date"
          icon={<CalendarDays className="h-4 w-4" />}
          required
        />
        <Field
          label="Time"
          name="time"
          type="time"
          icon={<Clock className="h-4 w-4" />}
          required
        />
        <Field
          label="Location"
          name="location"
          icon={<MapPin className="h-4 w-4" />}
          maxLength={200}
          placeholder="Address or venue"
        />
        <Field
          label="Type"
          name="eventType"
          icon={<Tag className="h-4 w-4" />}
          maxLength={50}
          placeholder="party, hike, dinner…"
        />
        <Field
          label="Capacity"
          name="capacity"
          type="number"
          icon={<Users className="h-4 w-4" />}
          defaultValue="12"
          min={0}
          max={1000}
          required
        />
      </div>

      {state.error && (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {pending ? "Creating…" : "Create event"}
        </button>
        <Link
          href={`/groups/${groupId}`}
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <X className="h-4 w-4" />
          Cancel
        </Link>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  icon,
  defaultValue,
  placeholder,
  required,
  maxLength,
  min,
  max,
}: {
  label: string;
  name: string;
  type?: string;
  icon?: React.ReactNode;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative mt-1">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        <input
          id={name}
          name={name}
          type={type}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          min={min}
          max={max}
          className={`w-full rounded-md border border-slate-300 bg-white py-2 ${
            icon ? "pl-9" : "pl-3"
          } pr-3 text-sm shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
        />
      </div>
    </div>
  );
}
