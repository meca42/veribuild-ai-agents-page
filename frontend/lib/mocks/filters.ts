export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface SortParams {
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface SearchParams {
  q?: string;
}

export interface DateRangeParams {
  dateFrom?: string;
  dateTo?: string;
}

export interface FilterParams extends PaginationParams, SortParams, SearchParams, DateRangeParams {
  status?: string;
  [key: string]: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const applySearch = <T>(items: T[], query: string, fields: (keyof T)[]): T[] => {
  if (!query) return items;
  const lowerQuery = query.toLowerCase();
  return items.filter((item) =>
    fields.some((field) => {
      const value = item[field];
      return String(value).toLowerCase().includes(lowerQuery);
    })
  );
};

export const applySort = <T>(items: T[], sortBy: string, sortDir: 'asc' | 'desc'): T[] => {
  if (!sortBy) return items;

  return [...items].sort((a, b) => {
    const aVal = (a as any)[sortBy];
    const bVal = (b as any)[sortBy];

    if (aVal === bVal) return 0;

    let comparison = 0;
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      comparison = aVal.localeCompare(bVal);
    } else if (aVal instanceof Date && bVal instanceof Date) {
      comparison = aVal.getTime() - bVal.getTime();
    } else {
      comparison = aVal < bVal ? -1 : 1;
    }

    return sortDir === 'asc' ? comparison : -comparison;
  });
};

export const applyPagination = <T>(items: T[], page = 1, pageSize = 10): T[] => {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
};

export const applyDateRange = <T>(
  items: T[],
  field: keyof T,
  dateFrom?: string,
  dateTo?: string
): T[] => {
  if (!dateFrom && !dateTo) return items;

  return items.filter((item) => {
    const itemDate = item[field];
    if (!(itemDate instanceof Date)) return true;

    if (dateFrom && itemDate < new Date(dateFrom)) return false;
    if (dateTo && itemDate > new Date(dateTo)) return false;
    return true;
  });
};

export const createPaginatedResponse = <T>(
  allItems: T[],
  params: FilterParams
): PaginatedResponse<T> => {
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;

  return {
    data: applyPagination(allItems, page, pageSize),
    total: allItems.length,
    page,
    pageSize,
  };
};
