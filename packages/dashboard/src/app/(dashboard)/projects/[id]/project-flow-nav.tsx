'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Check, Loader2 } from 'lucide-react'

export type ProjectSection = 'setup' | 'integrations' | 'board' | 'updates' | 'api' | 'settings'
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
    { id: 'setup', label: 'Setup', href: `/projects/${projectId}?tab=install` },
    { id: 'integrations', label: 'Integrations', href: `/projects/${projectId}?tab=integrations` },
    { id: 'board', label: 'Public Board', href: `/projects/${projectId}?tab=board` },
    { id: 'updates', label: 'Updates', href: `/projects/${projectId}?tab=updates` },
    { id: 'api', label: 'API', href: `/projects/${projectId}?tab=api` },
    { id: 'settings', label: 'Settings', href: `/projects/${projectId}?tab=settings` },
  ]

  return (
    <nav
      aria-label="Project menu"
      data-tour="project-menu"
      className="scroll-fade-x sticky top-0 z-30 -mx-4 -mt-4 overflow-x-auto border-b border-primary/25 bg-primary/[0.09] px-4 py-3 pr-10 shadow-[0_1px_0_hsl(var(--primary)/0.16),0_14px_28px_-24px_hsl(var(--primary)/0.65)] backdrop-blur dark:border-primary/35 dark:bg-primary/[0.12] md:-mx-6 md:-mt-6 md:px-6"
    >
      <div className="flex min-h-11 min-w-max items-center gap-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            prefetch={false}
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
      id: 'install',
      label: 'Install',
      body: 'Copy the matching code.',
      href: `/projects/${projectId}?tab=install`,
    },
    {
      id: 'verify',
      label: 'Verify',
      body: 'Send one test message.',
      href: `/projects/${projectId}/verify`,
    },
    {
      id: 'inbox',
      label: 'Inbox',
      body: 'Confirm it arrived.',
      href: `/feedback?projectId=${projectId}`,
    },
    {
      id: 'customize',
      label: 'Customize',
      body: 'Optional after success.',
      href: `/projects/${projectId}?tab=customize`,
    },
  ]
  const activeIndex = Math.max(steps.findIndex((step) => step.id === activeStep), 0)
  const nextActionByStep: Record<SetupStep, { title: string; body: string; href: string; label: string }> = {
    customize: {
      title: 'Update the install after customization',
      body: 'Save the form style, then copy the regenerated code if the trigger mode changed.',
      href: `/projects/${projectId}?tab=install`,
      label: 'Continue to install',
    },
    install: {
      title: 'Next: copy code and run verification',
      body: 'Paste the selected snippet into your app shell, then use the hosted page to send one known-good test.',
      href: `/projects/${projectId}/verify`,
      label: 'Open verification',
    },
    verify: {
      title: 'Next: confirm the test reached the inbox',
      body: 'After submitting one test message, check the project inbox for URL and browser context.',
      href: `/feedback?projectId=${projectId}`,
      label: 'Open project inbox',
    },
    inbox: {
      title: 'Installed: customize only if you need to',
      body: 'The core loop works. Adjust placement and labels now, or keep the defaults and start collecting feedback.',
      href: `/projects/${projectId}?tab=customize`,
      label: 'Customize form',
    },
  }
  const nextAction = nextActionByStep[activeStep]

  return (
    <nav
      aria-label="Setup steps"
      data-tour="setup-progress"
      className="rounded-xl border border-primary/25 bg-card shadow-sm"
    >
      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Setup progress
          </p>
          <h2 className="mt-2 text-base font-semibold text-foreground">{nextAction.title}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{nextAction.body}</p>
        </div>
        <Link
          href={nextAction.href}
          prefetch={false}
          onClick={() => beginNavigation(nextAction.href)}
          onMouseEnter={() => prefetch(nextAction.href)}
          onFocus={() => prefetch(nextAction.href)}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-[background-color,transform] hover:bg-primary/90 active:scale-[0.98]"
        >
          {pendingHref === nextAction.href ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          {nextAction.label}
        </Link>
      </div>

      <ol className="grid grid-cols-4 border-t bg-muted/20">
        {steps.map((step, index) => {
          const current = activeStep === step.id
          const completed = index < activeIndex
          return (
            <li key={step.id} className="border-l first:border-l-0">
              <Link
                href={step.href}
                prefetch={false}
                onClick={() => beginNavigation(step.href)}
                onMouseEnter={() => prefetch(step.href)}
                onFocus={() => prefetch(step.href)}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 px-1.5 py-2 text-center transition-colors hover:bg-accent/45 md:flex-row md:justify-start md:gap-3 md:px-4 md:py-3 md:text-left ${
                  current ? 'bg-primary/[0.08]' : ''
                }`}
                aria-current={current ? 'step' : undefined}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                    completed
                      ? 'border-primary bg-primary text-primary-foreground'
                      : current
                        ? 'border-primary text-primary'
                        : 'border-border bg-background text-muted-foreground'
                  }`}
                >
                  {pendingHref === step.href ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : completed ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">{step.label}</span>
                  <span className="mt-0.5 hidden text-xs leading-4 text-muted-foreground lg:block">{step.body}</span>
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
