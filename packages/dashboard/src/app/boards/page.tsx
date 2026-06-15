import { loadBoardDirectoryEntries, type BoardSortMode } from '@/lib/board-discovery'
import { BoardDirectoryClient } from './board-directory-client'
import Link from 'next/link'
import { ArrowRight, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Public Product Boards',
  description: 'Browse public boards from teams that collect feedback in private and share priorities in public.',
}

export default async function BoardsPage({
  searchParams,
}: {
  searchParams?: Promise<{ sort?: string; category?: string }>
}) {
  const params = await searchParams
  const entries = await loadBoardDirectoryEntries()
  const categories = [...new Set(entries.flatMap((entry) => entry.branding.categories || []))].sort()
  const totalRequests = entries.reduce((sum, entry) => sum + entry.feedbackCount, 0)
  const totalReplies = entries.reduce((sum, entry) => sum + entry.publicReplyCount, 0)

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_hsl(var(--background))_0%,_hsl(var(--muted))_100%)]">
      <header className="border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            feedbacks<span className="text-primary">.dev</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/auth">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                Sign in
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="sm" className="font-semibold">
                Create board
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,hsl(var(--primary)/0.16),transparent_32%)]" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.045] dark:opacity-[0.07]"
            style={{
              backgroundImage:
                'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
              backgroundSize: '36px 36px',
            }}
          />
          <div className="relative grid gap-8 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border bg-background/80 text-primary shadow-sm">
                <Compass className="h-5 w-5" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Public boards
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight tracking-tighter text-foreground md:text-5xl">
                Browse public feedback boards.
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-foreground/70">
                See requests, votes, replies, and roadmap conversations from teams that turn
                customer signal into public product decisions.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-xl border border-border/70 bg-background px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Indexed boards
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {entries.length}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Tracked requests
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {totalRequests}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Public replies
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {totalReplies}
                </p>
              </div>
            </div>
          </div>
        </section>

        <BoardDirectoryClient
          entries={entries}
          categories={categories}
          initialSort={(params?.sort as BoardSortMode) || 'trending'}
          initialCategory={params?.category?.trim().toLowerCase() || ''}
        />
      </div>
    </div>
  )
}
