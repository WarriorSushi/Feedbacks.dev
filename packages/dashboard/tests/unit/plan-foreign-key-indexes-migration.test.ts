import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const migration = new URL('../../../../sql/032_plan_foreign_key_indexes.sql', import.meta.url)

test('plan tables cover foreign keys used by parent updates and deletes', async () => {
  const sql = await readFile(migration, 'utf8')

  assert.match(
    sql,
    /on public\.product_update_metrics\s*\(project_id, update_id\)/i,
  )
  assert.match(
    sql,
    /on public\.product_updates\s*\(created_by\)\s*where created_by is not null/i,
  )
  assert.match(
    sql,
    /on public\.webhook_digest_items\s*\(last_delivery_id\)\s*where last_delivery_id is not null/i,
  )
})
