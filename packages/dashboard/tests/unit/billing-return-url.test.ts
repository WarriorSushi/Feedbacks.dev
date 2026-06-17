import test from 'node:test'
import assert from 'node:assert/strict'

import { buildBillingReturnUrl } from '../../src/lib/billing-return-url.ts'

test('billing checkout returns to the canonical app host', () => {
  const request = {
    nextUrl: new URL('https://www.feedbacks.dev/api/billing/checkout'),
  }

  assert.equal(
    buildBillingReturnUrl(request as never, '/billing?checkout=return'),
    'https://app.feedbacks.dev/billing?checkout=return',
  )
})

test('billing portal returns to app host when portal starts there', () => {
  const request = {
    nextUrl: new URL('https://app.feedbacks.dev/api/billing/portal'),
  }

  assert.equal(
    buildBillingReturnUrl(request as never, '/billing?portal=return'),
    'https://app.feedbacks.dev/billing?portal=return',
  )
})
