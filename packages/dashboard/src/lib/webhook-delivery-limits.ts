import type { EntitlementSet } from '@feedbacks/shared'

export const DEFAULT_WEBHOOK_DELIVERY_LOG_LIMIT = 30
export const PRO_WEBHOOK_DELIVERY_LOG_LIMIT = 100

export function getWebhookDeliveryLogQueryLimit(
  entitlements: Pick<EntitlementSet, 'webhookDeliveryLogLimit'> | null | undefined,
) {
  if (!entitlements) return DEFAULT_WEBHOOK_DELIVERY_LOG_LIMIT
  return entitlements.webhookDeliveryLogLimit === null
    ? PRO_WEBHOOK_DELIVERY_LOG_LIMIT
    : entitlements.webhookDeliveryLogLimit
}
