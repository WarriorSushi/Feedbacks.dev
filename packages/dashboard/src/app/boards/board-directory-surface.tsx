import { Compass } from 'lucide-react'
import { loadBoardDirectoryEntries, type BoardSortMode } from '@/lib/board-discovery'
import { buildDirectoryCategoryOptions } from '@/lib/board-categories'
import { BoardDirectoryClient } from './board-directory-client'
import { cn } from '@/lib/utils'

interface BoardDirectorySurfaceProps {
  sort?: string
  category?: string
  page?: string
  variant?: 'public' | 'dashboard'
}

export async function BoardDirectorySurface({
  sort,
  category,
  page,
  variant = 'public',
}: BoardDirectorySurfaceProps) {
  const entries = await loadBoardDirectoryEntries()
  const categories = buildDirectoryCategoryOptions(entries.map((entry) => entry.branding.categories || []))
  const totalRequests = entries.reduce((sum, entry) => sum + entry.feedbackCount, 0)
  const totalReplies = entries.reduce((sum, entry) => sum + entry.publicReplyCount, 0)
  const dashboard = variant === 'dashboard'

  return (
    <div
      data-tour={dashboard ? 'boards-directory' : undefined}
      className={dashboard ? 'space-y-6' : 'mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-12'}
    >
      <section className="relative border-b border-border/80">
        <div className={cn(
          'relative grid gap-4 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end',
          dashboard ? 'py-7' : 'py-8 sm:py-12',
        )}>
          <div>
            <div className="mb-5 hidden h-12 w-12 items-center justify-center rounded-xl border bg-background/80 text-primary shadow-sm sm:flex">
              <Compass className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Feedback from real users
            </p>
            <h1 className={cn(
              'mt-3 max-w-3xl font-black leading-tight tracking-tighter text-foreground',
              dashboard ? 'text-3xl md:text-4xl' : 'text-2xl sm:text-4xl md:text-5xl',
            )}>
              See what people want teams to build.
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-foreground/70 sm:mt-3 sm:text-base sm:leading-7">
              Read ideas and bugs. Vote for what matters. See what each team says next.
            </p>
          </div>

          <div className="grid grid-cols-3 divide-x border-y lg:border-y-0">
            {[
              ['Boards', entries.length],
              ['Ideas and bugs', totalRequests],
              ['Team replies', totalReplies],
            ].map(([label, value]) => (
              <div key={label} className="px-3 py-3 sm:px-5 sm:py-4">
                <p className="text-[10px] font-semibold uppercase text-muted-foreground sm:text-[11px] sm:tracking-[0.18em]">
                  <span className="sm:hidden">{String(label).replace('Indexed boards', 'Boards').replace('Tracked requests', 'Requests').replace('Public replies', 'Replies')}</span>
                  <span className="hidden sm:inline">{label}</span>
                </p>
                <p className="mt-1 text-lg font-semibold tracking-tight text-foreground sm:mt-2 sm:text-2xl">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BoardDirectoryClient
        entries={entries}
        categories={categories}
        initialSort={(sort as BoardSortMode) || 'trending'}
        initialCategory={category?.trim().toLowerCase() || ''}
        initialPage={Number(page) || 1}
        variant={variant}
      />
    </div>
  )
}
