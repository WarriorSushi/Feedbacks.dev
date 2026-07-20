'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { WorkspaceSection } from '@/components/ui/workspace-section'
import { CURATED_BOARD_CATEGORIES, getBoardCategoryLabel, normalizeBoardCategories } from '@/lib/board-categories'
import { cn } from '@/lib/utils'
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
  const categories = settings.branding.categories || []

  const toggleCategory = (category: string) => {
    const nextCategories = categories.includes(category)
      ? categories.filter((entry) => entry !== category)
      : [...categories, category]
    onBrandingChange({ categories: normalizeBoardCategories(nextCategories) || [] })
  }

  return (
    <WorkspaceSection title="Who can see it" description="Make the page public, share it by link, or keep it private.">
        <label className="flex min-h-12 items-start gap-3 rounded-lg border bg-muted/10 px-3 py-3 text-sm">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => onSettingsChange({ enabled: e.target.checked })}
            className="mt-0.5 h-4 w-4 rounded border"
          />
          <span>
            <span className="block font-medium text-foreground">Publish this page</span>
            <span className="text-muted-foreground">
              Turn this on when the page is ready for visitors.
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
              Public pages can appear in the directory. Unlisted pages only work with the link. Private pages stay closed.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="board-categories">Categories</Label>
            <Input
              id="board-categories"
              value={categories.join(', ')}
              onChange={(e) =>
                onBrandingChange({
                  categories: normalizeBoardCategories(e.target.value.split(',')) || [],
                })
              }
              placeholder="saas, developer-tools, analytics"
            />
            <p className="text-xs text-muted-foreground">
              Pick a few topics that help people find your page.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Suggested categories</Label>
          <div className="flex flex-wrap gap-2">
            {CURATED_BOARD_CATEGORIES.map((category) => {
              const selected = categories.includes(category)
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={cn(
                    'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                    selected
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  {getBoardCategoryLabel(category)}
                </button>
              )
            })}
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
    </WorkspaceSection>
  )
}
