import test from 'node:test'
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'

async function loadWebhookDelivery() {
  return import(new URL('../../src/lib/webhook-signing.ts', import.meta.url).href)
}

async function loadWebhookQueue() {
  return import(new URL('../../src/lib/webhook-payloads.ts', import.meta.url).href)
}

test('generic webhook signature headers use timestamp and raw body', async () => {
  const { buildGenericWebhookSignatureHeaders } = await loadWebhookDelivery()
  const rawBody = JSON.stringify({ event: 'feedback.test', ok: true })
  const timestamp = '1780000000'
  const secret = 'whsec_test_secret'

  const headers = buildGenericWebhookSignatureHeaders(rawBody, secret, timestamp)
  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex')

  assert.equal(headers['X-Feedbacks-Timestamp'], timestamp)
  assert.equal(headers['X-Feedbacks-Signature'], `v1=${expected}`)
})

test('generic webhook signature headers are omitted without a secret', async () => {
  const { buildGenericWebhookSignatureHeaders } = await loadWebhookDelivery()

  assert.deepEqual(buildGenericWebhookSignatureHeaders('{}'), {})
  assert.deepEqual(buildGenericWebhookSignatureHeaders('{}', '   '), {})
})

test('digest webhook payload carries window, count, and feedback batch', async () => {
  const { buildDigestPayload } = await loadWebhookQueue()

  const payload = buildDigestPayload(
    [
      { id: 'feedback-1', message: 'First item', type: 'bug' },
      { id: 'feedback-2', message: 'Second item', type: 'idea' },
    ],
    { id: 'project-1', name: 'Acme' },
    '2026-06-22T00:00:00.000Z',
    '2026-06-22T23:59:59.000Z',
  )

  assert.equal(payload.version, '2026-06-22')
  assert.equal(payload.event, 'feedback.digest')
  assert.equal(payload.count, 2)
  assert.equal(payload.window.start, '2026-06-22T00:00:00.000Z')
  assert.equal(payload.feedbacks[0].message, 'First item')
})
