import Image from 'next/image'
import { Compass } from 'lucide-react'
import { loadBoardDirectoryEntries, type BoardSortMode } from '@/lib/board-discovery'
import { BoardDirectoryClient } from './board-directory-client'
import { cn } from '@/lib/utils'

interface BoardDirectorySurfaceProps {
  sort?: string
  category?: string
  variant?: 'public' | 'dashboard'
}

export async function BoardDirectorySurface({
  sort,
  category,
  variant = 'public',
}: BoardDirectorySurfaceProps) {
  const entries = await loadBoardDirectoryEntries()
  const categories = [...new Set(entries.flatMap((entry) => entry.branding.categories || []))].sort()
  const totalRequests = entries.reduce((sum, entry) => sum + entry.feedbackCount, 0)
  const totalReplies = entries.reduce((sum, entry) => sum + entry.publicReplyCount, 0)
  const dashboard = variant === 'dashboard'

  return (
    <div className={dashboard ? 'space-y-6' : 'mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12'}>
      <section
        className={cn(
          'relative overflow-hidden border border-border/80 bg-card shadow-sm',
          dashboard ? 'rounded-xl' : 'rounded-2xl',
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,hsl(var(--primary)/0.16),transparent_32%)]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.045] dark:opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
        <div className={cn(
          'relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end',
          dashboard ? 'px-5 py-7' : 'px-6 py-10',
        )}>
          <div>
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border bg-background/80 text-primary shadow-sm">
              <Compass className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Public boards
            </p>
            <h1 className={cn(
              'mt-3 max-w-3xl font-black leading-tight tracking-tighter text-foreground',
              dashboard ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl',
            )}>
              Browse public feedback boards.
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-foreground/70">
              See requests, votes, replies, and roadmap conversations from teams that turn
              customer signal into public product decisions.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              ['Indexed boards', entries.length],
              ['Tracked requests', totalRequests],
              ['Public replies', totalReplies],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-border/70 bg-background px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {label}
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {dashboard && (
        <div className="flex items-center justify-center">
          <Image
            src="/new_logo_feedbacks.dev.svg"
            alt=""
            width={100}
            height={100}
            aria-hidden="true"
            className="h-16 w-16 opacity-75 sm:h-[88px] sm:w-[88px] md:h-[100px] md:w-[100px]"
          />
        </div>
      )}

      <BoardDirectoryClient
        entries={entries}
        categories={categories}
        initialSort={(sort as BoardSortMode) || 'trending'}
        initialCategory={category?.trim().toLowerCase() || ''}
      />
    </div>
  )
}
