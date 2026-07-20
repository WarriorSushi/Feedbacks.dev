import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8')

test('nonce CSP uses request-aware rendering so Next can hydrate every route', () => {
  const middleware = read('../../src/middleware.ts')
  const layout = read('../../src/app/layout.tsx')

  assert.match(middleware, /'nonce-\$\{nonce\}' 'strict-dynamic'/)
  assert.match(middleware, /requestHeaders\.set\('Content-Security-Policy'/)
  assert.match(layout, /import \{ headers \} from 'next\/headers'/)
  assert.match(layout, /export default async function RootLayout/)
  assert.match(layout, /\(await headers\(\)\)\.get\('x-nonce'\)/)
  assert.match(layout, /nonce=\{nonce\}/)
})
