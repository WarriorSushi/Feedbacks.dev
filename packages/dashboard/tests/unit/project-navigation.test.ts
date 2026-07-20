import assert from 'node:assert/strict'
import test from 'node:test'
import { LEGACY_PROJECT_ROUTE_MAPPINGS } from './fixtures/project-route-mapping.fixture.ts'

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
    '/projects/next-project/integrations',
  )
})

test('project switching preserves every project surface while moving to stable routes', async () => {
  const { getProjectDestination } = await loadProjectNavigation()

  for (const { tab, futurePath } of LEGACY_PROJECT_ROUTE_MAPPINGS) {
    assert.equal(
      getProjectDestination({
        projectId: 'next project',
        pathname: '/projects/current-project',
        activeProjectTab: tab,
      }),
      futurePath.replace('{projectId}', 'next%20project'),
    )
  }
})

test('legacy project tab fixture covers the approved stable route map', () => {
  const expectedFuturePaths = {
    install: '/projects/{projectId}/install',
    customize: '/projects/{projectId}/feedback-form',
    integrations: '/projects/{projectId}/integrations',
    board: '/projects/{projectId}/board',
    updates: '/projects/{projectId}/release-notes',
    api: '/projects/{projectId}/api',
    settings: '/projects/{projectId}/settings',
  }

  assert.deepEqual(
    Object.fromEntries(LEGACY_PROJECT_ROUTE_MAPPINGS.map(({ tab, futurePath }) => [tab, futurePath])),
    expectedFuturePaths,
  )
})
