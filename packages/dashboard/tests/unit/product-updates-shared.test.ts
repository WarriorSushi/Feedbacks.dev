import assert from 'node:assert/strict'
import test from 'node:test'

async function loadProductUpdates() {
  return import(new URL('../../../shared/src/product-updates.ts', import.meta.url).href)
}

test('product update validation accepts safe content and rejects unsafe CTAs', async () => {
  const { sanitizeProductUpdateInput } = await loadProductUpdates()
  const valid = sanitizeProductUpdateInput({
    title: 'Faster exports', summary: 'Exports now run in the background.',
    highlights: ['Leave the page while an export runs'], ctaLabel: 'Try it', ctaUrl: '/exports',
  }, { requirePublishFields: true })
  assert.deepEqual(valid.errors, {})
  assert.equal(valid.data.ctaUrl, '/exports')

  for (const ctaUrl of ['//evil.example', 'javascript:alert(1)', 'data:text/html,hello', 'https://user:password@example.com']) {
    const invalid = sanitizeProductUpdateInput({ title: 'Valid', summary: 'Valid summary', ctaLabel: 'Open', ctaUrl }, { requirePublishFields: true })
    assert.ok(invalid.errors.cta)
  }
})

test('product update paths and lifecycle state follow the published rules', async () => {
  const { isProductUpdatePathEligible, deriveProductUpdateState, sanitizeProductUpdateSettings } = await loadProductUpdates()
  const settings = sanitizeProductUpdateSettings({ includePaths: ['/app'], excludePaths: ['/app/auth'] })
  assert.deepEqual(settings.errors, {})
  assert.equal(isProductUpdatePathEligible('/app/settings', settings.data as { includePaths: string[]; excludePaths: string[] }), true)
  assert.equal(isProductUpdatePathEligible('/application', settings.data as { includePaths: string[]; excludePaths: string[] }), false)
  assert.equal(isProductUpdatePathEligible('/app/auth/login', settings.data as { includePaths: string[]; excludePaths: string[] }), false)
  assert.equal(deriveProductUpdateState({ status: 'published', publishedAt: '2026-07-19T00:00:00.000Z' }, new Date('2026-07-18T00:00:00.000Z')), 'Scheduled')
  assert.equal(deriveProductUpdateState({ status: 'published', publishedAt: '2026-07-17T00:00:00.000Z', expiresAt: '2026-07-18T00:00:00.000Z' }, new Date('2026-07-18T00:00:00.000Z')), 'Expired')
})
