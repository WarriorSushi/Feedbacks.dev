'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { getHistoryWindowStart } from '@feedbacks/shared'
import { isFeedbackUnread, parseFeedbackReadStateFilter } from '@/lib/feedback-read-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  cn,
  truncate,
  formatRelativeTime,
  getStatusColor,
  getTypeColor,
  statusConfig as globalStatusConfig,
} from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import type { BillingSummary, Feedback, FeedbackStatus, FeedbackType } from '@/lib/types'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  CheckCircle,
  XCircle,
  Loader2,
  Inbox,
  X,
  Tag,
  Bug,
  Lightbulb,
  Smile,
  CircleHelp,
  MessageSquare,
  Bot,
  ClipboardList,
} from 'lucide-react'
import Link from 'next/link'

const PAGE_SIZE = 20

const statuses: FeedbackStatus[] = ['new', 'reviewed', 'planned', 'in_progress', 'closed']
const types: FeedbackType[] = ['bug', 'idea', 'praise', 'question']

const statusMeta = globalStatusConfig
const typeIcons = {
  bug: Bug,
  idea: Lightbulb,
  praise: Smile,
  question: CircleHelp,
  other: MessageSquare,
}

function TypeIcon({ type, className }: { type?: FeedbackType | string | null; className?: string }) {
  const Icon = typeIcons[(type || 'other') as keyof typeof typeIcons] || MessageSquare
  return <Icon className={cn('h-4 w-4', className)} />
}

interface ProjectFilterOption {
  id: string
  name: string
}

function normalizeTag(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '-')
}

export default function FeedbackInboxPage() {
  return (
    <Suspense>
      <FeedbackInboxInner />
    </Suspense>
  )
}

function FeedbackInboxInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = React.useMemo(() => createClient(), [])

  const [feedbacks, setFeedbacks] = React.useState<Feedback[]>([])
  const [projects, setProjects] = React.useState<ProjectFilterOption[]>([])
  const [billingSummary, setBillingSummary] = React.useState<BillingSummary | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [total, setTotal] = React.useState(0)
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = React.useState(false)

  const page = Number(searchParams.get('page') || '1')
  const status = searchParams.get('status') || ''
  const type = searchParams.get('type') || ''
  const search = searchParams.get('q') || ''
  const agent = searchParams.get('agent') || ''
  const projectId = searchParams.get('projectId') || ''
  const tag = searchParams.get('tag') || ''
  const read = parseFeedbackReadStateFilter(searchParams.get('read'))
  const [searchInput, setSearchInput] = React.useState(search)
  const [tagInput, setTagInput] = React.useState(tag)
  const [bulkTagInput, setBulkTagInput] = React.useState('')

  const totalPages = Math.ceil(total / PAGE_SIZE)

  React.useEffect(() => {
    setSearchInput(search)
    setTagInput(tag)
  }, [search, tag])

  React.useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase
        .from('projects')
        .select('id, name')
        .order('name', { ascending: true })
      setProjects((data as ProjectFilterOption[]) || [])
    }

    fetchProjects()
  }, [supabase])

  React.useEffect(() => {
    const fetchBilling = async () => {
      try {
        const response = await fetch('/api/billing/sync', { cache: 'no-store' })
        if (!response.ok) return
        const data = await response.json()
        setBillingSummary(data)
      } catch {
        // keep inbox usable even if billing lookup fails
      }
    }

    void fetchBilling()
  }, [])

  const fetchFeedback = React.useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('feedback')
      .select('*, projects(id, name)', { count: 'exact' })
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

    if (status) query = query.eq('status', status)
    if (type) query = query.eq('type', type)
    if (search) query = query.ilike('message', `%${search}%`)
    if (agent) query = query.not('agent_name', 'is', null)
    if (projectId) query = query.eq('project_id', projectId)
    if (tag) query = query.contains('tags', [tag])
    if (read === 'unread') query = query.is('read_at', null)
    const historyCutoff = billingSummary ? getHistoryWindowStart(billingSummary.entitlements) : null
    if (historyCutoff) query = query.gte('created_at', historyCutoff)

    const { data, count } = await query
    setFeedbacks((data as Feedback[]) || [])
    setTotal(count || 0)
    setSelected(new Set())
    setLoading(false)
  }, [supabase, page, projectId, status, tag, type, search, agent, read, billingSummary])

  React.useEffect(() => {
    fetchFeedback()
  }, [fetchFeedback])

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v)
      else params.delete(k)
    })
    if (updates.page === undefined) params.set('page', '1')
    router.push(`/feedback?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateParams({ q: searchInput })
  }

  const handleTagSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateParams({ tag: normalizeTag(tagInput) })
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selected.size === feedbacks.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(feedbacks.map((f) => f.id)))
    }
  }

  const bulkUpdateStatus = async (newStatus: FeedbackStatus) => {
    if (selected.size === 0) return
    setBulkLoading(true)
    const { error } = await supabase
      .from('feedback')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .in('id', Array.from(selected))
    setBulkLoading(false)
    if (error) {
      toast({ title: 'Failed to update', description: error.message, variant: 'destructive' })
      return
    }
    toast({ title: `${selected.size} item${selected.size > 1 ? 's' : ''} updated` })
    fetchFeedback()
  }

  const bulkUpdateTags = async (action: 'add' | 'remove') => {
    const nextTag = normalizeTag(bulkTagInput)
    if (!nextTag || selected.size === 0) return

    setBulkLoading(true)
    const selectedFeedback = feedbacks.filter((feedback) => selected.has(feedback.id))
    const results = await Promise.all(
      selectedFeedback.map((feedback) => {
        const currentTags = Array.from(new Set((feedback.tags || []).map(normalizeTag)))
        const nextTags =
          action === 'add'
            ? Array.from(new Set([...currentTags, nextTag])).slice(0, 10)
            : currentTags.filter((tagValue) => tagValue !== nextTag)

        return supabase
          .from('feedback')
          .update({
            tags: nextTags,
            updated_at: new Date().toISOString(),
          })
          .eq('id', feedback.id)
      }),
    )
    setBulkLoading(false)

    const firstError = results.find((result) => result.error)?.error
    if (firstError) {
      toast({ title: 'Failed to update tags', description: firstError.message, variant: 'destructive' })
      return
    }

    toast({
      title: action === 'add' ? 'Tag added to selected items' : 'Tag removed from selected items',
    })
    setBulkTagInput('')
    fetchFeedback()
  }

  const clearBulkSelection = () => setSelected(new Set())

  const hasFilters = status || type || search || agent || projectId || tag || read === 'unread'

  return (
    <div className="animate-fade-in space-y-4 pb-[calc(6rem+env(safe-area-inset-bottom,0px))]">
      {/* ─── Header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {loading ? (
              'Loading…'
            ) : (
              <>
                <span className="font-medium text-foreground">{total}</span>{' '}
                {total === 1 ? 'item' : 'items'}
                {hasFilters && ' · filtered'}
              </>
            )}
          </p>
          {billingSummary?.entitlements.historyDays && (
            <p className="mt-1 text-xs text-muted-foreground">
              Free plan view limited to the most recent {billingSummary.entitlements.historyDays} days.
            </p>
          )}
        </div>
      </div>

      {/* ─── Filters ─────────────────────────────────────── */}
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search feedback…"
                className="h-9 w-full pl-9 text-sm md:w-72"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setSearchInput('')
                    updateParams({ q: '' })
                  }}
                  className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </form>

          <form onSubmit={handleTagSearch}>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Filter by tag…"
                className="h-9 w-full pl-9 text-sm md:w-56"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
              />
              {tagInput && (
                <button
                  type="button"
                  aria-label="Clear tag filter"
                  onClick={() => {
                    setTagInput('')
                    updateParams({ tag: '' })
                  }}
                  className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Filter pills row — horizontal scroll on mobile */}
        <div className="-mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {/* Status group */}
          <FilterPill
            active={!status && read === 'all'}
            onClick={() => updateParams({ status: '', read: '' })}
          >
            All
          </FilterPill>
          <FilterPill
            active={read === 'unread'}
            onClick={() => updateParams({ read: read === 'unread' ? '' : 'unread' })}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Unread
          </FilterPill>
          {statuses.map((s) => (
            <FilterPill
              key={s}
              active={status === s}
              onClick={() => updateParams({ status: status === s ? '' : s })}
            >
              <span
                className={cn('h-1.5 w-1.5 rounded-full', statusMeta[s].dot)}
              />
              {statusMeta[s].label}
            </FilterPill>
          ))}

          <span className="mx-0.5 h-4 w-px bg-border" />

          {/* Type group */}
          {types.map((t) => (
            <FilterPill
              key={t}
              active={type === t}
              onClick={() => updateParams({ type: type === t ? '' : t })}
            >
              <TypeIcon type={t} className="h-3.5 w-3.5" />
              <span className="capitalize">{t}</span>
            </FilterPill>
          ))}

          <span className="mx-0.5 h-4 w-px bg-border" />

          <FilterPill
            active={agent === '1'}
            onClick={() => updateParams({ agent: agent === '1' ? '' : '1' })}
          >
            <Bot className="h-3.5 w-3.5" />
            Agent
          </FilterPill>

          {hasFilters && (
            <button
              onClick={() => {
                setSearchInput('')
                setTagInput('')
                updateParams({ status: '', type: '', q: '', agent: '', projectId: '', tag: '', read: '' })
              }}
              className="ml-1 flex min-h-10 flex-shrink-0 items-center gap-1 rounded-md px-2 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:min-h-8"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
          </div>
        </div>

        {projects.length > 0 && (
          <div className="-mx-4 px-4 md:mx-0 md:px-0">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              <span className="pr-1 text-[11px] font-medium text-muted-foreground">
                Projects
              </span>
              {projects.map((project) => (
                <FilterPill
                  key={project.id}
                  active={projectId === project.id}
                  onClick={() => updateParams({ projectId: projectId === project.id ? '' : project.id })}
                >
                  {project.name}
                </FilterPill>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── Main List ────────────────────────────────────── */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : feedbacks.length === 0 ? (
          <EmptyState hasFilters={!!hasFilters} hasProjects={projects.length > 0} onClear={() => {
            setSearchInput('')
            setTagInput('')
            updateParams({ status: '', type: '', q: '', agent: '', projectId: '', tag: '', read: '' })
          }} />
        ) : (
          <div>
            {/* Select-all header */}
            <div className="flex items-center gap-3 border-b bg-muted/20 px-4 py-3">
              <input
                type="checkbox"
                checked={selected.size === feedbacks.length && feedbacks.length > 0}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border accent-primary"
                aria-label="Select all"
              />
              <span className="text-xs text-muted-foreground">
                {selected.size > 0
                  ? `${selected.size} selected`
                  : `Select all on this page`}
              </span>
            </div>

            {feedbacks.map((fb) => (
              <FeedbackRow
                key={fb.id}
                fb={fb}
                selected={selected.has(fb.id)}
                onToggle={() => toggleSelect(fb.id)}
              />
            ))}
          </div>
        )}
      </Card>

      {/* ─── Pagination ──────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page <= 1}
            onClick={() => updateParams({ page: String(page - 1) })}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {buildPageRange(page, totalPages).map((p, i) =>
            p === null ? (
              <span key={`gap-${i}`} className="px-1 text-xs text-muted-foreground">
                …
              </span>
            ) : (
              <Button
                key={p}
                variant={p === page ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8 text-xs"
                onClick={() => updateParams({ page: String(p) })}
              >
                {p}
              </Button>
            )
          )}

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page >= totalPages}
            onClick={() => updateParams({ page: String(page + 1) })}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* ─── Floating Bulk Action Bar ────────────────────── */}
      <div
        className={cn(
          'fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] left-1/2 z-50 w-[calc(100vw-1.5rem)] max-w-3xl -translate-x-1/2 transition-all duration-300 md:bottom-6 md:w-auto',
          selected.size > 0
            ? 'translate-y-0 opacity-100'
            : 'translate-y-4 opacity-0 pointer-events-none'
        )}
      >
        <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl border bg-background px-3 py-2 shadow-xl ring-1 ring-black/5 scrollbar-thin dark:ring-white/5 md:rounded-full">
          <span className="shrink-0 pl-1 pr-2 text-xs font-semibold">
            {selected.size} selected
          </span>
          <div className="h-4 w-px bg-border" />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 shrink-0 gap-1.5 rounded-full px-3 text-[11px] font-medium"
            disabled={bulkLoading}
            onClick={() => bulkUpdateStatus('reviewed')}
          >
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
            Review
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 shrink-0 gap-1.5 rounded-full px-3 text-[11px] font-medium"
            disabled={bulkLoading}
            onClick={() => bulkUpdateStatus('planned')}
          >
            <ClipboardList className="h-3.5 w-3.5 text-primary" />
            Plan
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 shrink-0 gap-1.5 rounded-full px-3 text-[11px] font-medium text-destructive hover:text-destructive"
            disabled={bulkLoading}
            onClick={() => bulkUpdateStatus('closed')}
          >
            <XCircle className="h-3.5 w-3.5" />
            Close
          </Button>
          <div className="h-4 w-px bg-border" />
          <Input
            value={bulkTagInput}
            onChange={(e) => setBulkTagInput(e.target.value)}
            placeholder="tag"
            className="h-8 w-28 shrink-0 rounded-full px-2.5 text-[12px]"
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 shrink-0 gap-1.5 rounded-full px-3 text-[11px] font-medium"
            disabled={bulkLoading || !bulkTagInput.trim()}
            onClick={() => bulkUpdateTags('add')}
          >
            Add tag
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 shrink-0 gap-1.5 rounded-full px-3 text-[11px] font-medium"
            disabled={bulkLoading || !bulkTagInput.trim()}
            onClick={() => bulkUpdateTags('remove')}
          >
            Remove tag
          </Button>
          <div className="h-4 w-px bg-border" />
          <button
            onClick={clearBulkSelection}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Deselect all"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          {bulkLoading && (
            <Loader2 className="ml-1 h-3.5 w-3.5 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Sub-components ─────────────────────────────────────── */

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium transition-all',
        'min-h-11 flex-shrink-0 md:min-h-8',
        active
          ? 'bg-foreground text-background shadow-sm'
          : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
      )}
    >
      {children}
    </button>
  )
}

function FeedbackRow({
  fb,
  selected,
  onToggle,
}: {
  fb: Feedback
  selected: boolean
  onToggle: () => void
}) {
  const isUnread = isFeedbackUnread(fb)

  return (
    <div
      className={cn(
        'group relative flex items-start gap-3 border-b px-4 py-3.5 transition-colors last:border-b-0',
        isUnread
          ? 'bg-primary/[0.04] ring-1 ring-inset ring-primary/15 hover:bg-primary/[0.06] dark:bg-primary/[0.07]'
          : 'hover:bg-accent/30',
        selected && 'bg-accent/50'
      )}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border accent-primary"
        aria-label="Select item"
        onClick={(e) => e.stopPropagation()}
      />

      <Link
        href={`/feedback/${fb.id}`}
        className="flex min-w-0 flex-1 items-start gap-2.5"
      >
        <span
          aria-hidden="true"
          className={cn(
            'mt-2 h-2 w-2 shrink-0 rounded-full transition-colors',
            isUnread ? 'bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]' : 'bg-transparent'
          )}
        />
        <TypeIcon type={fb.type} className="mt-0.5 shrink-0 text-muted-foreground" />

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'text-[13px] leading-relaxed',
              isUnread
                ? 'font-medium text-foreground'
                : 'text-foreground/75 group-hover:text-foreground'
            )}
          >
            {isUnread && <span className="sr-only">Unread feedback: </span>}
            {truncate(fb.message, 120)}
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            {/* Status */}
            <span
              className={cn(
                'flex items-center gap-1 text-[11px]',
                getStatusColor(fb.status)
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  statusMeta[fb.status]?.dot || 'bg-zinc-400'
                )}
              />
              {statusMeta[fb.status]?.label || fb.status}
            </span>

            {/* Type badge */}
            {fb.type && (
              <>
                <span className="text-[10px] text-muted-foreground/30">·</span>
                <Badge
                  variant="secondary"
                  className={cn('h-4 px-1.5 text-[11px]', getTypeColor(fb.type))}
                >
                  {fb.type}
                </Badge>
              </>
            )}

            {/* Agent badge */}
            {fb.agent_name && (
              <>
                <span className="text-[10px] text-muted-foreground/30">·</span>
                <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                  <Bot className="h-3 w-3" />
                  <span className="font-medium">{fb.agent_name}</span>
                </span>
              </>
            )}

            {/* Project */}
            {fb.projects && (
              <>
                <span className="text-[10px] text-muted-foreground/30">·</span>
                <span className="text-[11px] text-muted-foreground">
                  {fb.projects.name}
                </span>
              </>
            )}

            {fb.tags && fb.tags.length > 0 && (
              <>
                <span className="text-[10px] text-muted-foreground/30">·</span>
                <span className="flex flex-wrap items-center gap-1">
                  {fb.tags.slice(0, 2).map((tagValue) => (
                    <Badge key={tagValue} variant="outline" className="h-4 px-1.5 text-[10px]">
                      {tagValue}
                    </Badge>
                  ))}
                </span>
              </>
            )}

            {/* Time */}
            <span className="text-[10px] text-muted-foreground/30">·</span>
            <span className="text-[11px] text-muted-foreground">
              {formatRelativeTime(fb.created_at)}
            </span>
          </div>
        </div>

        {/* Rating */}
        {fb.rating && (
          <div className="flex shrink-0 items-center gap-px self-start pt-1">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-2.5 w-2.5',
                  i < fb.rating!
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground/12'
                )}
              />
            ))}
          </div>
        )}
      </Link>
    </div>
  )
}

function EmptyState({
  hasFilters,
  hasProjects,
  onClear,
}: {
  hasFilters: boolean
  hasProjects: boolean
  onClear: () => void
}) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Search className="h-10 w-10 text-muted-foreground/40" />
        <p className="mt-4 text-sm font-medium">No results found</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Try adjusting or clearing your filters.
        </p>
        <Button variant="outline" size="sm" className="mt-4 h-10 gap-1.5 text-xs" onClick={onClear}>
          <X className="h-3 w-3" />
          Clear all filters
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Inbox className="h-10 w-10 text-muted-foreground/40" />
      <p className="mt-4 text-sm font-medium">{hasProjects ? 'Your inbox is empty' : 'No feedback path is installed yet'}</p>
      <p className="mt-1.5 max-w-[260px] text-xs leading-relaxed text-muted-foreground">
        {hasProjects
          ? 'Open a project, finish Setup, then send one test from your site. New feedback will appear here with page and browser context.'
          : 'Create one project first. Then choose the form style, install the code, and send one test.'}
      </p>
      <Link href={hasProjects ? '/projects' : '/projects/new'} className="mt-4">
        <Button variant="outline" size="sm" className="h-10 gap-1.5 text-xs">
          <Inbox className="h-3.5 w-3.5" />
          {hasProjects ? 'Open projects' : 'Create project'}
        </Button>
      </Link>
    </div>
  )
}

/* ─── Helpers ────────────────────────────────────────────── */

function buildPageRange(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | null)[] = []
  const addPage = (n: number) => pages.push(n)
  const addGap = () => pages.push(null)

  addPage(1)
  if (current > 3) addGap()
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    addPage(p)
  }
  if (current < total - 2) addGap()
  addPage(total)

  return pages
}
