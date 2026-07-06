import assert from 'node:assert/strict'
import test from 'node:test'

async function loadProjectNavigation() {
  return import(new URL('../../src/lib/project-navigation.ts', import.meta.url).href)
}

test('project switching preserves project-aware dashboard surfaces', async () => {
  const { getProjectDestination } = await loadProjectNavigation()
  const projectId = 'project next'

  assert.equal(
    getProjectDestination({ projectId, pathname: '/dashboard' }),
    '/dashboard?project=project%20next',
  )
  assert.equal(
    getProjectDestination({ projectId, pathname: '/feedback' }),
    '/feedback?projectId=project%20next',
  )
  assert.equal(
    getProjectDestination({ projectId, pathname: '/dashboard/boards' }),
    '/dashboard/boards?project=project%20next',
  )
})

test('project switching preserves the active project workspace section', async () => {
  const { getProjectDestination } = await loadProjectNavigation()

  assert.equal(
    getProjectDestination({
      projectId: 'next-project',
      pathname: '/projects/current-project',
      activeProjectTab: 'integrations',
    }),
    '/projects/next-project?tab=integrations',
  )
})
