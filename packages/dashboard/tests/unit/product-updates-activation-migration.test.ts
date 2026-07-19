import assert from 'node:assert/strict'
import test from 'node:test'

test('Product Updates activation migration records only aggregate owner milestones', async () => {
  const sql = await import('node:fs/promises').then(({ readFile }) => readFile(new URL('../../../../sql/030_product_update_activation_events.sql', import.meta.url), 'utf8'))
  const statements = sql.replace(/--.*$/gm, '')
  for (const event of ['updates_nav_opened', 'updates_setup_started', 'updates_embed_verified', 'updates_activated', 'updates_first_draft_created', 'updates_first_published', 'updates_first_impression_received']) {
    assert.match(sql, new RegExp(`'${event}'`))
  }
  assert.doesNotMatch(statements, /\b(visitor|url|user_agent)\b/i)
})
