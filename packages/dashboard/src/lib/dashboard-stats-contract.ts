export interface DashboardStats {
  total: number
  unread: number
  averageRating: number | null
  ratingCount: number
  agentCount: number
  typeCounts: Record<string, number>
  dailyCounts: Record<string, number>
}

function numberRecord(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.fromEntries(
    Object.entries(value).flatMap(([key, item]) =>
      typeof item === 'number' && Number.isFinite(item) ? [[key, item]] : [],
    ),
  )
}

export function parseDashboardStats(value: unknown): DashboardStats | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const row = value as Record<string, unknown>
  if (typeof row.total !== 'number' || typeof row.unread !== 'number') return null

  return {
    total: row.total,
    unread: row.unread,
    averageRating: typeof row.average_rating === 'number' ? row.average_rating : null,
    ratingCount: typeof row.rating_count === 'number' ? row.rating_count : 0,
    agentCount: typeof row.agent_count === 'number' ? row.agent_count : 0,
    typeCounts: numberRecord(row.type_counts),
    dailyCounts: numberRecord(row.daily_counts),
  }
}

