import { IPaginatedResponse } from 'agrilog-shared';

export function paginateResponse<T>(
  items: T[],
  totalItems: number,
  page: number = 1,
  limit: number = 10,
): IPaginatedResponse<T> {
  const currentPage = Math.max(Number(page) || 1, 1);
  const itemsPerPage = Math.max(Number(limit) || 10, 1);
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  return {
    data: items,
    meta: {
      itemCount: items.length,
      totalItems,
      itemsPerPage,
      totalPages,
      currentPage,
    },
  };
}
