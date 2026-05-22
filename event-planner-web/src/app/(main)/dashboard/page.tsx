import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
      <p className="mt-2 text-slate-600">
        Welcome, <span className="font-medium">{user?.email}</span>.
      </p>
      <p className="mt-6 rounded-md border border-dashed border-slate-300 bg-white p-6 text-slate-500">
        Active events and archive will appear here.
      </p>
    </div>
  );
}
