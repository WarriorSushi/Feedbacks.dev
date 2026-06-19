import assert from 'node:assert/strict'
import test from 'node:test'

async function loadLimits() {
  return import(new URL('../../src/lib/webhook-delivery-limits.ts', import.meta.url).href)
}

test('webhook delivery logs use the Free entitlement cap', async () => {
  const { getWebhookDeliveryLogQueryLimit } = await loadLimits()

  assert.equal(getWebhookDeliveryLogQueryLimit({ webhookDeliveryLogLimit: 10 }), 10)
})

test('webhook delivery logs give Pro a broader operational window', async () => {
  const { getWebhookDeliveryLogQueryLimit, PRO_WEBHOOK_DELIVERY_LOG_LIMIT } = await loadLimits()

  assert.equal(getWebhookDeliveryLogQueryLimit({ webhookDeliveryLogLimit: null }), PRO_WEBHOOK_DELIVERY_LOG_LIMIT)
})

test('webhook delivery logs keep a safe default when billing is unavailable', async () => {
  const { getWebhookDeliveryLogQueryLimit, DEFAULT_WEBHOOK_DELIVERY_LOG_LIMIT } = await loadLimits()

  assert.equal(getWebhookDeliveryLogQueryLimit(null), DEFAULT_WEBHOOK_DELIVERY_LOG_LIMIT)
})
