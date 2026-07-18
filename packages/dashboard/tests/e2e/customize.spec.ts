import { expect, test, skipE2EIfNeeded } from './fixtures'
import { signInWithTestSession } from './helpers/auth'
import { createProjectViaApi, projectCustomizePath, projectInstallPath } from './helpers/project'

const env = skipE2EIfNeeded()
test.skip(!env.ready, env.skipReason)

test('keeps customize drafts local until the user saves them', async ({ page }) => {
  test.setTimeout(180_000)
  await signInWithTestSession(page)
  const project = await createProjectViaApi(page, { name: `Playwright Customize ${Date.now().toString(36)}` })

  await page.goto(projectCustomizePath(project.id), { waitUntil: 'domcontentloaded' })
  await expect(page.locator('[data-project-tabs-ready="true"]')).toBeVisible()

  await expect(
    page.getByText(/Install snippets use this saved version/i),
  ).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Live form preview' })).toBeVisible()
  await expect(page.getByText(/Placement, color, copy, and optional fields update/i)).toBeVisible()
  await expect(page.getByText('app.example.com')).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Custom trigger Connects feedback/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Inline form Embeds the full/ })).toBeVisible()
  await expect(page.getByLabel('Widget embed mode')).toHaveCount(0)
  await page.getByLabel('Button text').fill('Ideas')
  await expect(page.getByLabel('Button text')).toHaveValue('Ideas')
  await expect(
    page.getByText(/Save changes before copying install code/i),
  ).toBeVisible()
  await expect(page.getByText(/Draft changes: Button text/i)).toBeVisible()
  await expect(page.getByText(/Previewing unsaved changes/i)).toBeVisible()
  await expect(page.getByText(/Save before installing/i)).toBeVisible()
  await expect
    .poll(async () => {
      return page.evaluate((storageKey) => window.sessionStorage.getItem(storageKey), `feedbacks-widget-draft:${project.id}`)
    })
    .not.toBeNull()

  await page.goto(projectInstallPath(project.id), { waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('install-verify-instruction')).not.toContainText('Ideas')

  await page.goto(projectCustomizePath(project.id), { waitUntil: 'domcontentloaded' })
  await expect(page.locator('[data-project-tabs-ready="true"]')).toBeVisible()
  await expect(page.getByLabel('Button text')).toHaveValue('Ideas')
  await expect(
    page.getByText(/Save changes before copying install code/i),
  ).toBeVisible()
  await expect(page.getByText(/Previewing unsaved changes/i)).toBeVisible()

  const saveResponse = page.waitForResponse((response) => {
    return response.url().includes(`/api/projects/${project.id}`)
      && response.request().method() === 'PATCH'
      && response.status() === 200
  })
  await page.getByRole('button', { name: 'Save changes' }).first().click()
  await saveResponse
  await expect(
    page.getByText(/Install snippets use this saved version/i),
  ).toBeVisible()

  await page.goto(projectInstallPath(project.id), { waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('install-verify-instruction')).toContainText('Ideas')
})
