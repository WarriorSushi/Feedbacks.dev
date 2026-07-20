'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Check, Loader2 } from 'lucide-react'

export type SetupStep = 'install' | 'verify' | 'inbox'

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
      label: 'Install once',
      body: 'Add the shared embed.',
      href: `/projects/${projectId}/install`,
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
  ]
  const activeIndex = Math.max(steps.findIndex((step) => step.id === activeStep), 0)
  const nextActionByStep: Record<SetupStep, { title: string; body: string; href: string; label: string }> = {
    install: {
      title: 'Install the embed once',
      body: 'Paste one stable snippet into your app shell. Future form and user-update changes arrive remotely without replacement code.',
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
      title: 'Connected: manage products remotely',
      body: 'The shared embed works. Change the feedback form or publish updates to users without editing your site again.',
      href: `/projects/${projectId}`,
      label: 'Open project home',
    },
  }
  const nextAction = nextActionByStep[activeStep]

  return (
    <nav aria-label="Setup steps" data-tour="setup-progress" className="rounded-xl border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
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

      <ol className="mt-5 grid grid-cols-3 overflow-hidden rounded-lg border border-foreground/10 bg-[oklch(var(--surface-raised))]">
        {steps.map((step, index) => {
          const current = activeStep === step.id
          const completed = index < activeIndex
          return (
            <li key={step.id} className="border-l border-foreground/10 first:border-l-0">
              <Link
                href={step.href}
                prefetch={false}
                onClick={() => beginNavigation(step.href)}
                onMouseEnter={() => prefetch(step.href)}
                onFocus={() => prefetch(step.href)}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 px-1.5 py-2 text-center transition-colors hover:bg-accent/35 md:flex-row md:justify-start md:gap-3 md:px-4 md:py-3 md:text-left ${
                  current ? 'bg-primary/[0.055]' : ''
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
