import test from 'node:test'
import assert from 'node:assert/strict'

async function loadOriginAllowlist() {
  return import(new URL('../../src/lib/origin-allowlist.ts', import.meta.url).href)
}

test('normalizeAllowedOrigin accepts bare domains and exact origins only', async () => {
  const { normalizeAllowedOrigin } = await loadOriginAllowlist()

  assert.equal(normalizeAllowedOrigin('example.com'), 'https://example.com')
  assert.equal(normalizeAllowedOrigin('https://app.example.com'), 'https://app.example.com')
  assert.equal(normalizeAllowedOrigin('http://localhost:3000'), 'http://localhost:3000')
  assert.equal(normalizeAllowedOrigin('https://example.com/path'), null)
  assert.equal(normalizeAllowedOrigin('https://*.example.com'), null)
  assert.equal(normalizeAllowedOrigin('javascript:alert(1)'), null)
})

test('sanitizeWidgetOriginRestriction dedupes origins and disables empty restrictions', async () => {
  const { sanitizeWidgetOriginRestriction } = await loadOriginAllowlist()

  assert.deepEqual(
    sanitizeWidgetOriginRestriction({
      enabled: true,
      origins: ['example.com', 'https://example.com', 'https://app.example.com'],
    }),
    {
      enabled: true,
      origins: ['https://example.com', 'https://app.example.com'],
    },
  )

  assert.deepEqual(
    sanitizeWidgetOriginRestriction({
      enabled: true,
      origins: ['https://example.com/path'],
    }),
    {
      enabled: false,
      origins: [],
    },
  )
})

test('isWidgetRequestOriginAllowed allows defaults, exact origins, referers, and trusted app origins', async () => {
  const { isWidgetRequestOriginAllowed } = await loadOriginAllowlist()

  const restricted = {
    enabled: true,
    origins: ['https://example.com'],
  }

  assert.equal(isWidgetRequestOriginAllowed(new Request('https://app.test'), undefined), true)
  assert.equal(
    isWidgetRequestOriginAllowed(
      new Request('https://app.test', { headers: { Origin: 'https://example.com' } }),
      restricted,
    ),
    true,
  )
  assert.equal(
    isWidgetRequestOriginAllowed(
      new Request('https://app.test', { headers: { Referer: 'https://example.com/product' } }),
      restricted,
    ),
    true,
  )
  assert.equal(
    isWidgetRequestOriginAllowed(
      new Request('https://app.test', { headers: { Origin: 'https://app.feedbacks.dev' } }),
      restricted,
      { trustedOrigins: ['https://app.feedbacks.dev'] },
    ),
    true,
  )
  assert.equal(
    isWidgetRequestOriginAllowed(
      new Request('https://app.test', { headers: { Origin: 'https://evil.example' } }),
      restricted,
    ),
    false,
  )
  assert.equal(isWidgetRequestOriginAllowed(new Request('https://app.test'), restricted), false)
})
