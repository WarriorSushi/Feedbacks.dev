const DAY_MS = 24 * 60 * 60 * 1000

export const OPERATIONAL_RETENTION_DAYS = {
  succeededWebhookJobs: 30,
  cronRuns: 90,
} as const

export function operationalRetentionCutoffs(now = Date.now()) {
  return {
    succeededWebhookJobsBefore: new Date(
      now - OPERATIONAL_RETENTION_DAYS.succeededWebhookJobs * DAY_MS,
    ).toISOString(),
    cronRunsBefore: new Date(now - OPERATIONAL_RETENTION_DAYS.cronRuns * DAY_MS).toISOString(),
  }
}

