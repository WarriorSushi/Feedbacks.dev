'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[app:error]', { message: error.message, digest: error.digest })
  }, [error])

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl items-center px-4 py-12">
      <div className="w-full border-y py-10 text-center">
        <AlertTriangle className="mx-auto h-7 w-7 text-destructive" />
        <h1 className="mt-4 text-xl font-semibold">This screen could not load</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Your data was not changed. Try this screen again, or return to the dashboard.
        </p>
        {error.digest && <p className="mt-2 font-mono text-xs text-muted-foreground">Reference {error.digest}</p>}
        <div className="mt-5 flex justify-center gap-2">
          <Button onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" asChild><Link href="/dashboard">Dashboard</Link></Button>
        </div>
      </div>
    </main>
  )
}

