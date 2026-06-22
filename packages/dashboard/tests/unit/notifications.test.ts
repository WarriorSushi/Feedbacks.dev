import test from 'node:test'
import assert from 'node:assert/strict'

async function loadNotifications() {
  return import(new URL('../../src/lib/notification-html.ts', import.meta.url).href)
}

test('email HTML escaping covers common injection characters', async () => {
  const { escapeEmailHtml } = await loadNotifications()

  assert.equal(
    escapeEmailHtml(`<script>alert("xss")</script> & 'quoted'`),
    '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; &amp; &#39;quoted&#39;',
  )
})

test('email HTML escaping handles nullish values', async () => {
  const { escapeEmailHtml } = await loadNotifications()

  assert.equal(escapeEmailHtml(null), '')
  assert.equal(escapeEmailHtml(undefined), '')
})
