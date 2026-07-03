import assert from 'node:assert/strict'
import test from 'node:test'

async function loadBoardPagination() {
  return import(new URL('../../src/lib/board-directory-pagination.ts', import.meta.url).href)
}

test('board directory pagination returns a bounded page', async () => {
  const { BOARD_DIRECTORY_PAGE_SIZE, paginateBoardDirectoryEntries } = await loadBoardPagination()
  const entries = Array.from({ length: 204 }, (_, index) => index + 1)

  assert.equal(BOARD_DIRECTORY_PAGE_SIZE, 24)
  assert.deepEqual(paginateBoardDirectoryEntries(entries, 1), entries.slice(0, 24))
  assert.deepEqual(paginateBoardDirectoryEntries(entries, 2), entries.slice(24, 48))
  assert.deepEqual(paginateBoardDirectoryEntries(entries, 9), entries.slice(192, 204))
})
