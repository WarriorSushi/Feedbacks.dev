import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8')

test('landing page explains both sides of the feedback loop and keeps the install-once architecture', () => {
  const source = read('../../src/app/page.tsx')
  const demo = read('../../src/components/landing-product-loop.tsx')
  const story = read('../../src/components/landing-feedback-story.tsx')
  const install = read('../../src/components/landing-install-story.tsx')
  const connections = read('../../src/components/landing-connections-story.tsx')

  assert.match(source, /Put a small feedback form in your app/)
  assert.match(source, /show users the fixes you ship/i)
  assert.match(source, /Make the form yours\./)
  assert.match(source, /Paste one code block\./)
  assert.match(demo, /Send feedback/)
  assert.match(demo, /See what changed/)
  assert.match(demo, /setPaused\(true\)/)
  assert.match(demo, /AUTO_ADVANCE_MS = 8000/)
  assert.match(demo, /Orbit/)
  assert.match(demo, /Ledgerly/)
  assert.match(demo, /Parcel/)
  assert.match(demo, /OrbitCanvas/)
  assert.match(demo, /LedgerlyCanvas/)
  assert.match(demo, /ParcelCanvas/)
  assert.match(demo, /setTimeout/)
  assert.doesNotMatch(demo, /onMouseEnter|hovered/)
  assert.match(story, /A user tells you/)
  assert.match(story, /Your team fixes it/)
  assert.match(story, /Users see the fix/)
  assert.match(story, /setPaused\(true\)/)
  assert.match(story, /AUTO_ADVANCE_MS = 8000/)
  assert.match(install, /Make the form fit your app\./)
  assert.match(install, /Copy and paste one time\./)
  assert.match(install, /Test feedback received/)
  assert.match(install, /setPaused\(true\)/)
  assert.match(install, /AUTO_ADVANCE_MS = 8000/)
  assert.match(connections, /Slack/)
  assert.match(connections, /GitHub/)
  assert.match(connections, /Discord/)
  assert.match(connections, /API or MCP/)
  assert.match(connections, /public ideas page/i)
  assert.match(source, /Unlimited projects/)
  assert.match(source, /generateInstallSnippets/)
  assert.doesNotMatch(source, /createServerSupabase/)
  assert.doesNotMatch(source, /userbase|Collecting user feedbacks/)
})

test('first-run and public feedback screens keep optional work out of the main path', () => {
  const newProject = read('../../src/app/(dashboard)/projects/new/page.tsx')
  const inbox = read('../../src/app/(dashboard)/feedback/page.tsx')
  const publicForm = read('../../src/components/boards/BoardSubmitForm.tsx')

  assert.match(newProject, /Name your app or website/)
  assert.match(newProject, /Start with something else/)
  assert.doesNotMatch(newProject, /What happens next/)
  assert.match(inbox, /Read new messages\. Decide what to do next\./)
  assert.match(inbox, /showMoreFilters/)
  assert.match(publicForm, /What do you need\?/)
  assert.match(publicForm, /className="sr-only"/)
})

test('navigation gives product updates user context instead of an ambiguous release-notes label', () => {
  const sidebar = read('../../src/components/sidebar.tsx')
  const projectHome = read('../../src/app/(dashboard)/projects/[id]/project-home.tsx')

  assert.match(sidebar, /Updates for users/)
  assert.match(projectHome, /Show product updates to users/)
  assert.doesNotMatch(sidebar, /label: 'Release notes'/)
})

test('sidebar exposes a stable Home destination and groups project work by user intent', () => {
  const sidebar = read('../../src/components/sidebar.tsx')

  assert.match(sidebar, /label: 'Home'/)
  assert.match(sidebar, /label: 'Collect'/)
  assert.match(sidebar, /label: 'Share with users'/)
  assert.match(sidebar, /label: 'Connect'/)
  assert.match(sidebar, /Public feedback board/)
  assert.match(sidebar, /label: 'Feedback form', icon: ClipboardPenLine/)
  assert.match(sidebar, /label: 'Feedback inbox', icon: Inbox/)
  assert.doesNotMatch(sidebar, /label: 'Overview'/)
  assert.doesNotMatch(sidebar, /projectTab: 'home'/)
})

test('sign-in explains account creation and the shared embed before setup', () => {
  const source = read('../../src/app/auth/page.tsx')

  assert.match(source, /Sign in or create an account/)
  assert.match(source, /GitHub or a magic link creates your account/)
  assert.match(source, /One embed for both/)
  assert.doesNotMatch(source, /data-api-url/)
})

test('theme tokens use perceptual OKLCH colors in both themes', () => {
  const css = read('../../src/app/globals.css')
  const tailwind = read('../../tailwind.config.cjs')

  assert.match(css, /--background: 0\.985/)
  assert.match(css, /\.dark[\s\S]*--background: 0\.155/)
  assert.match(css, /--surface-sidebar:/)
  assert.match(css, /--surface-selected:/)
  assert.match(tailwind, /surface:\s*\{/)
  assert.match(tailwind, /oklch\(var\(--primary\)/)
  assert.doesNotMatch(tailwind, /hsl\(var\(--primary\)/)
})

test('public docs use the stable canonical embed and remote customization language', () => {
  const source = read('../../src/lib/docs-content.ts')

  assert.match(source, /data-feedbacks-host/)
  assert.match(source, /data-project=/)
  assert.match(source, /Customize remotely/)
  assert.match(source, /installed snippet stays stable/)
  assert.doesNotMatch(source, /data-api-url/)
  assert.doesNotMatch(source, /data-config-version/)
})
