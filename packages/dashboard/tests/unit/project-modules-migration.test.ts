import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const migration = new URL('../../../../sql/031_atomic_project_modules.sql', import.meta.url)

test('module choices are persisted atomically by a service-only RPC', async () => {
  const sql = await readFile(migration, 'utf8')

  assert.match(sql, /create or replace function public\.set_project_modules/i)
  assert.match(sql, /security invoker/i)
  assert.match(sql, /set search_path = pg_catalog/i)
  assert.match(sql, /update public\.projects[\s\S]+feedbackEnabled/i)
  assert.match(sql, /insert into public\.product_update_settings[\s\S]+on conflict \(project_id\) do update/i)
  assert.match(sql, /revoke all on function public\.set_project_modules[\s\S]+from public, anon, authenticated/i)
  assert.match(sql, /grant execute on function public\.set_project_modules[\s\S]+to service_role/i)
})
