import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { GroupCard } from "@/components/GroupCard";
import { SortLinks } from "@/components/SortLinks";
import { PageContainer } from "@/components/PageContainer";
import { EmptyState, buttonVariants } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { listUserGroupsPaged, parseGroupSort } from "@/services/groupService";

export const metadata = {
  title: "My Groups · Event Planner",
};

const GROUPS_PAGE_SIZE = 9;

const GROUP_SORT_OPTIONS = [
  { value: "title", label: "Title" },
  { value: "city", label: "City" },
];

function parsePageParam(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw ?? "1");
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export default async function GroupsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = (await getCurrentUser())!;
  const params = (await searchParams) ?? {};
  const page = parsePageParam(params.page);
  const sort = parseGroupSort(params.sort);
  const limit = page * GROUPS_PAGE_SIZE;

  const { items: groups, total } = await listUserGroupsPaged({
    userId: user.userId,
    limit,
    offset: 0,
    sort,
  });

  const hasMore = groups.length < total;

  return (
    <PageContainer>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            My Groups
          </h1>
          <p className="mt-1 text-ink-muted">
            Groups you have joined or created.
          </p>
        </div>
        <Link href="/groups/new" className={buttonVariants({ variant: "primary" })}>
          <Plus className="h-4 w-4" />
          New Group
        </Link>
      </header>

      {total > 0 && (
        <div className="mb-4">
          <SortLinks
            param="sort"
            current={sort}
            options={GROUP_SORT_OPTIONS}
            basePath="/groups"
            extraParams={{ page: String(page) }}
          />
        </div>
      )}

      {total === 0 ? (
        <EmptyState
          icon={Users}
          title="No groups yet"
          description="Create a group, or ask a friend for an invite link."
          action={
            <Link
              href="/groups/new"
              className={buttonVariants({ variant: "primary" })}
            >
              <Plus className="h-4 w-4" />
              Create your first group
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((g) => (
              <GroupCard key={g.id} group={g} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-6 flex justify-center">
              <Link
                href={{
                  pathname: "/groups",
                  query: { page: String(page + 1), sort },
                }}
                className={buttonVariants({ variant: "secondary" })}
              >
                Load more groups
              </Link>
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
}
