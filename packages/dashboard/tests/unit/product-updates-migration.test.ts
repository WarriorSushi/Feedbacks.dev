import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const migration = new URL('../../../../sql/028_product_updates.sql', import.meta.url)

test('product update migration preserves RLS, service-only RPCs, and atomic publish limits', async () => {
  const sql = await readFile(migration, 'utf8')

  for (const table of ['product_update_settings', 'product_updates', 'product_update_metrics']) {
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`, 'i'))
  }
  assert.match(sql, /security invoker set search_path = pg_catalog/gi)
  assert.match(sql, /pg_advisory_xact_lock/)
  assert.match(sql, /revoke all on function public\.increment_product_update_metric[\s\S]+from public, anon, authenticated/i)
  assert.match(sql, /grant execute on function public\.publish_product_update[\s\S]+to service_role/i)
  assert.match(sql, /product_update_images/)
  assert.match(sql, /target\.published_at <= now\(\)/)
})
