import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8')

test('landing page names both products and keeps the install-once architecture', () => {
  const source = read('../../src/app/page.tsx')

  assert.match(source, /Feedback form/)
  assert.match(source, /Release notes/)
  assert.match(source, /Install once, verify it works, then manage everything remotely/)
  assert.match(source, /generateInstallSnippets/)
  assert.doesNotMatch(source, /createServerSupabase/)
  assert.doesNotMatch(source, /userbase|Collecting user feedbacks/)
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
