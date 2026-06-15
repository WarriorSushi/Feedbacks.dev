'use client'

import type React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { BoardBranding } from '@/lib/public-board'

interface BoardSettingsSlice {
  display_name: string
  slug: string
}

interface BoardIdentitySectionProps {
  settings: BoardSettingsSlice & { branding: BoardBranding }
  onSettingsChange: (patch: Partial<BoardSettingsSlice>) => void
  onBrandingChange: (patch: Partial<BoardBranding>) => void
  slugManuallyEdited: React.RefObject<boolean>
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function BoardIdentitySection({
  settings,
  onSettingsChange,
  onBrandingChange,
  slugManuallyEdited,
}: BoardIdentitySectionProps) {
  const handleDisplayNameChange = (value: string) => {
    const clamped = value.slice(0, 60)
    onSettingsChange({ display_name: clamped })

    if (!slugManuallyEdited.current) {
      onSettingsChange({ display_name: clamped, slug: slugify(clamped) })
    }
  }

  const handleSlugChange = (value: string) => {
    slugManuallyEdited.current = true
    onSettingsChange({ slug: slugify(value) })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Identity</CardTitle>
        <CardDescription>Name, URL, and visual identity for your public board.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="board-display-name">Display name</Label>
          <Input
            id="board-display-name"
            value={settings.display_name}
            onChange={(e) => handleDisplayNameChange(e.target.value)}
            placeholder="My Product"
            maxLength={60}
          />
          <p className="text-xs text-muted-foreground">
            The name users see on your public board.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="board-slug">Slug</Label>
          <div className="flex gap-2">
            <div className="flex items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
              /p/
            </div>
            <Input
              id="board-slug"
              value={settings.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="my-product"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="board-logo-mark">Logo mark</Label>
            <Input
              id="board-logo-mark"
              value={settings.branding.logoEmoji || ''}
              onChange={(e) => onBrandingChange({ logoEmoji: e.target.value })}
              placeholder="◦"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="board-accent-color">Accent color</Label>
            <div className="flex gap-2">
              <input
                type="color"
                id="board-accent-color"
                value={settings.branding.accentColor || '#0f766e'}
                onChange={(e) => onBrandingChange({ accentColor: e.target.value })}
                className="h-10 w-10 cursor-pointer rounded border"
              />
              <Input
                value={settings.branding.accentColor || ''}
                onChange={(e) => onBrandingChange({ accentColor: e.target.value })}
                placeholder="#0f766e"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="board-website-url">Website URL</Label>
          <Input
            id="board-website-url"
            value={settings.branding.websiteUrl || ''}
            onChange={(e) => onBrandingChange({ websiteUrl: e.target.value })}
            placeholder="https://example.com"
          />
        </div>
      </CardContent>
    </Card>
  )
}
