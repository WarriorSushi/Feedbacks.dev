export type FeedbackMetadata = Record<string, unknown>

export function normalizeFeedbackMetadata(metadata: unknown): FeedbackMetadata {
  return metadata == null ? {} : metadata as FeedbackMetadata
}
