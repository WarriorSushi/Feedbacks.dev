import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8')

test('landing page explains both sides of the feedback loop and keeps the install-once architecture', () => {
  const source = read('../../src/app/page.tsx')
  const demo = read('../../src/components/landing-product-loop.tsx')

  assert.match(source, /Collect feedback from users/)
  assert.match(source, /Show product updates to users/)
  assert.match(source, /One embed\. No configuration-code treadmill/)
  assert.match(demo, /Send feedback/)
  assert.match(demo, /What&apos;s new/)
  assert.match(source, /Unlimited projects/)
  assert.match(source, /generateInstallSnippets/)
  assert.doesNotMatch(source, /createServerSupabase/)
  assert.doesNotMatch(source, /userbase|Collecting user feedbacks/)
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
