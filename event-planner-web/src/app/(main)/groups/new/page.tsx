import { CreateGroupForm } from "./CreateGroupForm";

export const metadata = {
  title: "New Group · Event Planner",
};

export default function NewGroupPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-ink">
        Create a new group
      </h1>
      <p className="mt-1 text-ink-muted">
        You will become its first manager and can invite others.
      </p>
      <div className="mt-6">
        <CreateGroupForm />
      </div>
    </div>
  );
}
