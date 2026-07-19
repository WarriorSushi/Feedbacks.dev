import { expect, test, skipE2EIfNeeded } from './fixtures'
import { signInWithTestSession } from './helpers/auth'
import { createProjectViaApi } from './helpers/project'

const env = skipE2EIfNeeded()
test.skip(!env.ready, env.skipReason)

test('captures the current project navigation at desktop, tablet, and mobile widths', async ({ page }, testInfo) => {
  await signInWithTestSession(page)
  const project = await createProjectViaApi(page, { name: `Navigation baseline ${Date.now().toString(36)}` })

  for (const [name, viewport] of [
    ['desktop', { width: 1440, height: 1000 }],
    ['tablet', { width: 834, height: 1112 }],
    ['mobile', { width: 390, height: 844 }],
  ] as const) {
    await page.setViewportSize(viewport)
    await page.goto(`/projects/${project.id}?tab=updates`, { waitUntil: 'domcontentloaded' })
    await expect(page.locator('[data-project-tabs-ready="true"]')).toBeVisible()

    if (name === 'mobile') {
      const menu = page.getByRole('button', { name: 'Toggle menu' })
      await menu.click()
      await expect(page.getByRole('navigation')).toBeVisible()
    }

    await page.screenshot({ path: testInfo.outputPath(`navigation-${name}.png`), fullPage: true })
  }
})
