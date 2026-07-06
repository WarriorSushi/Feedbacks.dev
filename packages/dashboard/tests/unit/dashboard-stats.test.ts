import assert from 'node:assert/strict'
import test from 'node:test'

async function loadStatsParser() {
  return import(new URL('../../src/lib/dashboard-stats-contract.ts', import.meta.url).href)
}

test('dashboard stats parser accepts the bounded aggregate contract', async () => {
  const { parseDashboardStats } = await loadStatsParser()
  assert.deepEqual(parseDashboardStats({
    total: 12,
    unread: 3,
    average_rating: 4.5,
    rating_count: 4,
    agent_count: 2,
    type_counts: { bug: 5, idea: 7 },
    daily_counts: { '2026-07-06': 3 },
  }), {
    total: 12,
    unread: 3,
    averageRating: 4.5,
    ratingCount: 4,
    agentCount: 2,
    typeCounts: { bug: 5, idea: 7 },
    dailyCounts: { '2026-07-06': 3 },
  })
})

test('dashboard stats parser rejects malformed aggregates', async () => {
  const { parseDashboardStats } = await loadStatsParser()
  assert.equal(parseDashboardStats(null), null)
  assert.equal(parseDashboardStats({ total: '12', unread: 3 }), null)
})
