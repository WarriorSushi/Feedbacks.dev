'use client'

import * as React from 'react'
import Link from 'next/link'
import { Check, Copy, Search, X } from 'lucide-react'

interface SearchPage {
  slug: string
  title: string
  description: string
  category: string
  searchText: string
}

export function DocsSearch({ pages }: { pages: SearchPage[] }) {
  const [query, setQuery] = React.useState('')
  const normalized = query.trim().toLowerCase()
  const results = normalized
    ? pages.filter((page) => `${page.title} ${page.description} ${page.category} ${page.searchText}`.toLowerCase().includes(normalized)).slice(0, 8)
    : []

  return (
    <div className="relative w-full max-w-xl">
      <label htmlFor="docs-search" className="sr-only">Search documentation</label>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        id="docs-search"
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search docs..."
        className="h-10 w-full rounded-md border bg-background pl-9 pr-10 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery('')}
          className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Clear documentation search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {normalized && (
        <div className="absolute inset-x-0 top-12 z-50 overflow-hidden rounded-md border bg-popover shadow-xl">
          {results.length > 0 ? results.map((page) => (
            <Link
              key={page.slug}
              href={`/docs/${page.slug}`}
              onClick={() => setQuery('')}
              className="block border-b px-4 py-3 last:border-b-0 hover:bg-accent"
            >
              <span className="text-xs font-medium text-primary">{page.category}</span>
              <span className="mt-0.5 block text-sm font-semibold">{page.title}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{page.description}</span>
            </Link>
          )) : (
            <p className="px-4 py-5 text-sm text-muted-foreground">No documentation matches “{query.trim()}”.</p>
          )}
        </div>
      )}
    </div>
  )
}

export function DocsCodeBlock({ label, language, code }: { label: string; language: string; code: string }) {
  const [copied, setCopied] = React.useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="my-6 overflow-hidden rounded-lg border bg-zinc-950 text-zinc-100 shadow-sm">
      <div className="flex min-h-10 items-center justify-between border-b border-zinc-800 px-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-zinc-300">{label}</span>
          <span className="text-zinc-500">{language}</span>
        </div>
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          aria-label={`Copy ${label} code`}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-6"><code>{code}</code></pre>
    </div>
  )
}
