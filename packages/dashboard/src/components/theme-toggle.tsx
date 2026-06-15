'use client'

import * as React from 'react'
import { flushSync } from 'react-dom'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

type ViewTransition = {
  ready: Promise<void>
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => ViewTransition
}

interface ThemeToggleProps {
  collapsed?: boolean
}

function getMaxRadius(x: number, y: number) {
  return Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  )
}

export function ThemeToggle({ collapsed = false }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === 'dark'
  const nextTheme = isDark ? 'light' : 'dark'

  const toggleTheme = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const viewTransitionDocument = document as ViewTransitionDocument

    if (!viewTransitionDocument.startViewTransition || prefersReducedMotion) {
      setTheme(nextTheme)
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const maxRadius = getMaxRadius(x, y)

    const transition = viewTransitionDocument.startViewTransition(() => {
      flushSync(() => {
        setTheme(nextTheme)
      })
    })

    await transition.ready

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 520,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        pseudoElement: '::view-transition-new(root)',
      },
    )
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={collapsed ? (isDark ? 'Light mode' : 'Dark mode') : undefined}
      onClick={toggleTheme}
      className={cn(
        'group flex w-full items-center rounded-lg text-[13px] font-medium',
        'text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        collapsed ? 'justify-center px-2 py-2' : 'justify-between gap-3 px-3 py-2',
      )}
    >
      <span className={cn('flex items-center', collapsed ? 'justify-center' : 'gap-2.5')}>
        {isDark ? (
          <Moon className="h-[17px] w-[17px] shrink-0" />
        ) : (
          <Sun className="h-[17px] w-[17px] shrink-0" />
        )}
        {!collapsed && <span>{isDark ? 'Dark mode' : 'Light mode'}</span>}
      </span>

      {!collapsed && (
        <span
          aria-hidden="true"
          className={cn(
            'relative h-5 w-9 shrink-0 rounded-full border transition-colors duration-200',
            isDark
              ? 'border-primary/30 bg-primary/20'
              : 'border-border bg-muted',
          )}
        >
          <span
            className={cn(
              'absolute top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full',
              'bg-background shadow-sm ring-1 ring-border transition-transform duration-200 [transition-timing-function:var(--ease-out-quart)]',
              isDark ? 'translate-x-[18px]' : 'translate-x-[2px]',
            )}
          />
        </span>
      )}
    </button>
  )
}
