'use client'

import * as React from 'react'
import Link from 'next/link'
import type { BoardAnnouncement } from '@/lib/public-board'
import {
  type BoardInfo,
  type FeedbackItem,
  type AdminComment,
  type BoardRecommendation,
  type ReportTarget,
  type SortMode,
  type FilterType,
  readSetStorage,
  writeSetStorage,
} from '@/components/boards/board-types'
import { BoardHero } from '@/components/boards/BoardHero'
import { BoardFilters } from '@/components/boards/BoardFilters'
import { BoardFeedbackList } from '@/components/boards/BoardFeedbackList'
import { BoardFeedbackCard } from '@/components/boards/BoardFeedbackCard'
import { BoardSubmitForm } from '@/components/boards/BoardSubmitForm'
import { BoardReportModal } from '@/components/boards/BoardReportModal'
import { BoardAnnouncements } from '@/components/boards/BoardAnnouncements'
import { BoardFooter } from '@/components/boards/BoardFooter'
import { publicEnv } from '@/lib/public-env'

export function PublicBoard({
  board,
  initialFeedback,
  initialComments = [],
  initialAnnouncements = [],
  canModerate = false,
  viewerSignedIn = false,
  initialWatchedIds = [],
  recommendations = [],
}: {
  board: BoardInfo
  initialFeedback: FeedbackItem[]
  initialComments?: AdminComment[]
  initialAnnouncements?: BoardAnnouncement[]
  canModerate?: boolean
  viewerSignedIn?: boolean
  initialFollowed?: boolean
  initialWatchedIds?: string[]
  recommendations?: BoardRecommendation[]
}) {
  const [feedback, setFeedback] = React.useState(initialFeedback)
  const [comments, setComments] = React.useState(initialComments)
  const [filter, setFilter] = React.useState<FilterType>('all')
  const [sort, setSort] = React.useState<SortMode>('votes')
  const [search, setSearch] = React.useState('')
  const [votedIds, setVotedIds] = React.useState<Set<string>>(new Set())
  const [watchedIds, setWatchedIds] = React.useState<Set<string>>(new Set(initialWatchedIds))
  const [votingId, setVotingId] = React.useState<string | null>(null)
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [showSubmit, setShowSubmit] = React.useState(false)
  const [reportTarget, setReportTarget] = React.useState<ReportTarget | null>(null)
  const [justSubmitted, setJustSubmitted] = React.useState(false)
  const [replyDrafts, setReplyDrafts] = React.useState<Record<string, string>>({})
  const [busyId, setBusyId] = React.useState<string | null>(null)
  const [ready, setReady] = React.useState(false)
  const [showRecommendations, setShowRecommendations] = React.useState(false)
  const [voteError, setVoteError] = React.useState<string | null>(null)
  const votesKey = `votes:${board.slug}`

  const commentsByFeedback = React.useMemo(() => {
    const map: Record<string, AdminComment[]> = {}
    comments.forEach((comment) => {
      if (!map[comment.feedback_id]) map[comment.feedback_id] = []
      map[comment.feedback_id].push(comment)
    })
    return map
  }, [comments])

  React.useEffect(() => {
    setVotedIds(readSetStorage(votesKey))
  }, [votesKey])

  React.useEffect(() => {
    setReady(true)
  }, [])

  const totalVotes = React.useMemo(
    () => feedback.reduce((sum, item) => sum + item.vote_count, 0),
    [feedback],
  )

  const redirectToAuth = () => {
    const redirect = encodeURIComponent(`/p/${board.slug}`)
    window.location.href = `${publicEnv.NEXT_PUBLIC_APP_ORIGIN}/auth?redirect=${redirect}`
  }

  const toggleWatched = async (feedbackId: string) => {
    const next = new Set(watchedIds)
    const watching = !next.has(feedbackId)
    const response = await fetch(`/api/boards/${board.slug}/watch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback_id: feedbackId, watching }),
    })

    if (response.status === 401) {
      redirectToAuth()
      return
    }

    if (!response.ok) {
      window.alert('Could not update your watch right now.')
      return
    }

    if (watching) next.add(feedbackId)
    else next.delete(feedbackId)
    setWatchedIds(next)
  }

  const handleVote = async (feedbackId: string) => {
    if (votingId) return
    setVotingId(feedbackId)
    setVoteError(null)
    try {
      const response = await fetch(`/api/boards/${board.slug}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback_id: feedbackId }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setVoteError(data.error || 'Your vote could not be saved. Please try again.')
        return
      }
      setFeedback((prev) =>
        prev.map((entry) =>
          entry.id === feedbackId
            ? { ...entry, vote_count: entry.vote_count + (data.voted ? 1 : -1) }
            : entry,
        ),
      )
      const next = new Set(votedIds)
      if (data.voted) next.add(feedbackId)
      else next.delete(feedbackId)
      setVotedIds(next)
      writeSetStorage(votesKey, next)
    } finally {
      setVotingId(null)
    }
  }

  const refreshBoard = async () => {
    const response = await fetch(`/api/boards/${board.slug}`)
    if (!response.ok) return
    const data = await response.json()
    if (data.feedback) setFeedback(data.feedback)
    if (data.comments) setComments(data.comments)
  }

  const handleSubmitted = async () => {
    setShowSubmit(false)
    setJustSubmitted(true)
    setTimeout(() => setJustSubmitted(false), 4000)
    await refreshBoard()
  }

  const handleReplySubmit = async (feedbackId: string) => {
    const draft = replyDrafts[feedbackId]?.trim()
    if (!draft) return
    setBusyId(feedbackId)
    try {
      const response = await fetch(`/api/boards/${board.slug}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback_id: feedbackId, content: draft }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to post reply')
      setComments((prev) => [
        ...prev,
        {
          id: data.comment.id,
          feedback_id: feedbackId,
          content: data.comment.content,
          created_at: data.comment.created_at,
        },
      ])
      setReplyDrafts((prev) => ({ ...prev, [feedbackId]: '' }))
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Failed to post public reply')
    } finally {
      setBusyId(null)
    }
  }

  const handleModeration = async (
    feedbackId: string,
    action: 'status' | 'hide',
    value?: string,
  ) => {
    setBusyId(feedbackId)
    try {
      const response = await fetch(`/api/boards/${board.slug}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback_id: feedbackId, action, value }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to update board item')
      if (action === 'hide')
        setFeedback((prev) => prev.filter((entry) => entry.id !== feedbackId))
      else if (action === 'status' && value)
        setFeedback((prev) =>
          prev.map((entry) =>
            entry.id === feedbackId ? { ...entry, status: value } : entry,
          ),
        )
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Failed to update board item')
    } finally {
      setBusyId(null)
    }
  }

  const filtered = React.useMemo(() => {
    let items = feedback
    if (filter !== 'all') items = items.filter((entry) => entry.type === filter)
    if (search.trim()) {
      const query = search.toLowerCase()
      items = items.filter((entry) => entry.message.toLowerCase().includes(query))
    }
    const next = [...items]
    if (sort === 'votes') next.sort((a, b) => b.vote_count - a.vote_count)
    else if (sort === 'newest')
      next.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
    else {
      const order: Record<string, number> = {
        in_progress: 0,
        planned: 1,
        reviewed: 2,
        new: 3,
        closed: 4,
      }
      next.sort((a, b) => (order[a.status] ?? 5) - (order[b.status] ?? 5))
    }
    return next
  }, [feedback, filter, search, sort])

  const uniqueRecommendations = React.useMemo(() => {
    const seen = new Set<string>([board.slug])
    return recommendations.filter((entry) => {
      const signature = `${entry.title.trim().toLowerCase()}::${entry.description.trim().toLowerCase()}`
      if (seen.has(entry.slug) || seen.has(signature)) return false
      seen.add(entry.slug)
      seen.add(signature)
      return true
    })
  }, [board.slug, recommendations])

  return (
    <div
      data-public-board-ready={ready ? 'true' : 'false'}
      className="min-h-screen bg-[linear-gradient(180deg,_hsl(var(--background))_0%,_hsl(var(--muted))_100%)]"
    >
      {board.customCss ? <style>{board.customCss}</style> : null}
      <BoardHero
        board={board}
        feedbackCount={feedback.length}
        totalVotes={totalVotes}
        canModerate={canModerate}
        projectId={board.projectId}
        onSubmitClick={() => setShowSubmit(true)}
      />

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        {justSubmitted && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Your feedback was submitted. It now enters the same public flow as the rest of the
            board.
          </div>
        )}

        <div className="space-y-6">
          <BoardAnnouncements announcements={initialAnnouncements} />

          <main aria-label="Public feedback requests" className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
            <BoardFilters
              showTypes={board.show_types}
              filter={filter}
              sort={sort}
              search={search}
              onFilterChange={setFilter}
              onSortChange={setSort}
              onSearchChange={setSearch}
            />

            {voteError && (
              <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {voteError}
              </div>
            )}

            {board.allow_submissions && (
              <div className="grid gap-3 border-b border-border/70 py-5 sm:grid-cols-[42px_minmax(0,1fr)_auto] sm:items-center">
                <div className="hidden h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-sm font-bold text-foreground sm:flex">
                  {(board.displayName || board.title || 'F').slice(0, 1).toUpperCase()}
                </div>
                <button
                  type="button"
                  onClick={() => setShowSubmit(true)}
                  className="min-h-11 rounded-xl border border-border bg-background px-4 text-left text-sm text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
                >
                  What should the team improve?
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubmit(true)}
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Post
                </button>
              </div>
            )}

            <BoardFeedbackList
              emptyTitle={board.branding.emptyStateTitle || 'No public requests yet'}
              emptyDescription={
                board.branding.emptyStateDescription ||
                'Be the first person to submit something the team can respond to publicly.'
              }
              searchQuery={search}
              isEmpty={filtered.length === 0}
            >
              {filtered.map((item) => (
                <BoardFeedbackCard
                  key={item.id}
                  item={item}
                  comments={commentsByFeedback[item.id] || []}
                  isExpanded={expandedId === item.id}
                  voted={votedIds.has(item.id)}
                  watched={watchedIds.has(item.id)}
                  voting={votingId === item.id}
                  canModerate={canModerate}
                  canWatchUpdates={viewerSignedIn}
                  replyDraft={replyDrafts[item.id] || ''}
                  busy={busyId === item.id}
                  onVote={() => handleVote(item.id)}
                  onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  onToggleWatch={() => void toggleWatched(item.id)}
                  onOpenReport={() =>
                    setReportTarget({ type: 'feedback', feedbackId: item.id })
                  }
                  onReplyDraftChange={(value) =>
                    setReplyDrafts((prev) => ({ ...prev, [item.id]: value }))
                  }
                  onReplySubmit={() => void handleReplySubmit(item.id)}
                  onStatusChange={(status) =>
                    void handleModeration(item.id, 'status', status)
                  }
                  onHide={() => void handleModeration(item.id, 'hide')}
                />
              ))}
            </BoardFeedbackList>
          </main>

          <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Other boards
                </p>
                <h2 className="mt-2 text-lg font-semibold text-foreground">Explore related feedback loops</h2>
              </div>
              {uniqueRecommendations.length > 3 && (
                <button
                  type="button"
                  onClick={() => setShowRecommendations((value) => !value)}
                  aria-expanded={showRecommendations}
                  className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showRecommendations ? 'Show fewer' : 'View all'}
                </button>
              )}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {(showRecommendations ? uniqueRecommendations : uniqueRecommendations.slice(0, 4)).map(
                (entry) => (
                  <Link
                    key={entry.slug}
                    href={`/p/${entry.slug}`}
                    className="rounded-xl border bg-background p-4 transition-colors hover:border-primary/30"
                  >
                    <span className="block font-semibold text-foreground">
                      {entry.displayName || entry.title}
                    </span>
                    <span className="mt-2 block line-clamp-2 text-sm leading-6 text-foreground/68">
                      {entry.description}
                    </span>
                  </Link>
                ),
              )}
              {uniqueRecommendations.length === 0 && (
                <p className="text-sm leading-6 text-foreground/70">
                  Related public boards will appear here as more teams publish boards.
                </p>
              )}
            </div>
          </section>

          <BoardFooter canModerate={canModerate} projectId={board.projectId} />
        </div>
      </div>

      {showSubmit && (
        <BoardSubmitForm
          slug={board.slug}
          showTypes={board.show_types}
          onClose={() => setShowSubmit(false)}
          onSubmitted={() => void handleSubmitted()}
        />
      )}
      {reportTarget && (
        <BoardReportModal
          slug={board.slug}
          target={reportTarget}
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>
  )
}
