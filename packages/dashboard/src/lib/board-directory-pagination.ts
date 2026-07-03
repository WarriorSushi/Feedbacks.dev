export const BOARD_DIRECTORY_PAGE_SIZE = 24

export function paginateBoardDirectoryEntries<T>(
  entries: T[],
  page: number,
  pageSize = BOARD_DIRECTORY_PAGE_SIZE,
): T[] {
  const safePage = Math.max(1, Math.floor(page))
  const safePageSize = Math.max(1, Math.floor(pageSize))
  return entries.slice((safePage - 1) * safePageSize, safePage * safePageSize)
}
