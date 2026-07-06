import assert from 'node:assert/strict'
import test from 'node:test'
import { operationalRetentionCutoffs } from '../../src/lib/operational-retention.ts'

test('operational retention uses bounded cutoffs without touching customer feedback', () => {
  const now = Date.parse('2026-07-06T00:00:00.000Z')
  assert.deepEqual(operationalRetentionCutoffs(now), {
    succeededWebhookJobsBefore: '2026-06-06T00:00:00.000Z',
    cronRunsBefore: '2026-04-07T00:00:00.000Z',
  })
})

