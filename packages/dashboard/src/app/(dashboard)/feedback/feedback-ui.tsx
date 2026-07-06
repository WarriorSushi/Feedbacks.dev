import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function ProjectScopeButton({
  active,
  children,
  icon,
  onClick,
}: {
  active: boolean
  children: ReactNode
  icon?: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'inline-flex min-h-10 flex-shrink-0 snap-start items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition-colors md:min-h-8 md:py-1.5',
        active
          ? 'border-primary/35 bg-primary/[0.09] text-foreground'
          : 'border-border/80 bg-card text-muted-foreground hover:border-primary/25 hover:bg-accent hover:text-foreground',
      )}
    >
      {icon}
      <span className="max-w-44 truncate">{children}</span>
    </button>
  )
}

