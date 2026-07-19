import AxeBuilder from '@axe-core/playwright'
import { expect, test, skipE2EIfNeeded } from './fixtures'
import { signInWithTestSession } from './helpers/auth'
import { createProjectViaApi } from './helpers/project'

const env = skipE2EIfNeeded()
test.skip(!env.ready, env.skipReason)

for (const route of ['/dashboard', '/feedback']) {
  test(`${route} has no serious accessibility violations`, async ({ page }) => {
    await signInWithTestSession(page)
    await page.goto(route)
    await expect(page.locator('main')).toBeVisible()

    const result = await new AxeBuilder({ page })
      .include('main')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    const serious = result.violations.filter((violation) =>
      violation.impact === 'serious' || violation.impact === 'critical',
    )
    expect(serious).toEqual([])
  })
}

test('dashboard and inbox do not overflow a mobile viewport', async ({ page }) => {
  await signInWithTestSession(page)
  await page.setViewportSize({ width: 390, height: 844 })

  for (const route of ['/dashboard', '/feedback']) {
    await page.goto(route)
    await expect(page.locator('main')).toBeVisible()
    const sizes = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }))
    expect(sizes.content).toBeLessThanOrEqual(sizes.viewport)
  }
})

test('Updates setup is accessible and fits a mobile viewport', async ({ page }) => {
  await signInWithTestSession(page)
  const project = await createProjectViaApi(page, { name: `Playwright Accessible Updates ${Date.now().toString(36)}` })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`/projects/${project.id}/updates`, { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: 'Share what shipped, inside your product' })).toBeVisible()

  const result = await new AxeBuilder({ page })
    .include('main')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  const serious = result.violations.filter((violation) =>
    violation.impact === 'serious' || violation.impact === 'critical',
  )
  expect(serious).toEqual([])

  const sizes = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }))
  expect(sizes.content).toBeLessThanOrEqual(sizes.viewport)
})
