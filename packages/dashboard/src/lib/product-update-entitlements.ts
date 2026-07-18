import { getBillingSummaryForUser } from '@/lib/billing'

export async function getProductUpdateEntitlements(userId: string, email?: string | null) {
  const summary = await getBillingSummaryForUser(userId, email)
  return summary.entitlements
}

export function getProductUpdateMetricsCutoff(days: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - (days - 1))
  date.setUTCHours(0, 0, 0, 0)
  return date.toISOString()
}
