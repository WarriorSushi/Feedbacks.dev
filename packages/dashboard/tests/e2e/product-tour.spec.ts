import { expect, test, skipE2EIfNeeded } from './fixtures'
import { signInWithTestSession } from './helpers/auth'
import { createProjectViaApi } from './helpers/project'

const env = skipE2EIfNeeded()
test.skip(!env.ready, env.skipReason)

const TOUR_STEP_TIMEOUT_MS = 60_000

const tourSteps = [
  { title: 'Start from Home', path: /\/dashboard(?:\?.*)?$/, target: 'nav-dashboard' },
  { title: 'Shape the Feedback form', path: /\/projects\/[^/]+\/feedback-form$/, target: 'nav-feedback-form' },
  { title: 'Triage the Feedback inbox', path: /\/feedback(?:\?.*)?$/, target: 'nav-feedback' },
  { title: 'Show updates to users', path: /\/projects\/[^/]+\/release-notes$/, target: 'nav-updates' },
  { title: 'Install and verify once', path: /\/projects\/[^/]+\/install$/, target: 'nav-install' },
  { title: 'Connect the rest when needed', path: /\/projects\/[^/]+\/integrations$/, target: 'nav-integrations' },
]

test.describe('product tour', () => {
  test('walks every navigation step and finishes on the dashboard', async ({ page }) => {
    test.setTimeout(300_000)
    await signInWithTestSession(page)
    await createProjectViaApi(page, { name: `Playwright Tour Desktop ${Date.now().toString(36)}` })
    await page.goto('/dashboard?tour=1')

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    for (const [index, step] of tourSteps.entries()) {
      await expect(dialog.getByRole('heading', { name: step.title, exact: true })).toBeVisible({
        timeout: TOUR_STEP_TIMEOUT_MS,
      })
      await expect(page).toHaveURL(step.path, { timeout: TOUR_STEP_TIMEOUT_MS })

      const visibleTarget = page.locator(`[data-tour="${step.target}"]:visible`)
      await expect(visibleTarget).toBeVisible({ timeout: TOUR_STEP_TIMEOUT_MS })
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
    test.setTimeout(300_000)
    await signInWithTestSession(page)
    await createProjectViaApi(page, { name: `Playwright Tour Mobile ${Date.now().toString(36)}` })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/dashboard?tour=1')

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    for (const [index, step] of tourSteps.entries()) {
      await expect(dialog.getByRole('heading', { name: step.title, exact: true })).toBeVisible({
        timeout: TOUR_STEP_TIMEOUT_MS,
      })
      await expect(page).toHaveURL(step.path, { timeout: TOUR_STEP_TIMEOUT_MS })

      const target = page.locator(`[data-tour="${step.target}"]:visible`)
      await expect(target).toBeVisible({ timeout: TOUR_STEP_TIMEOUT_MS })
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
