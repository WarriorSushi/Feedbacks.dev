import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BrandWordmark } from '@/components/brand-wordmark'
import { BoardDirectorySurface } from './board-directory-surface'

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

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_hsl(var(--background))_0%,_hsl(var(--muted))_100%)]">
      <header className="border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="font-bold transition-opacity active:opacity-70">
            <BrandWordmark className="text-lg" priority />
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

      <BoardDirectorySurface sort={params?.sort} category={params?.category} />
    </div>
  )
}
