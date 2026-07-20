'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CollapsibleDashboardSectionProps {
  storageId: string
  title: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

export function CollapsibleDashboardSection({
  storageId,
  title,
  action,
  children,
  className,
  contentClassName,
}: CollapsibleDashboardSectionProps) {
  const storageKey = `feedbacks:dashboard:section:${storageId}:collapsed`
  const [collapsed, setCollapsed] = React.useState(true)

  React.useEffect(() => {
    setCollapsed(window.localStorage.getItem(storageKey) === 'true')
  }, [storageKey])

  const toggle = () => {
    setCollapsed((current) => {
      const next = !current
      window.localStorage.setItem(storageKey, String(next))
      return next
    })
  }

  return (
    <section className={cn('border-t border-foreground/10', collapsed && 'w-full self-start', className)}>
      <header className="flex min-h-12 flex-row items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{title}</h2>
        <div className="flex items-center gap-1">
          {!collapsed && action}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground"
            onClick={toggle}
            aria-expanded={!collapsed}
            aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${title}`}
          >
            <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', collapsed && '-rotate-90')} />
          </Button>
        </div>
      </header>
      {!collapsed && <div className={contentClassName}>{children}</div>}
    </section>
  )
}
