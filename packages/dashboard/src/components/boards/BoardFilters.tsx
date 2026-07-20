'use client'

import { ArrowUpDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { typeConfig, type FilterType, type SortMode } from './board-types'

interface BoardFiltersProps {
  showTypes: string[]
  filter: FilterType
  sort: SortMode
  search: string
  onFilterChange: (filter: FilterType) => void
  onSortChange: (sort: SortMode) => void
  onSearchChange: (search: string) => void
}

export function BoardFilters({
  showTypes,
  filter,
  sort,
  search,
  onFilterChange,
  onSortChange,
  onSearchChange,
}: BoardFiltersProps) {
  const filterTabs: Array<{ value: FilterType; label: string }> = [
    { value: 'all', label: 'All requests' },
    ...showTypes.map((type) => ({
      value: type as FilterType,
      label: typeConfig[type]?.label || type,
    })),
  ]

  return (
    <section className="border-b border-border/70 pb-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Ideas and bugs</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => onFilterChange(tab.value)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  filter === tab.value
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground hover:text-foreground',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search requests..."
              aria-label="Search board requests"
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="relative min-w-[168px]">
            <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              aria-label="Sort board requests"
              value={sort}
              onChange={(event) => onSortChange(event.target.value as SortMode)}
              className="h-10 w-full appearance-none rounded-lg border border-border bg-background pl-9 pr-8 text-sm text-foreground"
            >
              <option value="votes">Most voted</option>
              <option value="newest">Newest</option>
              <option value="status">By status</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  )
}
