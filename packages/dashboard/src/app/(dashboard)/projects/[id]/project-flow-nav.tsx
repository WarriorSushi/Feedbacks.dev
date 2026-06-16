'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export type ProjectSection = 'setup' | 'integrations' | 'board' | 'api' | 'settings'
export type SetupStep = 'customize' | 'install' | 'verify' | 'inbox'

function usePendingProjectLink() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [pendingHref, setPendingHref] = React.useState<string | null>(null)

  React.useEffect(() => {
    setPendingHref(null)
  }, [pathname, searchParams])

  const beginNavigation = React.useCallback(
    (href: string) => {
      const currentHref = searchParams.size > 0 ? `${pathname}?${searchParams.toString()}` : pathname
      if (href === currentHref) return
      setPendingHref(href)
      router.prefetch(href)
    },
    [pathname, router, searchParams],
  )

  const prefetch = React.useCallback((href: string) => router.prefetch(href), [router])

  return { pendingHref, beginNavigation, prefetch }
}

export function ProjectMenu({
  projectId,
  activeSection,
}: {
  projectId: string
  activeSection: ProjectSection
}) {
  const { pendingHref, beginNavigation, prefetch } = usePendingProjectLink()
  const items: Array<{ id: ProjectSection; label: string; href: string }> = [
    { id: 'setup', label: 'Setup', href: `/projects/${projectId}?tab=customize` },
    { id: 'integrations', label: 'Integrations', href: `/projects/${projectId}?tab=integrations` },
    { id: 'board', label: 'Public Board', href: `/projects/${projectId}?tab=board` },
    { id: 'api', label: 'API', href: `/projects/${projectId}?tab=api` },
    { id: 'settings', label: 'Settings', href: `/projects/${projectId}?tab=settings` },
  ]

  return (
    <nav
      aria-label="Project menu"
      className="sticky top-0 z-30 -mx-4 -mt-4 overflow-x-auto border-b border-primary/25 bg-primary/[0.09] px-4 py-3 shadow-[0_1px_0_hsl(var(--primary)/0.16),0_14px_28px_-24px_hsl(var(--primary)/0.65)] backdrop-blur dark:border-primary/35 dark:bg-primary/[0.16] md:-mx-6 md:-mt-6 md:px-6"
    >
      <div className="flex min-h-11 min-w-max items-center gap-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            aria-current={activeSection === item.id ? 'page' : undefined}
            onClick={() => beginNavigation(item.href)}
            onMouseEnter={() => prefetch(item.href)}
            onFocus={() => prefetch(item.href)}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-[background-color,color,box-shadow,transform] active:scale-[0.98] ${
              activeSection === item.id
                ? 'bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/30'
                : 'text-foreground/75 hover:bg-background/70 hover:text-foreground dark:text-foreground/80 dark:hover:bg-background/35'
            }`}
          >
            {pendingHref === item.href && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />}
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

export function SetupProgress({
  projectId,
  activeStep,
}: {
  projectId: string
  activeStep: SetupStep
}) {
  const { pendingHref, beginNavigation, prefetch } = usePendingProjectLink()
  const steps: Array<{ id: SetupStep; label: string; body: string; href: string }> = [
    {
      id: 'customize',
      label: 'Customize',
      body: 'Pick how the form looks.',
      href: `/projects/${projectId}?tab=customize`,
    },
    {
      id: 'install',
      label: 'Install',
      body: 'Copy code for your site.',
      href: `/projects/${projectId}?tab=install`,
    },
    {
      id: 'verify',
      label: 'Verify',
      body: 'Send one test.',
      href: `/projects/${projectId}/verify`,
    },
    {
      id: 'inbox',
      label: 'Inbox',
      body: 'Check it arrived.',
      href: `/feedback?projectId=${projectId}`,
    },
  ]

  return (
    <nav aria-label="Setup steps" className="rounded-lg border bg-card p-2">
      <ol className="grid gap-2 md:grid-cols-4">
        {steps.map((step, index) => {
          const current = activeStep === step.id
          return (
            <li key={step.id}>
              <Link
                href={step.href}
                onClick={() => beginNavigation(step.href)}
                onMouseEnter={() => prefetch(step.href)}
                onFocus={() => prefetch(step.href)}
                className={`flex min-h-14 gap-3 rounded-md px-3 py-2 text-left transition-[background-color,color,transform] active:scale-[0.99] ${
                  current ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                }`}
                aria-current={current ? 'step' : undefined}
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    current ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {pendingHref === step.href ? <Loader2 className="h-3 w-3 animate-spin" /> : index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{step.label}</span>
                  <span className="mt-0.5 block text-xs leading-4">{step.body}</span>
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
