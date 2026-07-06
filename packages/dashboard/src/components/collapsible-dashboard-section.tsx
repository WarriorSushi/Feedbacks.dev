'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3 pt-3.5">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
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
      </CardHeader>
      {!collapsed && <CardContent className={contentClassName}>{children}</CardContent>}
    </Card>
  )
}
