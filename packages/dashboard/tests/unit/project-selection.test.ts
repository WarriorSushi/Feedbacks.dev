import assert from 'node:assert/strict'
import test from 'node:test'

async function loadProjectSelection() {
  return import(new URL('../../src/lib/project-selection.ts', import.meta.url).href)
}

test('selected project resolves from the saved project context', async () => {
  const { getSelectedProject } = await loadProjectSelection()
  const projects = [{ id: 'recent' }, { id: 'selected' }, { id: 'older' }]

  assert.deepEqual(getSelectedProject(projects, 'selected'), { id: 'selected' })
})

test('unknown or missing project selection falls back to the first project', async () => {
  const { getSelectedProject } = await loadProjectSelection()
  const projects = [{ id: 'one' }, { id: 'two' }]

  assert.deepEqual(getSelectedProject(projects), { id: 'one' })
  assert.deepEqual(getSelectedProject(projects, 'missing'), { id: 'one' })
  assert.equal(getSelectedProject([]), undefined)
})
