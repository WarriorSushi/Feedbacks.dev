'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, Bell, BellOff, ExternalLink, Loader2, MessageSquarePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { BoardInfo } from './board-types'

interface BoardHeroProps {
  board: BoardInfo
  feedbackCount: number
  totalVotes: number
  canModerate: boolean
  followed: boolean
  followLoading: boolean
  projectId: string
  onSubmitClick: () => void
  onToggleFollow: () => void
}

function getWebsiteHost(url: string | undefined) {
  if (!url) return null
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

export function BoardHero({
  board,
  feedbackCount,
  totalVotes,
  canModerate,
  followed,
  followLoading,
  projectId,
  onSubmitClick,
  onToggleFollow,
}: BoardHeroProps) {
  const displayTitle =
    board.displayName || board.branding.heroTitle || board.title || 'Public feedback board'
  const heroDescription =
    board.branding.heroDescription ||
    board.description ||
    'Vote on requests, add context, and track the public layer of a feedback workflow that starts inside the product.'
  const categories = board.branding.categories?.slice(0, 4) || []
  const websiteHost = getWebsiteHost(board.branding.websiteUrl)
  const submissionLabel = board.allow_submissions ? 'Open submissions' : 'Read only'
  const accent = board.branding.accentColor || '#4d7c0f'

  return (
    <section
      className="relative overflow-hidden border-b border-border/80 bg-background"
      style={{
        borderColor: `${accent}26`,
      }}
    >
      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <Link
            href="/boards"
            prefetch={false}
            className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All boards
          </Link>
          <span className="text-muted-foreground/35">/</span>
          <span className="font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {board.branding.heroEyebrow || 'Public board'}
          </span>
          {canModerate && (
            <Link
              href={`/projects/${projectId}?tab=board`}
              className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-foreground sm:ml-auto"
            >
              Manage
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
          <div className="min-w-0">
            <div
              className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl border bg-card text-2xl"
              style={{ borderColor: `${accent}40` }}
              aria-hidden="true"
            >
              {board.branding.logoEmoji || displayTitle.slice(0, 1).toUpperCase()}
            </div>
            <h1 className="max-w-4xl text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
              {displayTitle}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-foreground/72 sm:text-lg">
              {heroDescription}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span>
                <strong className="font-semibold text-foreground">{feedbackCount}</strong> requests
              </span>
              <span>
                <strong className="font-semibold text-foreground">{totalVotes}</strong> votes
              </span>
              <span className="font-medium text-foreground/75">
                {submissionLabel}
              </span>
              {board.branding.tagline && (
                <span>
                  {board.branding.tagline}
                </span>
              )}
            </div>

            {(categories.length > 0 || websiteHost) && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {categories.map((category) => (
                  <span
                    key={category}
                    className="inline-flex rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {category}
                  </span>
                ))}
                {board.branding.websiteUrl && websiteHost && (
                  <a
                    href={board.branding.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {websiteHost}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm font-semibold text-foreground">Have something to add?</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Vote first, then add a fresh request when the board does not already cover it.
            </p>
            <Button
              type="button"
              variant={followed ? 'outline' : 'secondary'}
              onClick={onToggleFollow}
              disabled={followLoading}
              className="mt-4 w-full gap-2 font-semibold"
            >
              {followLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : followed ? (
                <BellOff className="h-4 w-4" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
              {followed ? 'Following board' : 'Follow board'}
            </Button>
            {board.allow_submissions && (
              <Button onClick={onSubmitClick} className="mt-2 w-full gap-2 font-semibold">
                Share feedback
                <MessageSquarePlus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
