import assert from 'node:assert/strict'
import test from 'node:test'

async function loadTourPosition() {
  return import(new URL('../../src/lib/tour-position.ts', import.meta.url).href)
}

test('tour panel prefers a free side instead of covering content below', async () => {
  const { getTourPanelPosition } = await loadTourPosition()
  const result = getTourPanelPosition({
    spotlight: { top: 445, left: 565, width: 655, height: 76 },
    panel: { width: 360, height: 284 },
    viewport: { width: 1910, height: 915 },
  })

  assert.equal(result.left, 1234)
  assert.equal(result.top, 445)
})

test('tour panel moves above a wide mobile target near the bottom', async () => {
  const { getTourPanelPosition } = await loadTourPosition()
  const result = getTourPanelPosition({
    spotlight: { top: 700, left: 8, width: 374, height: 60 },
    panel: { width: 358, height: 260 },
    viewport: { width: 390, height: 844 },
  })

  assert.ok(result.top < 700)
  assert.equal(result.left, 16)
})

test('tour panel waits for a target outside the center of the page', async () => {
  const { getTourPanelPosition } = await loadTourPosition()

  assert.deepEqual(getTourPanelPosition({
    spotlight: null,
    panel: { width: 360, height: 260 },
    viewport: { width: 1440, height: 900 },
  }), { top: 16, left: 1064 })
})
