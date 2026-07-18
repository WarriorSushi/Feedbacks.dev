import { expect, test, skipE2EIfNeeded } from './fixtures'
import { signInWithTestSession } from './helpers/auth'

const env = skipE2EIfNeeded()
test.skip(!env.ready, env.skipReason)

const tourSteps = [
  { title: 'Dashboard', path: /\/dashboard(?:\?.*)?$/, target: 'nav-dashboard' },
  { title: 'Feedback', path: /\/feedback(?:\?.*)?$/, target: 'nav-feedback' },
  { title: 'Projects', path: /\/projects(?:\?.*)?$/, target: 'nav-projects' },
  { title: 'Integrations', path: /\/projects\/[^/?]+\?tab=integrations(?:&.*)?$/, target: 'nav-integrations' },
  { title: 'Public Boards', path: /\/dashboard\/boards\?project=[^&]+(?:&.*)?$/, target: 'nav-boards' },
  { title: 'API', path: /\/projects\/[^/?]+\?tab=api(?:&.*)?$/, target: 'nav-api' },
  { title: 'Billing', path: /\/billing(?:\?.*)?$/, target: 'nav-billing' },
  { title: 'Settings', path: /\/settings(?:\?.*)?$/, target: 'nav-settings' },
]

test.describe('product tour', () => {
  test('walks every navigation step and finishes on the dashboard', async ({ page }) => {
    await signInWithTestSession(page)
    await page.goto('/dashboard?tour=1')

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    for (const [index, step] of tourSteps.entries()) {
      await expect(dialog.getByRole('heading', { name: step.title, exact: true })).toBeVisible()
      await expect(page).toHaveURL(step.path)

      const visibleTarget = page.locator(`[data-tour="${step.target}"]:visible`)
      await expect(visibleTarget).toBeVisible()
      await expect(visibleTarget).toHaveClass(/text-primary/)

      if (index < tourSteps.length - 1) {
        await page.getByRole('button', { name: 'Next', exact: true }).click()
      }
    }

    await page.getByRole('button', { name: 'Finish', exact: true }).click()
    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.getByRole('dialog')).toBeHidden()
  })

  test('walks every mobile step without covering the highlighted menu item', async ({ page }) => {
    await signInWithTestSession(page)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/dashboard?tour=1')

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    for (const [index, step] of tourSteps.entries()) {
      await expect(dialog.getByRole('heading', { name: step.title, exact: true })).toBeVisible()
      await expect(page).toHaveURL(step.path)

      const target = page.locator(`[data-tour="${step.target}"]:visible`)
      await expect(target).toBeVisible()
      await expect(target).toHaveClass(/text-primary/)

      const [dialogBox, targetBox] = await Promise.all([dialog.boundingBox(), target.boundingBox()])
      expect(dialogBox).not.toBeNull()
      expect(targetBox).not.toBeNull()

      const overlaps = Boolean(
        dialogBox &&
        targetBox &&
        dialogBox.x < targetBox.x + targetBox.width &&
        dialogBox.x + dialogBox.width > targetBox.x &&
        dialogBox.y < targetBox.y + targetBox.height &&
        dialogBox.y + dialogBox.height > targetBox.y
      )
      expect(overlaps).toBe(false)

      if (index < tourSteps.length - 1) {
        await page.getByRole('button', { name: 'Next', exact: true }).click()
      }
    }

    await page.getByRole('button', { name: 'Finish', exact: true }).click()
    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(dialog).toBeHidden()
  })
})
