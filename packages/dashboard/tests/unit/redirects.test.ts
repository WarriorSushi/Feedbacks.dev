import assert from 'node:assert/strict'
import test from 'node:test'

async function loadRedirects() {
  return import(new URL('../../src/lib/redirects.ts', import.meta.url).href)
}

test('sanitizeRedirectPath keeps same-origin relative paths', async () => {
  const { sanitizeRedirectPath } = await loadRedirects()

  assert.equal(sanitizeRedirectPath('/projects/new'), '/projects/new')
  assert.equal(sanitizeRedirectPath('/feedback?status=new#top'), '/feedback?status=new#top')
})

test('sanitizeRedirectPath rejects external or malformed redirects', async () => {
  const { sanitizeRedirectPath } = await loadRedirects()

  assert.equal(sanitizeRedirectPath('https://evil.example'), '/dashboard')
  assert.equal(sanitizeRedirectPath('//evil.example/path'), '/dashboard')
  assert.equal(sanitizeRedirectPath('/\\evil'), '/dashboard')
  assert.equal(sanitizeRedirectPath('dashboard'), '/dashboard')
  assert.equal(sanitizeRedirectPath(null, '/projects/new'), '/projects/new')
})
