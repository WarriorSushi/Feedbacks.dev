import assert from 'node:assert/strict'
import test from 'node:test'

async function loadProjectIcons() {
  return import('../../src/lib/project-icons.ts')
}

test('project icon presets are unique and accepted by validation', async () => {
  const { PROJECT_ICONS, isProjectIcon } = await loadProjectIcons()
  const emojis = PROJECT_ICONS.map((icon) => icon.emoji)

  assert.equal(new Set(emojis).size, emojis.length)
  assert.ok(PROJECT_ICONS.every((icon) => isProjectIcon(icon.emoji)))
})

test('project icon validation rejects arbitrary values', async () => {
  const { isProjectIcon } = await loadProjectIcons()

  assert.equal(isProjectIcon('not-an-icon'), false)
  assert.equal(isProjectIcon(null), false)
})

