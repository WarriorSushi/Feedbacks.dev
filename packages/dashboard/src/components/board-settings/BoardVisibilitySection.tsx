'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { BoardBranding, BoardVisibility } from '@/lib/public-board'

interface BoardVisibilitySettings {
  enabled: boolean
  branding: BoardBranding
}

interface BoardVisibilitySectionProps {
  settings: BoardVisibilitySettings
  onSettingsChange: (patch: Partial<BoardVisibilitySettings>) => void
  onBrandingChange: (patch: Partial<BoardBranding>) => void
}

export function BoardVisibilitySection({
  settings,
  onSettingsChange,
  onBrandingChange,
}: BoardVisibilitySectionProps) {
  const visibility = settings.branding.visibility || 'public'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Visibility</CardTitle>
        <CardDescription>Control whether the board is public, unlisted, or kept private while you set it up.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <label className="flex min-h-12 items-start gap-3 rounded-lg border bg-muted/10 px-3 py-3 text-sm">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => onSettingsChange({ enabled: e.target.checked })}
            className="mt-0.5 h-4 w-4 rounded border"
          />
          <span>
            <span className="block font-medium text-foreground">Enable the board route</span>
            <span className="text-muted-foreground">
              The board can open when visibility allows it. Keep this off while drafting copy and moderation rules.
            </span>
          </span>
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="board-visibility">Visibility</Label>
            <select
              id="board-visibility"
              value={visibility}
              onChange={(e) => onBrandingChange({ visibility: e.target.value as BoardVisibility })}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="public">Public</option>
              <option value="unlisted">Unlisted</option>
              <option value="private">Private</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Public boards appear in discovery. Unlisted boards work via direct URL only. Private hides the board route until you are ready.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="board-categories">Categories</Label>
            <Input
              id="board-categories"
              value={settings.branding.categories?.join(', ') || ''}
              onChange={(e) =>
                onBrandingChange({
                  categories: e.target.value
                    .split(',')
                    .map((entry) => entry.trim().toLowerCase())
                    .filter(Boolean),
                })
              }
              placeholder="saas, developer-tools, analytics"
            />
          </div>
        </div>

        {visibility === 'public' && (
          <label className="flex min-h-12 items-start gap-3 rounded-lg border bg-muted/10 px-3 py-3 text-sm">
            <input
              type="checkbox"
              checked={settings.branding.directoryOptIn !== false}
              onChange={(e) => onBrandingChange({ directoryOptIn: e.target.checked })}
              className="mt-0.5 h-4 w-4 rounded border"
            />
            <span>
              <span className="block font-medium text-foreground">List in the public directory</span>
              <span className="text-muted-foreground">Make the board discoverable outside the direct URL.</span>
            </span>
          </label>
        )}
      </CardContent>
    </Card>
  )
}
