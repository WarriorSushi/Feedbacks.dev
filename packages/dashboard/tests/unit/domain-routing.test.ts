import assert from 'node:assert/strict'
import test from 'node:test'

async function loadDomainRouting() {
  return import(new URL('../../src/lib/domain-routing.ts', import.meta.url).href)
}

test('dashboard surfaces redirect from marketing host to app host', async () => {
  const { getCanonicalHostRedirect } = await loadDomainRouting()

  const redirect = getCanonicalHostRedirect(new URL('https://www.feedbacks.dev/dashboard?hello=1'))

  assert.equal(redirect?.toString(), 'https://app.feedbacks.dev/dashboard?hello=1')
})

test('auth surfaces redirect from apex host to app host', async () => {
  const { getCanonicalHostRedirect } = await loadDomainRouting()

  const redirect = getCanonicalHostRedirect(new URL('https://feedbacks.dev/auth?redirect=%2Fprojects'))

  assert.equal(redirect?.toString(), 'https://app.feedbacks.dev/auth?redirect=%2Fprojects')
})

test('marketing surfaces redirect from app host to www host', async () => {
  const { getCanonicalHostRedirect } = await loadDomainRouting()

  const redirect = getCanonicalHostRedirect(new URL('https://app.feedbacks.dev/boards?sort=recent'))

  assert.equal(redirect?.toString(), 'https://www.feedbacks.dev/boards?sort=recent')
})

test('app root sends anonymous users to auth and signed-in users to dashboard', async () => {
  const { getCanonicalHostRedirect } = await loadDomainRouting()

  assert.equal(
    getCanonicalHostRedirect(new URL('https://app.feedbacks.dev/'), false)?.toString(),
    'https://app.feedbacks.dev/auth',
  )
  assert.equal(
    getCanonicalHostRedirect(new URL('https://app.feedbacks.dev/'), true)?.toString(),
    'https://app.feedbacks.dev/dashboard',
  )
})

test('preview deployments are left alone', async () => {
  const { getCanonicalHostRedirect } = await loadDomainRouting()

  const redirect = getCanonicalHostRedirect(
    new URL('https://feedbacks-dev-dashboard-preview.vercel.app/dashboard'),
  )

  assert.equal(redirect, null)
})
