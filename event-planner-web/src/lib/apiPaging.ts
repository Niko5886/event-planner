export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export type Paging = {
  page: number;
  limit: number;
  offset: number;
};

export function parsePaging(searchParams: URLSearchParams): Paging {
  let page = Number(searchParams.get("page") ?? "1");
  if (!Number.isInteger(page) || page < 1) page = 1;

  let limit = Number(searchParams.get("limit") ?? String(DEFAULT_PAGE_SIZE));
  if (!Number.isInteger(limit) || limit < 1) limit = DEFAULT_PAGE_SIZE;
  if (limit > MAX_PAGE_SIZE) limit = MAX_PAGE_SIZE;

  return { page, limit, offset: (page - 1) * limit };
}

export function pagedResponse<T>(
  items: T[],
  paging: Paging,
  total: number
): {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
} {
  return {
    data: items,
    page: paging.page,
    limit: paging.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / paging.limit)),
  };
}
