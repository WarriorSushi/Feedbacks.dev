'use client'

import * as React from 'react'
import Link from 'next/link'
import { Bookmark, Plus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'

interface SavedInboxView {
  id: string
  name: string
  query: string
}

export function SavedInboxViews({ currentQuery }: { currentQuery: string }) {
  const supabase = React.useMemo(() => createClient(), [])
  const [views, setViews] = React.useState<SavedInboxView[]>([])
  const [name, setName] = React.useState('')
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) return
      const { data } = await supabase
        .from('user_settings')
        .select('preferences')
        .eq('user_id', user.id)
        .maybeSingle()
      if (cancelled) return
      const preferences = data?.preferences && typeof data.preferences === 'object' && !Array.isArray(data.preferences)
        ? data.preferences as Record<string, unknown>
        : {}
      const saved = Array.isArray(preferences.savedInboxViews)
        ? preferences.savedInboxViews.filter((view): view is SavedInboxView => {
            if (!view || typeof view !== 'object' || Array.isArray(view)) return false
            const item = view as Record<string, unknown>
            return typeof item.id === 'string' && typeof item.name === 'string' && typeof item.query === 'string'
          }).slice(0, 12)
        : []
      setViews(saved)
    }
    void load()
    return () => { cancelled = true }
  }, [supabase])

  const persist = async (nextViews: SavedInboxView[]) => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSaving(false)
      return false
    }
    const { data: current } = await supabase
      .from('user_settings')
      .select('preferences')
      .eq('user_id', user.id)
      .maybeSingle()
    const preferences = current?.preferences && typeof current.preferences === 'object' && !Array.isArray(current.preferences)
      ? current.preferences as Record<string, unknown>
      : {}
    const { error } = await supabase.from('user_settings').upsert({
      user_id: user.id,
      preferences: { ...preferences, savedInboxViews: nextViews },
      updated_at: new Date().toISOString(),
    })
    setSaving(false)
    if (error) {
      toast({ title: 'Could not save inbox view', description: error.message, variant: 'destructive' })
      return false
    }
    setViews(nextViews)
    return true
  }

  const saveView = async () => {
    const trimmedName = name.trim()
    if (!trimmedName) return
    const query = new URLSearchParams(currentQuery)
    query.delete('page')
    const next = [
      ...views.filter((view) => view.name.toLowerCase() !== trimmedName.toLowerCase()),
      { id: crypto.randomUUID(), name: trimmedName, query: query.toString() },
    ].slice(-12)
    if (await persist(next)) {
      setName('')
      toast({ title: 'Inbox view saved' })
    }
  }

  return (
    <details className="rounded-md border bg-card/60">
      <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 px-3 text-xs font-medium text-muted-foreground marker:hidden">
        <Bookmark className="h-3.5 w-3.5" />
        Saved views
        {views.length > 0 && <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px]">{views.length}</span>}
      </summary>
      <div className="space-y-3 border-t p-3">
        {views.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {views.map((view) => (
              <span key={view.id} className="inline-flex items-center overflow-hidden rounded-md border bg-background text-xs">
                <Link href={view.query ? `/feedback?${view.query}` : '/feedback'} className="px-2.5 py-2 font-medium hover:bg-accent">
                  {view.name}
                </Link>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center border-l text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label={`Delete saved view ${view.name}`}
                  disabled={saving}
                  onClick={() => void persist(views.filter((item) => item.id !== view.id))}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name this filter view"
            aria-label="Saved inbox view name"
            maxLength={40}
            className="h-9"
          />
          <Button type="button" size="sm" variant="outline" disabled={saving || !name.trim()} onClick={() => void saveView()}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />Save current view
          </Button>
        </div>
      </div>
    </details>
  )
}

