import { CreateGroupForm } from "./CreateGroupForm";

export const metadata = {
  title: "New Group · Event Planner",
};

export default function NewGroupPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        Create a new group
      </h1>
      <p className="mt-1 text-slate-600">
        You will become its first manager and can invite others.
      </p>
      <div className="mt-6">
        <CreateGroupForm />
      </div>
    </div>
  );
}
