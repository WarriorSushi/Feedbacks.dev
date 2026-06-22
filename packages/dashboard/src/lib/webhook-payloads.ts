import type { Feedback, Project } from './types'

export interface WebhookPayload {
  version: '2026-06-22'
  event: 'feedback.new' | 'feedback.test'
  feedback: Partial<Feedback>
  project: Pick<Project, 'id' | 'name'>
  timestamp: string
}

export interface WebhookDigestPayload {
  version: '2026-06-22'
  event: 'feedback.digest'
  feedbacks: Array<Partial<Feedback>>
  project: Pick<Project, 'id' | 'name'>
  timestamp: string
  window: {
    start: string
    end: string
  }
  count: number
}

export type WebhookDeliveryPayload = WebhookPayload | WebhookDigestPayload

export function isDigestPayload(payload: WebhookDeliveryPayload): payload is WebhookDigestPayload {
  return payload.event === 'feedback.digest'
}

export function buildPayload(
  feedback: Partial<Feedback>,
  project: Pick<Project, 'id' | 'name'>,
  event: WebhookPayload['event'] = 'feedback.new',
): WebhookPayload {
  return {
    version: '2026-06-22',
    event,
    feedback,
    project,
    timestamp: new Date().toISOString(),
  }
}

export function buildDigestPayload(
  feedbacks: Array<Partial<Feedback>>,
  project: Pick<Project, 'id' | 'name'>,
  windowStart: string,
  windowEnd: string,
): WebhookDigestPayload {
  return {
    version: '2026-06-22',
    event: 'feedback.digest',
    feedbacks,
    project,
    timestamp: new Date().toISOString(),
    window: {
      start: windowStart,
      end: windowEnd,
    },
    count: feedbacks.length,
  }
}
