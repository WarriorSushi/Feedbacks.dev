import assert from 'node:assert/strict'
import test from 'node:test'

async function loadProjectSelection() {
  return import(new URL('../../src/lib/project-selection.ts', import.meta.url).href)
}

test('selected project is moved to the front without changing other project order', async () => {
  const { prioritizeSelectedProject } = await loadProjectSelection()
  const projects = [{ id: 'recent' }, { id: 'selected' }, { id: 'older' }]

  assert.deepEqual(prioritizeSelectedProject(projects, 'selected'), [
    { id: 'selected' },
    { id: 'recent' },
    { id: 'older' },
  ])
  assert.deepEqual(projects, [{ id: 'recent' }, { id: 'selected' }, { id: 'older' }])
})

test('unknown or missing project selection keeps the original order', async () => {
  const { prioritizeSelectedProject } = await loadProjectSelection()
  const projects = [{ id: 'one' }, { id: 'two' }]

  assert.equal(prioritizeSelectedProject(projects), projects)
  assert.equal(prioritizeSelectedProject(projects, 'missing'), projects)
})
