import { expect, test, skipE2EIfNeeded } from './fixtures'
import { signInWithTestSession } from './helpers/auth'

const env = skipE2EIfNeeded()
test.skip(!env.ready, env.skipReason)

test('protected routes require authentication and billing state loads after sign-in', async ({ page }) => {
  await page.context().clearCookies()
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/auth\?redirect=/)
  await expect(page.getByRole('heading', { name: 'Sign in to start setup' })).toBeVisible()

  await signInWithTestSession(page)
  await page.goto('/billing')
  await expect(page.getByRole('heading', { name: 'Billing', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Billing and plan' })).toBeVisible()

  const billingResponse = await page.request.get('/api/billing/sync')
  expect(billingResponse.ok()).toBeTruthy()
  const summary = await billingResponse.json()
  expect(summary.entitlements).toBeTruthy()
  expect(summary.usage).toBeTruthy()
})
