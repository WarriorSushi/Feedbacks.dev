'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import type { BoardAnnouncement, BoardBranding } from '@/lib/public-board'

interface BoardContentSettings {
  title: string
  description: string
  show_types: string[]
  allow_submissions: boolean
  branding: BoardBranding
  announcements: BoardAnnouncement[]
}

interface BoardContentSectionProps {
  settings: BoardContentSettings
  onSettingsChange: (patch: Partial<BoardContentSettings>) => void
  onBrandingChange: (patch: Partial<BoardBranding>) => void
  onAnnouncementUpdate: (index: number, patch: Partial<BoardAnnouncement>) => void
  onAnnouncementAdd: () => void
  onAnnouncementRemove: (index: number) => void
}

const FEEDBACK_TYPES = [
  { value: 'idea', label: 'Feature requests' },
  { value: 'bug', label: 'Bug' },
  { value: 'praise', label: 'Praise' },
  { value: 'question', label: 'Question' },
] as const

export function BoardContentSection({
  settings,
  onSettingsChange,
  onBrandingChange,
  onAnnouncementUpdate,
  onAnnouncementAdd,
  onAnnouncementRemove,
}: BoardContentSectionProps) {
  const toggleType = (type: string) => {
    const next = settings.show_types.includes(type)
      ? settings.show_types.filter((entry) => entry !== type)
      : [...settings.show_types, type]
    onSettingsChange({ show_types: next })
  }

  return (
    <div className="space-y-6">
      <section className="space-y-5 border-b pb-7">
        <div><h3 className="text-base font-semibold">Top of the page</h3><p className="mt-1 text-sm text-muted-foreground">Write the first thing visitors will read.</p></div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="board-hero-eyebrow">Hero eyebrow</Label>
              <Input
                id="board-hero-eyebrow"
                value={settings.branding.heroEyebrow || ''}
                onChange={(e) => onBrandingChange({ heroEyebrow: e.target.value })}
                placeholder="Public board"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="board-hero-title">Hero title</Label>
              <Input
                id="board-hero-title"
                value={settings.branding.heroTitle || ''}
                onChange={(e) => onBrandingChange({ heroTitle: e.target.value })}
                placeholder="Roadmap and feedback"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="board-hero-description">Hero description</Label>
            <textarea
              id="board-hero-description"
              value={settings.branding.heroDescription || ''}
              onChange={(e) => onBrandingChange({ heroDescription: e.target.value })}
              rows={3}
              className="min-h-[88px] w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Track what the team is building, vote on requests, and see public updates."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="board-tagline">Tagline</Label>
            <Input
              id="board-tagline"
              value={settings.branding.tagline || ''}
              onChange={(e) => onBrandingChange({ tagline: e.target.value })}
              placeholder="Dependable product updates for your users"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="board-empty-title">Empty state title</Label>
              <Input
                id="board-empty-title"
                value={settings.branding.emptyStateTitle || ''}
                onChange={(e) => onBrandingChange({ emptyStateTitle: e.target.value })}
                placeholder="No requests yet"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="board-empty-description">Empty state description</Label>
              <Input
                id="board-empty-description"
                value={settings.branding.emptyStateDescription || ''}
                onChange={(e) => onBrandingChange({ emptyStateDescription: e.target.value })}
                placeholder="Start the conversation by submitting the first request."
              />
            </div>
          </div>
      </section>

      <section className="space-y-5 border-b pb-7">
        <div><h3 className="text-base font-semibold">What visitors can post</h3><p className="mt-1 text-sm text-muted-foreground">Pick the choices shown in the post form.</p></div>
          <div className="space-y-2">
            <Label>Feedback types to show</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {FEEDBACK_TYPES.map((type) => (
                <label key={type.value} className="flex min-h-11 items-center gap-2 rounded-lg border bg-background px-3 text-sm transition-colors hover:bg-muted/30">
                  <input
                    type="checkbox"
                    checked={settings.show_types.includes(type.value)}
                    onChange={() => toggleType(type.value)}
                    className="h-4 w-4 rounded border"
                  />
                  <span>{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          <label className="flex min-h-12 items-center gap-3 rounded-lg border bg-muted/10 px-3 text-sm">
            <input
              type="checkbox"
              checked={settings.allow_submissions}
              onChange={(e) => onSettingsChange({ allow_submissions: e.target.checked })}
              className="h-4 w-4 rounded border"
            />
            <span>
              <span className="block font-medium text-foreground">Allow public submissions</span>
              <span className="text-muted-foreground">Visitors can post new requests directly on the board.</span>
            </span>
          </label>
      </section>

      <section className="space-y-5 border-b pb-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold">News for visitors</h3>
              <p className="mt-1 text-sm text-muted-foreground">Share a short note when you ship something.</p>
            </div>
            <Button variant="outline" size="sm" onClick={onAnnouncementAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        <div className="space-y-3">
          {settings.announcements.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/10 p-4 text-sm text-muted-foreground">
              No news yet. Add a note when you ship something users asked for.
            </div>
          ) : (
            settings.announcements.map((announcement, index) => (
              <div key={announcement.id} className="space-y-3 rounded-lg border p-4">
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
                  <Input
                    value={announcement.title}
                    onChange={(e) => onAnnouncementUpdate(index, { title: e.target.value })}
                    placeholder="Shipping widget verification page"
                  />
                  <Input
                    type="date"
                    value={announcement.publishedAt.slice(0, 10)}
                    onChange={(e) => onAnnouncementUpdate(index, { publishedAt: e.target.value })}
                  />
                </div>
                <textarea
                  value={announcement.body}
                  onChange={(e) => onAnnouncementUpdate(index, { body: e.target.value })}
                  rows={3}
                  className="min-h-[88px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="Short public update about what changed and why it matters."
                />
                <div className="flex flex-wrap gap-3">
                  <Input
                    value={announcement.href || ''}
                    onChange={(e) => onAnnouncementUpdate(index, { href: e.target.value })}
                    placeholder="Optional link"
                  />
                  <Button variant="ghost" size="sm" onClick={() => onAnnouncementRemove(index)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
