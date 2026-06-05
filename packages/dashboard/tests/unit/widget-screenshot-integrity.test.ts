import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('widget html2canvas SRI uses a complete SHA-384 integrity value', async () => {
  const widgetUrl = new URL('../../../widget/src/widget.ts', import.meta.url)
  const source = await readFile(widgetUrl, 'utf8')
  const match = source.match(/s\.integrity = '(sha384-[A-Za-z0-9+/]+={0,2})'/)

  assert.ok(match, 'html2canvas integrity assignment should be present')
  const value = match[1]
  assert.equal(value, 'sha384-ZZ1pncU3bQe8y31yfZdMFdSpttDoPmOZg2wguVK9almUodir1PghgT0eY7Mrty8H')
  assert.equal(value.length, 'sha384-'.length + 64)
})
