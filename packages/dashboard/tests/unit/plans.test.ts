import assert from 'node:assert/strict'
import test from 'node:test'

async function loadPlans() {
  return import(new URL('../../../shared/src/plans.ts', import.meta.url).href)
}

test('free plan exposes limited API, MCP, and webhook access', async () => {
  const { getEntitlementsForPlan } = await loadPlans()
  const free = getEntitlementsForPlan('free')

  assert.equal(free.projectLimit, 2)
  assert.equal(free.apiAccess, true)
  assert.equal(free.mcp, true)
  assert.equal(free.webhooks, true)
  assert.equal(free.webhookEndpointLimit, 1)
  assert.equal(free.webhookDeliveryLogLimit, 10)
})

test('pro plan keeps integration and API limits uncapped', async () => {
  const { getEntitlementsForPlan } = await loadPlans()
  const pro = getEntitlementsForPlan('pro')

  assert.equal(pro.apiAccess, true)
  assert.equal(pro.mcp, true)
  assert.equal(pro.webhooks, true)
  assert.equal(pro.webhookEndpointLimit, null)
  assert.equal(pro.webhookDeliveryLogLimit, null)
})
