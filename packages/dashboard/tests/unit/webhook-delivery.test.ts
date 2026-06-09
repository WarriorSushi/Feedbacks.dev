import test from 'node:test'
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'

async function loadWebhookDelivery() {
  return import(new URL('../../src/lib/webhook-signing.ts', import.meta.url).href)
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
