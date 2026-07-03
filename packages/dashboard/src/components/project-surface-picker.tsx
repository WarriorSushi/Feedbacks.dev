'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowRight, Check, FolderOpen, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ProjectSurfaceItem {
  id: string
  name: string
  domain: string | null
  href: string
  status: string
  detail: string
}

interface ProjectSurfacePickerProps {
  eyebrow: string
  title: string
  description: string
  actionLabel: string
  emptyTitle: string
  emptyDescription: string
  items: ProjectSurfaceItem[]
  preferredProjectId?: string
}

export function ProjectSurfacePicker({
  eyebrow,
  title,
  description,
  actionLabel,
  emptyTitle,
  emptyDescription,
  items,
  preferredProjectId,
}: ProjectSurfacePickerProps) {
  const [query, setQuery] = React.useState('')
  const normalizedQuery = query.trim().toLowerCase()
  const filteredItems = normalizedQuery
    ? items.filter((item) =>
        [item.name, item.domain, item.status, item.detail]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedQuery)),
      )
    : items

  return (
    <div data-tour="project-surface" className="space-y-6">
      <div className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border bg-card px-5 py-8">
          <div className="mx-auto max-w-sm text-center">
            <FolderOpen className="mx-auto h-9 w-9 text-muted-foreground/45" />
            <p className="mt-3 text-sm font-semibold">{emptyTitle}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{emptyDescription}</p>
            <Button asChild className="mt-5">
              <Link href="/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                Create project
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          {items.length > 4 && (
            <div className="border-b p-3 sm:p-4">
              <label htmlFor={`${eyebrow.toLowerCase()}-project-search`} className="sr-only">
                Search projects
              </label>
              <div className="relative max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id={`${eyebrow.toLowerCase()}-project-search`}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search projects..."
                  className="h-11 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 sm:h-10"
                />
              </div>
            </div>
          )}
          {filteredItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'group grid gap-3 border-b px-4 py-4 last:border-b-0',
                'transition-[background-color,transform] hover:bg-accent/45 active:scale-[0.99]',
                'md:grid-cols-[minmax(0,1fr)_auto] md:items-center',
              )}
            >
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <FolderOpen className="h-4 w-4 shrink-0 text-primary" />
                  <h2 className="truncate text-base font-semibold">{item.name}</h2>
                  {item.id === preferredProjectId && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-md border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      <Check className="h-3 w-3" /> Current
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>{item.domain || 'No domain set'}</span>
                  <span className="hidden h-1 w-1 rounded-full bg-border sm:inline-block" />
                  <span>{item.status}</span>
                  <span className="hidden h-1 w-1 rounded-full bg-border sm:inline-block" />
                  <span>{item.detail}</span>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary md:justify-end">
                {actionLabel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
          {filteredItems.length === 0 && (
            <div className="px-5 py-10 text-center">
              <p className="text-sm font-medium">No projects match “{query.trim()}”</p>
              <button type="button" onClick={() => setQuery('')} className="mt-2 min-h-11 text-sm font-medium text-primary sm:min-h-0">
                Clear search
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
