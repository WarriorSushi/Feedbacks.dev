import test from 'node:test'
import assert from 'node:assert/strict'

test('auth status CORS allows only trusted marketing origins', async () => {
  const { getAuthStatusCorsHeaders } = await import(
    new URL('../../src/lib/auth-status-cors.ts', import.meta.url).href
  )

  for (const origin of ['https://feedbacks.dev', 'https://www.feedbacks.dev']) {
    assert.deepEqual(getAuthStatusCorsHeaders(origin), {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    })
  }

  for (const origin of [null, 'https://evil.example', 'https://feedbacks.dev.evil.example']) {
    assert.deepEqual(getAuthStatusCorsHeaders(origin), {})
  }
})
