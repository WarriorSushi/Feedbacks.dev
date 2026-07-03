'use client'

import * as React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Loader2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { GUIDED_TUTORIAL_PROGRESS_KEY, getGuidedTutorial, resolveTutorialHref, type GuidedTutorialId, type GuidedTutorialProgress } from '@/lib/guided-tutorials'

interface SpotlightRect {
  top: number
  left: number
  width: number
  height: number
}

const SPOTLIGHT_PADDING = 8
const PANEL_WIDTH = 360
const SIDEBAR_PANEL_LEFT = 320
const PANEL_HEIGHT_ESTIMATE = 260
const MOBILE_BREAKPOINT = 768
const MOBILE_PANEL_MARGIN = 16
const MOBILE_PANEL_TOP = 72
const EMPTY_TUTORIAL_PROGRESS: Record<string, GuidedTutorialProgress> = {}

function readTutorialProgress(id: GuidedTutorialId): GuidedTutorialProgress | null {
  try {
    const stored = JSON.parse(window.localStorage.getItem(GUIDED_TUTORIAL_PROGRESS_KEY) || '{}') as Record<string, GuidedTutorialProgress>
    return stored[id] || null
  } catch {
    return null
  }
}

function writeTutorialProgress(id: GuidedTutorialId, progress: GuidedTutorialProgress) {
  try {
    const stored = JSON.parse(window.localStorage.getItem(GUIDED_TUTORIAL_PROGRESS_KEY) || '{}') as Record<string, GuidedTutorialProgress>
    window.localStorage.setItem(GUIDED_TUTORIAL_PROGRESS_KEY, JSON.stringify({ ...stored, [id]: progress }))
    window.dispatchEvent(new CustomEvent('feedbacks:tutorial-progress'))
  } catch {
    // The tutorial still works when browser storage is unavailable.
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function isCurrentHref(pathname: string, searchParams: URLSearchParams, href: string) {
  const [targetPath, targetSearch = ''] = href.split('?')
  if (pathname !== targetPath) return false

  const expected = new URLSearchParams(targetSearch)
  for (const [key, value] of expected.entries()) {
    if (searchParams.get(key) !== value) return false
  }
  return true
}

function getVisibleTourTarget(selector: string): HTMLElement | null {
  const targets = Array.from(document.querySelectorAll<HTMLElement>(selector))
  return targets.find((target) => {
    const rect = target.getBoundingClientRect()
    const style = window.getComputedStyle(target)
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      rect.width > 0 &&
      rect.height > 0 &&
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.top < window.innerHeight &&
      rect.left < window.innerWidth
    )
  }) || null
}

function getSpotlightRect(selector: string): SpotlightRect | null {
  const target = getVisibleTourTarget(selector)
  if (!target) return null
  const rect = target.getBoundingClientRect()
  const top = Math.max(SPOTLIGHT_PADDING, rect.top - SPOTLIGHT_PADDING)
  const left = Math.max(SPOTLIGHT_PADDING, rect.left - SPOTLIGHT_PADDING)
  const width = Math.min(window.innerWidth - left - SPOTLIGHT_PADDING, rect.width + SPOTLIGHT_PADDING * 2)
  const height = Math.min(window.innerHeight - top - SPOTLIGHT_PADDING, rect.height + SPOTLIGHT_PADDING * 2)

  return { top, left, width, height }
}

export function ProductTour({
  initialOpen,
  defaultProjectId,
  initialTutorialProgress = EMPTY_TUTORIAL_PROGRESS,
}: {
  initialOpen: boolean
  defaultProjectId?: string
  initialTutorialProgress?: Record<string, GuidedTutorialProgress>
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const supabase = React.useMemo(() => createClient(), [])
  const [open, setOpen] = React.useState(false)
  const [stepIndex, setStepIndex] = React.useState(0)
  const [tutorialId, setTutorialId] = React.useState<GuidedTutorialId>('navigation')
  const [spotlight, setSpotlight] = React.useState<SpotlightRect | null>(null)
  const [viewport, setViewport] = React.useState({ width: 1024, height: 768 })
  const [saving, setSaving] = React.useState(false)
  const tutorialSaveQueue = React.useRef(Promise.resolve())

  const tutorial = getGuidedTutorial(tutorialId) || getGuidedTutorial('navigation')!
  const steps = React.useMemo(
    () => tutorial.steps.map((step) => ({ ...step, href: resolveTutorialHref(step.href, defaultProjectId) })),
    [defaultProjectId, tutorial],
  )
  const activeStep = steps[Math.min(stepIndex, steps.length - 1)]

  React.useEffect(() => {
    if (initialOpen && pathname === '/dashboard') setOpen(true)
  }, [initialOpen, pathname])

  React.useEffect(() => {
    const updateViewport = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight })
    }
    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  React.useEffect(() => {
    const requestedTutorial = getGuidedTutorial(searchParams.get('tutorial'))
    if (requestedTutorial) {
      const saved = readTutorialProgress(requestedTutorial.id) || initialTutorialProgress[requestedTutorial.id]
      setTutorialId(requestedTutorial.id)
      setStepIndex(saved?.completedAt ? 0 : Math.min(saved?.stepIndex || 0, requestedTutorial.steps.length - 1))
      setOpen(true)
    } else if (searchParams.get('tour') === '1') {
      setTutorialId('navigation')
      setStepIndex(0)
      setOpen(true)
    }
  }, [initialTutorialProgress, searchParams])

  React.useEffect(() => {
    const startTour = () => {
      setTutorialId('navigation')
      setStepIndex(0)
      setOpen(true)
    }
    window.addEventListener('feedbacks:start-product-tour', startTour)
    return () => window.removeEventListener('feedbacks:start-product-tour', startTour)
  }, [])

  React.useEffect(() => {
    if (!open || isCurrentHref(pathname, searchParams, activeStep.href)) return
    router.push(activeStep.href)
  }, [activeStep.href, open, pathname, router, searchParams])

  React.useEffect(() => {
    if (!open) return
    window.dispatchEvent(new CustomEvent('feedbacks:expand-sidebar'))

    let frame = 0
    const measureSpotlight = () => {
      frame = window.requestAnimationFrame(() => {
        setSpotlight(getSpotlightRect(activeStep.target))
      })
    }
    const focusTarget = () => {
      const target = getVisibleTourTarget(activeStep.target)
      if (target) {
        target.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' })
      }
      measureSpotlight()
    }

    const timer = window.setTimeout(focusTarget, 360)
    window.addEventListener('resize', measureSpotlight)
    window.addEventListener('scroll', measureSpotlight, true)

    return () => {
      window.clearTimeout(timer)
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', measureSpotlight)
      window.removeEventListener('scroll', measureSpotlight, true)
    }
  }, [activeStep.target, open, pathname, searchParams])

  const savePreference = async (key: 'productTourCompletedAt' | 'productTourDismissedAt') => {
    setSaving(true)
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error(userError?.message || 'Sign in again to save tour progress.')
      }

      const { data: existing, error: loadError } = await supabase
        .from('user_settings')
        .select('preferences')
        .eq('user_id', user.id)
        .maybeSingle()

      if (loadError) throw loadError

      const preferences =
        existing?.preferences && typeof existing.preferences === 'object'
          ? (existing.preferences as Record<string, unknown>)
          : {}

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          preferences: {
            ...preferences,
            [key]: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })

      if (error) throw error
    } finally {
      setSaving(false)
    }
  }

  const saveTutorialProgress = React.useCallback((id: GuidedTutorialId, progress: GuidedTutorialProgress) => {
    writeTutorialProgress(id, progress)
    tutorialSaveQueue.current = tutorialSaveQueue.current.then(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: existing } = await supabase
        .from('user_settings')
        .select('preferences')
        .eq('user_id', user.id)
        .maybeSingle()
      const preferences = existing?.preferences && typeof existing.preferences === 'object'
        ? existing.preferences as Record<string, unknown>
        : {}
      const guidedTutorialProgress = preferences.guidedTutorialProgress && typeof preferences.guidedTutorialProgress === 'object'
        ? preferences.guidedTutorialProgress as Record<string, GuidedTutorialProgress>
        : {}
      await supabase.from('user_settings').upsert({
        user_id: user.id,
        preferences: {
          ...preferences,
          guidedTutorialProgress: { ...guidedTutorialProgress, [id]: progress },
        },
        updated_at: new Date().toISOString(),
      })
    }).catch(() => undefined)
  }, [supabase])

  const closeTour = React.useCallback((returnToDashboard = false) => {
    setOpen(false)
    setSpotlight(null)
    if (returnToDashboard) {
      router.replace('/dashboard')
      return
    }
    if (pathname === '/dashboard' && searchParams.get('tour') === '1') {
      router.replace('/dashboard')
    }
    router.refresh()
  }, [pathname, router, searchParams])

  const goToStep = (nextIndex: number) => {
    const safeIndex = clamp(nextIndex, 0, steps.length - 1)
    const nextStep = steps[safeIndex]
    setStepIndex(safeIndex)
    if (tutorialId !== 'navigation') saveTutorialProgress(tutorialId, { stepIndex: safeIndex })
    if (!isCurrentHref(pathname, searchParams, nextStep.href)) {
      router.push(nextStep.href)
    }
  }

  const skipTour = async () => {
    try {
      if (tutorialId === 'navigation') await savePreference('productTourDismissedAt')
      else saveTutorialProgress(tutorialId, { stepIndex, dismissedAt: new Date().toISOString() })
      toast({ title: tutorialId === 'navigation' ? 'Tour hidden for now' : 'Tutorial saved for later' })
      closeTour()
    } catch (error) {
      toast({
        title: 'Could not hide tour',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      })
    }
  }

  const finishTour = async () => {
    try {
      if (tutorialId === 'navigation') {
        await savePreference('productTourCompletedAt')
        toast({ title: 'Product tour complete' })
        closeTour(true)
      } else {
        saveTutorialProgress(tutorialId, { stepIndex: steps.length - 1, completedAt: new Date().toISOString() })
        toast({ title: `${tutorial.title} complete` })
        setOpen(false)
        setSpotlight(null)
        router.replace('/tutorials')
      }
    } catch (error) {
      toast({
        title: 'Could not save tour progress',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (!open) return null

  const panelMaxLeft = Math.max(16, viewport.width - PANEL_WIDTH - 16)
  const isSidebarStep = activeStep.target.includes('nav-')
  const isMobile = viewport.width < MOBILE_BREAKPOINT
  const mobilePanelTop = !spotlight || spotlight.top < viewport.height / 2
    ? Math.max(MOBILE_PANEL_TOP, viewport.height - PANEL_HEIGHT_ESTIMATE - MOBILE_PANEL_MARGIN)
    : MOBILE_PANEL_TOP
  const panelTop = isMobile
    ? mobilePanelTop
    : spotlight
      ? isSidebarStep
        ? clamp(spotlight.top - 18, 24, Math.max(24, viewport.height - PANEL_HEIGHT_ESTIMATE))
        : spotlight.top + spotlight.height + 14 <= viewport.height - 220
          ? spotlight.top + spotlight.height + 14
          : Math.max(16, spotlight.top - 222)
      : viewport.height / 2 - 120
  const panelLeft = isMobile
    ? MOBILE_PANEL_MARGIN
    : spotlight
      ? isSidebarStep
        ? clamp(SIDEBAR_PANEL_LEFT, 16, panelMaxLeft)
        : clamp(spotlight.left, 16, panelMaxLeft)
      : clamp(viewport.width / 2 - PANEL_WIDTH / 2, 16, panelMaxLeft)
  const finalStep = stepIndex === steps.length - 1

  return (
    <div className="fixed inset-0 z-[90] pointer-events-none">
      {spotlight ? (
        <>
          <div className="pointer-events-auto fixed inset-x-0 top-0 bg-black/60" style={{ height: spotlight.top }} />
          <div
            className="pointer-events-auto fixed left-0 bg-black/60"
            style={{ top: spotlight.top, width: spotlight.left, height: spotlight.height }}
          />
          <div
            className="pointer-events-auto fixed right-0 bg-black/60"
            style={{
              top: spotlight.top,
              left: spotlight.left + spotlight.width,
              height: spotlight.height,
            }}
          />
          <div
            className="pointer-events-auto fixed inset-x-0 bottom-0 bg-black/60"
            style={{ top: spotlight.top + spotlight.height }}
          />
          <div
            className="pointer-events-none fixed rounded-xl border-2 border-primary bg-transparent shadow-[0_0_0_4px_hsl(var(--primary)/0.20),0_0_36px_hsl(var(--primary)/0.38)]"
            style={spotlight}
          />
        </>
      ) : (
        <div className="pointer-events-auto fixed inset-0 bg-black/60" />
      )}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-tour-title"
        aria-describedby="product-tour-description"
        className="pointer-events-auto fixed w-[calc(100vw-2rem)] max-w-[360px] rounded-xl border bg-card p-4 shadow-2xl"
        style={{ top: panelTop, left: panelLeft }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              {tutorial.title} · Step {stepIndex + 1} of {steps.length}
            </p>
            <h2 id="product-tour-title" className="mt-2 text-base font-semibold">
              {activeStep.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => void skipTour()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Skip tour"
            disabled={saving}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p id="product-tour-description" className="mt-2 text-sm leading-6 text-muted-foreground">
          {activeStep.body}
        </p>
        {!spotlight && (
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Opening the right section now. If the highlight does not appear, use Next to continue.
          </p>
        )}
        <div className="mt-4 flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => goToStep(stepIndex - 1)}
            disabled={stepIndex === 0 || saving}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8" onClick={() => void skipTour()} disabled={saving}>
              Skip
            </Button>
            <Button
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => {
                if (finalStep) void finishTour()
                else goToStep(stepIndex + 1)
              }}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : finalStep ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <ArrowRight className="h-3.5 w-3.5" />
              )}
              {finalStep ? 'Finish' : 'Next'}
            </Button>
          </div>
        </div>
        <div
          className="mt-3 grid gap-1"
          style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
        >
          {steps.map((step, index) => (
            <span
              key={step.title}
              className={cn(
                'h-1 rounded-full',
                index <= stepIndex ? 'bg-primary' : 'bg-muted',
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
