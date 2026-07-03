import Link from 'next/link'
import { FolderOpen, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ProjectRequiredEmpty({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="space-y-6">
      <div className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <div className="border-y px-4 py-12 text-center">
        <FolderOpen className="mx-auto h-9 w-9 text-muted-foreground/45" />
        <p className="mt-3 text-sm font-semibold">Create a project first</p>
        <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
          Project settings, feedback, integrations, and API access stay together.
        </p>
        <Button asChild className="mt-5">
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            Create project
          </Link>
        </Button>
      </div>
    </div>
  )
}
