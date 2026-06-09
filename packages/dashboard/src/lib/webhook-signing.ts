import { createHmac } from 'node:crypto'

export function buildGenericWebhookSignatureHeaders(
  rawBody: string,
  signingSecret?: string,
  timestamp = Math.floor(Date.now() / 1000).toString(),
): Record<string, string> {
  const secret = signingSecret?.trim()
  if (!secret) return {}

  const signature = createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex')

  return {
    'X-Feedbacks-Timestamp': timestamp,
    'X-Feedbacks-Signature': `v1=${signature}`,
  }
}
