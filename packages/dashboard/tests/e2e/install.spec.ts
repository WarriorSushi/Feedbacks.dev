import { expect, test, skipE2EIfNeeded } from './fixtures'
import { signInWithTestSession } from './helpers/auth'
import { createProjectViaApi, projectInstallPath } from './helpers/project'

const env = skipE2EIfNeeded()
test.skip(!env.ready, env.skipReason)

test('creates a project and lands on customization before install', async ({ page }) => {
  await signInWithTestSession(page)

  await page.goto('/projects/new')
  await page.getByLabel('Project Name *').fill(`Playwright Install ${Date.now().toString(36)}`)
  await page.getByRole('button', { name: 'Create Project' }).click()

  await expect(page).toHaveURL(/\/projects\/[^/]+\?created=1&tab=customize/, { timeout: 30_000 })
  await expect(page.getByRole('button', { name: 'Customize', exact: true })).toBeVisible()
  await expect(page.getByText('Save the widget look and placement.')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Make the feedback form fit your product' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Live form preview' })).toBeVisible()
  await expect(page.getByRole('button', { name: /Floating button Adds a feedback button/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Custom trigger Connects feedback/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Inline form Embeds the full/ })).toBeVisible()

  await page.getByRole('button', { name: 'Install', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Install the saved widget, then verify once.' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Copy Website snippet' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Open verification page' })).toBeVisible()
  await expect(page.getByText('Choose platform')).toBeVisible()
  await expect(page.getByText('Copy code')).toBeVisible()
  await expect(page.getByText('Verify one message')).toBeVisible()
  await expect(page.getByRole('button', { name: 'WordPress' })).toBeVisible()
  await page.getByRole('button', { name: 'HTML block' }).click()
  await expect(page.getByText(/Prefer global custom code/i)).toBeVisible()
})

test('copy-paste install guidance stays visible for an existing project', async ({ page }) => {
  await signInWithTestSession(page)
  const project = await createProjectViaApi(page, { name: `Playwright Install API ${Date.now().toString(36)}` })

  await page.goto(projectInstallPath(project.id), { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', { name: 'Install the saved widget, then verify once.' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Install code' })).toBeVisible()
  await expect(
    page.getByText(/Paste before the closing body tag/i),
  ).toBeVisible({ timeout: 30_000 })
  await expect(
    page.getByText(/Look for the floating "Feedback" launcher near the lower-right corner/i).first(),
  ).toBeVisible({ timeout: 30_000 })
  await expect(page.getByRole('link', { name: 'Open verification page' })).toBeVisible()
  await page.getByRole('button', { name: 'Mobile app' }).click()
  await expect(page.getByText(/browser script does not run inside native/i)).toBeVisible()
  await expect(page.getByRole('link', { name: 'Open API docs' })).toBeVisible()
})
