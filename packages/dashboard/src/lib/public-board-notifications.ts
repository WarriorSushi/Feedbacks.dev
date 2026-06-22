import { escapeEmailHtml } from './notification-html.ts'

export interface PublicBoardNotificationBoard {
  id: string
  slug: string
  title?: string | null
  display_name?: string | null
}

export interface PublicBoardNotificationFeedback {
  id: string
  message: string
  status?: string | null
}

export function getPublicBoardDisplayName(board: PublicBoardNotificationBoard) {
  return board.display_name || board.title || 'Public board'
}

export function getPublicBoardUrl(appOrigin: string, slug: string, feedbackId?: string) {
  const url = new URL(`/p/${slug}`, appOrigin)
  if (feedbackId) url.hash = feedbackId
  return url.toString()
}

export function mergePublicBoardSubscriberIds(input: {
  followUserIds: string[]
  watchUserIds: string[]
  excludeUserId?: string | null
}) {
  return Array.from(new Set([...input.followUserIds, ...input.watchUserIds]))
    .filter((userId) => userId && userId !== input.excludeUserId)
}

export function buildPublicBoardStatusEmail(input: {
  appOrigin: string
  board: PublicBoardNotificationBoard
  feedback: PublicBoardNotificationFeedback
  oldStatus?: string | null
  newStatus: string
}) {
  const boardName = getPublicBoardDisplayName(input.board)
  const publicUrl = getPublicBoardUrl(input.appOrigin, input.board.slug, input.feedback.id)
  const subject = `[feedbacks.dev] ${boardName}: request moved to ${input.newStatus.replace('_', ' ')}`
  const text = [
    `${boardName} updated a public request.`,
    `Status: ${input.oldStatus || 'previous'} -> ${input.newStatus}`,
    `Request: ${input.feedback.message}`,
    `Open: ${publicUrl}`,
  ].join('\n')
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>${escapeEmailHtml(boardName)} updated a public request</h2>
      <p><strong>Status:</strong> ${escapeEmailHtml(input.oldStatus || 'previous')} &rarr; ${escapeEmailHtml(input.newStatus)}</p>
      <p><strong>Request:</strong><br/>${escapeEmailHtml(input.feedback.message)}</p>
      <p><a href="${escapeEmailHtml(publicUrl)}">Open the public board</a></p>
    </div>
  `

  return { subject, text, html }
}

export function buildPublicBoardReplyEmail(input: {
  appOrigin: string
  board: PublicBoardNotificationBoard
  feedback: PublicBoardNotificationFeedback
  replyContent: string
}) {
  const boardName = getPublicBoardDisplayName(input.board)
  const publicUrl = getPublicBoardUrl(input.appOrigin, input.board.slug, input.feedback.id)
  const subject = `[feedbacks.dev] ${boardName}: team reply on a watched request`
  const text = [
    `${boardName} posted a team reply.`,
    `Request: ${input.feedback.message}`,
    `Reply: ${input.replyContent}`,
    `Open: ${publicUrl}`,
  ].join('\n')
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>${escapeEmailHtml(boardName)} posted a team reply</h2>
      <p><strong>Request:</strong><br/>${escapeEmailHtml(input.feedback.message)}</p>
      <p><strong>Reply:</strong><br/>${escapeEmailHtml(input.replyContent)}</p>
      <p><a href="${escapeEmailHtml(publicUrl)}">Open the public board</a></p>
    </div>
  `

  return { subject, text, html }
}
