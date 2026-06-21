export type FeedbackReadStateFilter = 'all' | 'unread'

export function parseFeedbackReadStateFilter(value: string | null | undefined): FeedbackReadStateFilter {
  return value === 'unread' ? 'unread' : 'all'
}

export function isFeedbackUnread(feedback: { read_at?: string | null }): boolean {
  return feedback.read_at == null
}

export function getFeedbackReadAtUpdate(
  feedback: { read_at?: string | null },
  now: Date = new Date(),
): { read_at: string } | null {
  if (!isFeedbackUnread(feedback)) return null
  return { read_at: now.toISOString() }
}
