import { createAdminSupabase } from '@/lib/supabase-server'
import { parseDashboardStats, type DashboardStats } from '@/lib/dashboard-stats-contract'

export async function loadDashboardStats({
  userId,
  projectId,
  historyCutoff,
  trendStart,
}: {
  userId: string
  projectId?: string
  historyCutoff?: string | null
  trendStart: string
}): Promise<DashboardStats | null> {
  const admin = await createAdminSupabase()
  const { data, error } = await admin.rpc('dashboard_stats', {
    p_user_id: userId,
    p_project_id: projectId || null,
    p_history_cutoff: historyCutoff || null,
    p_trend_start: trendStart,
  })
  if (error) return null
  return parseDashboardStats(data)
}
