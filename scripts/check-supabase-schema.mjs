#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(path.join(process.cwd(), 'packages', 'dashboard', 'package.json'))
const { createClient } = require('@supabase/supabase-js')

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return
  const body = fs.readFileSync(filePath, 'utf8')
  for (const line of body.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const match = trimmed.match(/^([^=]+)=(.*)$/)
    if (!match) continue
    const key = match[1].trim()
    let value = match[2].trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnvFile(path.join(process.cwd(), '.env.local'))
loadEnvFile(path.join(process.cwd(), 'packages', 'dashboard', '.env.local'))

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false },
})

const requiredColumns = {
  feedback: [
    'id',
    'project_id',
    'message',
    'priority',
    'status',
    'is_public',
    'vote_count',
    'read_at',
    'agent_name',
    'structured_data',
  ],
  public_board_settings: [
    'id',
    'project_id',
    'enabled',
    'slug',
    'visibility',
    'directory_opt_in',
    'categories',
    'display_name',
    'empty_state_title',
    'empty_state_description',
  ],
  board_follows: ['id', 'board_id', 'project_id', 'user_id', 'created_at'],
  feedback_watches: ['id', 'board_id', 'project_id', 'feedback_id', 'user_id', 'created_at'],
  billing_accounts: ['user_id', 'plan_tier', 'billing_status', 'dodo_customer_id', 'updated_at'],
  notification_digests: ['user_id', 'digest_type', 'digest_date', 'sent_at', 'item_count'],
  cron_runs: ['id', 'job_name', 'status', 'started_at', 'finished_at', 'processed_count', 'sent_count'],
  webhook_digest_items: ['id', 'project_id', 'kind', 'endpoint_url', 'payload', 'digest_date', 'status', 'next_attempt_at'],
  webhook_jobs: ['id', 'project_id', 'kind', 'endpoint_url', 'payload', 'status', 'next_attempt_at'],
  webhook_deliveries: ['id', 'project_id', 'event', 'kind', 'url', 'status', 'payload', 'created_at'],
}

const requiredBuckets = ['feedback_screenshots', 'feedback_attachments']

function fail(message, failures) {
  failures.push(message)
  console.error(`✗ ${message}`)
}

function pass(message) {
  console.log(`✓ ${message}`)
}

async function main() {
  const failures = []

  for (const [table, expectedColumns] of Object.entries(requiredColumns)) {
    const { error } = await supabase
      .from(table)
      .select(expectedColumns.join(','), { count: 'exact', head: true })

    if (error) {
      fail(`${table} column check failed: ${error.message}`, failures)
    } else {
      pass(`${table} columns present`)
    }
  }

  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
  if (bucketError) {
    fail(`Could not inspect storage buckets: ${bucketError.message}`, failures)
  } else {
    const bucketIds = new Set((buckets || []).map((bucket) => bucket.id))
    const missing = requiredBuckets.filter((bucket) => !bucketIds.has(bucket))
    if (missing.length > 0) {
      fail(`Missing storage buckets: ${missing.join(', ')}`, failures)
    } else {
      pass('storage buckets present')
    }
  }

  if (failures.length > 0) {
    console.error(`\nSupabase schema check failed with ${failures.length} issue(s).`)
    process.exit(1)
  }

  console.log('\nSupabase schema check passed.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
