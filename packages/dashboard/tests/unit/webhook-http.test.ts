import assert from 'node:assert/strict'
import test from 'node:test'

async function loadWebhookHttp() {
  return import(new URL('../../src/lib/webhook-http.ts', import.meta.url).href)
}

test('webhook targets require HTTPS and reject embedded credentials', async () => {
  const { parseWebhookTarget } = await loadWebhookHttp()

  assert.throws(() => parseWebhookTarget('http://example.com/hook'), /HTTPS/)
  assert.throws(() => parseWebhookTarget('https://user:secret@example.com/hook'), /credentials/)
  assert.equal(parseWebhookTarget('https://hooks.example.com/v1').hostname, 'hooks.example.com')
})

test('webhook address validation blocks private, reserved, and loopback networks', async () => {
  const { isPublicWebhookAddress } = await loadWebhookHttp()

  for (const address of [
    '0.0.0.0',
    '10.0.0.1',
    '100.64.0.1',
    '127.0.0.1',
    '169.254.169.254',
    '172.16.0.1',
    '192.168.1.2',
    '198.51.100.8',
    '::1',
    'fc00::1',
    'fe80::1',
  ]) {
    assert.equal(isPublicWebhookAddress(address), false, `${address} should be blocked`)
  }

  assert.equal(isPublicWebhookAddress('1.1.1.1'), true)
  assert.equal(isPublicWebhookAddress('2606:4700:4700::1111'), true)
})

test('webhook DNS validation fails closed when any answer is private', async () => {
  const { resolvePublicWebhookTarget } = await loadWebhookHttp()
  const mixedLookup = async () => [
    { address: '1.1.1.1', family: 4 },
    { address: '127.0.0.1', family: 4 },
  ]

  await assert.rejects(
    resolvePublicWebhookTarget('https://hooks.example.com/test', mixedLookup),
    /private or reserved/,
  )
})

test('webhook transport exposes a bounded timeout and rejects redirects by contract', async () => {
  const {
    formatWebhookResponseBody,
    WEBHOOK_REQUEST_TIMEOUT_MS,
    WEBHOOK_RESPONSE_BODY_LIMIT_BYTES,
  } = await loadWebhookHttp()

  assert.equal(WEBHOOK_REQUEST_TIMEOUT_MS, 8_000)
  assert.equal(WEBHOOK_RESPONSE_BODY_LIMIT_BYTES, 64 * 1024)
  assert.equal(
    formatWebhookResponseBody(302, 'redirect body'),
    'Redirect responses are not followed for webhook delivery',
  )
  assert.equal(formatWebhookResponseBody(200, 'ok', true), 'ok\n[response truncated]')
})
