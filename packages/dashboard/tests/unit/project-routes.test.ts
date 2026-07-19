import assert from 'node:assert/strict'
import test from 'node:test'

async function loadProjectRoutes() {
  return import(new URL('../../src/lib/project-routes.ts', import.meta.url).href)
}

test('legacy project tab URLs redirect to their approved stable routes', async () => {
  const { getLegacyProjectTabRedirect } = await loadProjectRoutes()

  assert.equal(
    getLegacyProjectTabRedirect(new URL('https://app.feedbacks.dev/projects/project-1?tab=updates')),
    '/projects/project-1/updates',
  )
  assert.equal(
    getLegacyProjectTabRedirect(new URL('https://app.feedbacks.dev/projects/project-1?created=1&tab=install')),
    '/projects/project-1/install?created=1',
  )
  assert.equal(
    getLegacyProjectTabRedirect(new URL('https://app.feedbacks.dev/projects/project-1?tab=customize')),
    '/projects/project-1/install?view=customize',
  )
})

test('unknown project tabs and stable routes are not redirected', async () => {
  const { getLegacyProjectTabRedirect, getProjectRouteSection } = await loadProjectRoutes()

  assert.equal(getLegacyProjectTabRedirect(new URL('https://app.feedbacks.dev/projects/project-1?tab=unknown')), null)
  assert.equal(getProjectRouteSection('/projects/project-1/updates'), 'updates')
  assert.equal(getProjectRouteSection('/projects/project-1/updates/new'), 'updates')
  assert.equal(getProjectRouteSection('/projects/project-1'), null)
})
