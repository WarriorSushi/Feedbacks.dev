import Link from 'next/link'
import { ArrowLeft, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl items-center px-4 py-12">
      <div className="w-full border-y py-10 text-center">
        <SearchX className="mx-auto h-7 w-7 text-muted-foreground" />
        <h1 className="mt-4 text-xl font-semibold">Nothing lives at this address</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The item may have moved, been deleted, or belong to another project.
        </p>
        <Button className="mt-5" asChild>
          <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Return to dashboard</Link>
        </Button>
      </div>
    </main>
  )
}

