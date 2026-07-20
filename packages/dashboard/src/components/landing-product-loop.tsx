'use client'

import * as React from 'react'
import {
  ArrowUpRight,
  BarChart3,
  Bug,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Lightbulb,
  MessageSquare,
  PackageCheck,
  Pause,
  Play,
  Rocket,
  Sparkles,
  Star,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type DemoView = 'feedback' | 'updates'
type Category = 'bug' | 'idea' | 'praise' | 'question'

const categoryOptions: { value: Category; label: string; Icon: typeof Bug }[] = [
  { value: 'bug', label: 'Bug', Icon: Bug },
  { value: 'idea', label: 'Idea', Icon: Lightbulb },
  { value: 'praise', label: 'Praise', Icon: Star },
  { value: 'question', label: 'Question', Icon: CircleHelp },
]

const scenes = [
  {
    name: 'Orbit',
    product: 'Deployments',
    mark: 'O',
    accent: '#a78bfa',
    accentInk: '#171221',
    nav: ['Deployments', 'Services', 'Logs'],
    eyebrow: 'Production overview',
    title: 'Ship status',
    metrics: [['Healthy', '12'], ['Building', '3'], ['Failed', '1']],
    message: 'Build logs stop updating after the deploy reaches 80%.',
    updateTitle: 'Live build logs are here',
    updateBody: 'Watch every deployment step in real time, with clearer errors when a build needs attention.',
    Icon: Rocket,
  },
  {
    name: 'Ledgerly',
    product: 'Cash flow',
    mark: 'L',
    accent: '#7dd3fc',
    accentInk: '#08202c',
    nav: ['Cash flow', 'Invoices', 'Clients'],
    eyebrow: 'Finance workspace',
    title: 'Cash position',
    metrics: [['Balance', '$184k'], ['Runway', '18 mo'], ['Overdue', '$8.2k']],
    message: 'Let me compare cash flow with the same period last quarter.',
    updateTitle: 'Quarter comparisons are live',
    updateBody: 'Compare any date range with the previous quarter and export the view for your finance review.',
    Icon: BarChart3,
  },
  {
    name: 'Parcel',
    product: 'Orders',
    mark: 'P',
    accent: '#fdba74',
    accentInk: '#2b1705',
    nav: ['Orders', 'Inventory', 'Customers'],
    eyebrow: 'Store operations',
    title: 'Today’s orders',
    metrics: [['Orders', '248'], ['Packed', '186'], ['Delayed', '4']],
    message: 'Bulk printing skips labels for international orders.',
    updateTitle: 'Bulk labels now catch every order',
    updateBody: 'International labels are included automatically, with a warning before anything is skipped.',
    Icon: PackageCheck,
  },
] as const

function ProductCanvas({ sceneIndex }: { sceneIndex: number }) {
  const scene = scenes[sceneIndex]
  const SceneIcon = scene.Icon

  return (
    <div className="absolute inset-0 grid grid-cols-[52px_minmax(0,1fr)] sm:grid-cols-[138px_minmax(0,1fr)]">
      <aside className="border-r border-white/[0.08] bg-black/20 px-2 py-4 sm:px-3" aria-label={`${scene.name} example navigation`}>
        <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-md bg-white/[0.07] text-zinc-300 sm:mx-1">
          <SceneIcon className="h-3.5 w-3.5" />
        </div>
        <div className="mt-6 space-y-1.5">
          {scene.nav.map((item, index) => (
            <div key={item} className={cn('flex h-8 items-center gap-2 rounded-md px-2 text-[11px]', index === 0 ? 'bg-white/[0.08] text-zinc-100' : 'text-zinc-500')}>
              <span className="h-3 w-3 rounded-[3px] border border-current opacity-60" />
              <span className="hidden sm:inline">{item}</span>
            </div>
          ))}
        </div>
      </aside>

      <div className="min-w-0 overflow-hidden bg-[linear-gradient(145deg,#18181b,#111114)] p-4 sm:p-6">
        <div className="flex items-end justify-between border-b border-white/[0.08] pb-5">
          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.13em] text-zinc-500">{scene.eyebrow}</p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-zinc-100">{scene.title}</p>
          </div>
          <span className="hidden text-[10px] text-zinc-500 sm:inline">Live workspace</span>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {scene.metrics.map(([label, value]) => (
            <div key={label} className="border-t border-white/[0.09] pt-3">
              <p className="text-[9px] text-zinc-500 sm:text-[10px]">{label}</p>
              <p className="mt-1 text-sm font-medium text-zinc-300 sm:text-base">{value}</p>
            </div>
          ))}
        </div>

        {sceneIndex === 0 && (
          <div className="mt-7 space-y-2" aria-hidden="true">
            {[['api-gateway', 'Ready', 84], ['web-client', 'Building', 62], ['worker', 'Ready', 94]].map(([name, state, progress]) => (
              <div key={String(name)} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-md border border-white/[0.07] bg-white/[0.025] px-3 py-2">
                <span className="text-[10px] text-zinc-400">{name}</span>
                <span className="text-[9px] text-zinc-500">{state}</span>
                <span className="col-span-2 h-1 overflow-hidden rounded-full bg-white/[0.06]"><span className="block h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: scene.accent }} /></span>
              </div>
            ))}
          </div>
        )}

        {sceneIndex === 1 && (
          <div className="relative mt-8 h-28 border-b border-l border-white/[0.09]" aria-hidden="true">
            <svg viewBox="0 0 400 112" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
              <path d="M0 91 C45 75, 60 82, 96 68 S153 59, 182 64 S238 37, 271 44 S327 23, 400 14" fill="none" stroke={scene.accent} strokeWidth="2" />
              <path d="M0 91 C45 75, 60 82, 96 68 S153 59, 182 64 S238 37, 271 44 S327 23, 400 14 L400 112 L0 112 Z" fill={scene.accent} opacity="0.08" />
            </svg>
          </div>
        )}

        {sceneIndex === 2 && (
          <div className="mt-7 space-y-2" aria-hidden="true">
            {[['#PR-1048', 'Mira Stone', '$148.00'], ['#PR-1047', 'Jon Bell', '$86.40'], ['#PR-1046', 'Acme Studio', '$312.00']].map(([order, customer, total]) => (
              <div key={order} className="grid grid-cols-[70px_1fr_auto] items-center border-b border-white/[0.07] py-2 text-[10px]">
                <span className="text-zinc-300">{order}</span><span className="text-zinc-500">{customer}</span><span className="text-zinc-400">{total}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function LandingProductLoop() {
  const [view, setView] = React.useState<DemoView>('feedback')
  const [sceneIndex, setSceneIndex] = React.useState(0)
  const [category, setCategory] = React.useState<Category>('bug')
  const [rating, setRating] = React.useState(4)
  const [screenshotReady, setScreenshotReady] = React.useState(false)
  const [panelOpen, setPanelOpen] = React.useState(true)
  const [sent, setSent] = React.useState(false)
  const [paused, setPaused] = React.useState(false)
  const [hovered, setHovered] = React.useState(false)
  const [reduceMotion, setReduceMotion] = React.useState(false)
  const scene = scenes[sceneIndex]

  React.useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduceMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  React.useEffect(() => {
    if (paused || hovered || reduceMotion) return
    const timer = window.setInterval(() => {
      setSceneIndex((current) => (current + 1) % scenes.length)
      setSent(false)
      setScreenshotReady(false)
      setPanelOpen(true)
    }, 6400)
    return () => window.clearInterval(timer)
  }, [hovered, paused, reduceMotion])

  const chooseScene = (index: number) => {
    setSceneIndex(index)
    setPanelOpen(true)
    setSent(false)
    setScreenshotReady(false)
    setPaused(true)
  }

  const changeView = (next: DemoView) => {
    setView(next)
    setPanelOpen(true)
    setSent(false)
    setScreenshotReady(false)
    setPaused(true)
  }

  const stepScene = (direction: -1 | 1) => {
    setSceneIndex((current) => (current + direction + scenes.length) % scenes.length)
    setPanelOpen(true)
    setSent(false)
    setScreenshotReady(false)
    setPaused(true)
  }

  return (
    <div
      className="landing-product-loop"
      aria-label="Interactive preview of feedbacks.dev inside three example customer products"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHovered(false)
      }}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-black" style={{ backgroundColor: scene.accent, color: scene.accentInk }}>{scene.mark}</span>
          <span className="truncate text-xs font-semibold text-zinc-100">{scene.name}</span>
          <span className="hidden text-[11px] text-zinc-500 sm:inline">/ {scene.product}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-zinc-400">
          <span className="hidden sm:inline">Example customer product</span>
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            className="inline-flex h-7 items-center gap-1.5 rounded-md border border-white/10 px-2 text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-white"
            aria-label={paused ? 'Resume product examples' : 'Pause product examples'}
          >
            {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            <span className="hidden sm:inline">{paused ? 'Resume' : 'Auto'}</span>
          </button>
        </div>
      </div>

      <div className="relative min-h-[455px] overflow-hidden sm:min-h-[470px]">
        <ProductCanvas sceneIndex={sceneIndex} />

        {panelOpen && <button type="button" className="absolute inset-0 z-10 cursor-default bg-black/55 backdrop-blur-[1.5px] transition-all" onClick={() => setPanelOpen(false)} aria-label="Close the example overlay" />}

        <div className="absolute bottom-4 left-3 z-20 sm:bottom-5 sm:left-5">
          <div className="inline-flex rounded-lg border border-white/10 bg-zinc-950/95 p-1 shadow-2xl shadow-black/40">
            <button type="button" onClick={() => changeView('feedback')} aria-pressed={view === 'feedback'} className={cn('inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium transition-all', view === 'feedback' ? 'text-zinc-950' : 'text-zinc-400 hover:text-zinc-100')} style={view === 'feedback' ? { backgroundColor: scene.accent, color: scene.accentInk } : undefined}>
              <MessageSquare className="h-3.5 w-3.5" /> Feedback
            </button>
            <button type="button" onClick={() => changeView('updates')} aria-pressed={view === 'updates'} className={cn('inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium transition-all', view === 'updates' ? 'text-zinc-950' : 'text-zinc-400 hover:text-zinc-100')} style={view === 'updates' ? { backgroundColor: scene.accent, color: scene.accentInk } : undefined}>
              <Sparkles className="h-3.5 w-3.5" /> Product updates
            </button>
          </div>
        </div>

        {!panelOpen && (
          <button type="button" onClick={() => setPanelOpen(true)} className="absolute bottom-[4.6rem] right-4 z-20 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold shadow-2xl transition-transform hover:-translate-y-0.5 sm:bottom-5 sm:right-5" style={{ backgroundColor: scene.accent, color: scene.accentInk }}>
            {view === 'feedback' ? <MessageSquare className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            {view === 'feedback' ? 'Send feedback' : 'What’s new'}
          </button>
        )}

        {panelOpen && (
          <div className="absolute right-3 top-4 z-20 w-[min(330px,calc(100%-24px))] animate-fade-in overflow-hidden rounded-[14px] border border-white/15 bg-[#fbfbf9] text-[#20211d] shadow-[0_28px_80px_rgb(0_0_0/0.48)] sm:right-5 sm:top-5">
            {view === 'feedback' ? (
              sent ? (
                <div className="flex min-h-[360px] flex-col items-center justify-center px-7 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: scene.accent, color: scene.accentInk }}><Check className="h-5 w-5" /></span>
                  <p className="mt-4 text-base font-bold">Feedback sent</p>
                  <p className="mt-2 text-xs leading-5 text-zinc-500">The {scene.name} team receives the message with page, browser, rating, and screenshot context.</p>
                  <button type="button" onClick={() => setSent(false)} className="mt-5 rounded-md bg-zinc-900 px-3 py-2 text-xs font-semibold text-white">Send another</button>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between px-5 pb-0 pt-5">
                    <div><p className="text-sm font-bold">Send feedback</p><p className="mt-1 text-[11px] leading-4 text-zinc-500">Help {scene.name} improve by sharing your thoughts.</p></div>
                    <button type="button" onClick={() => setPanelOpen(false)} className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700" aria-label="Close feedback form"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="space-y-3.5 p-5">
                    <div>
                      <p className="mb-1.5 text-[11px] font-semibold">Category</p>
                      <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="Feedback category">
                        {categoryOptions.map(({ value, label, Icon }) => (
                          <button key={value} type="button" role="radio" aria-checked={category === value} aria-label={label} onClick={() => { setCategory(value); setPaused(true) }} className={cn('flex min-w-0 flex-col items-center gap-1 rounded-md border px-1 py-2 text-[9px] font-medium transition-all', category === value ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-400 hover:text-zinc-800')}>
                            <Icon className="h-3.5 w-3.5" /><span className="truncate">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-semibold">Your feedback *</span>
                      <span className="block min-h-[58px] rounded-md border border-zinc-300 bg-white px-3 py-2 text-[11px] leading-4 text-zinc-700 shadow-inner shadow-zinc-950/[0.025]">{scene.message}</span>
                      <span className="mt-1 block text-right text-[9px] text-zinc-400">{scene.message.length} / 2,000</span>
                    </label>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold">Rating</p>
                        <div className="mt-1 flex" role="radiogroup" aria-label="Rating">
                          {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" role="radio" aria-checked={rating === value} aria-label={`${value} stars`} onClick={() => { setRating(value); setPaused(true) }} className="p-0.5 text-amber-400"><Star className={cn('h-3.5 w-3.5', value <= rating && 'fill-current')} /></button>)}
                        </div>
                      </div>
                      <button type="button" onClick={() => { setScreenshotReady((value) => !value); setPaused(true) }} className={cn('rounded-md border bg-white px-2.5 py-2 text-[10px] font-medium transition-colors', screenshotReady ? 'border-emerald-300 text-emerald-700' : 'border-zinc-200 text-zinc-600 hover:border-zinc-400')}>{screenshotReady ? '✓ Screenshot attached' : '📸 Capture screenshot'}</button>
                    </div>
                    <div className="flex items-center justify-between border-t border-zinc-200 pt-3">
                      <span className="text-[9px] text-zinc-400">Page + browser included</span>
                      <button type="button" onClick={() => { setSent(true); setPaused(true) }} className="rounded-md px-3 py-2 text-[10px] font-bold transition-transform hover:-translate-y-0.5" style={{ backgroundColor: scene.accent, color: scene.accentInk }}>Send feedback</button>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div>
                <div className="relative overflow-hidden p-5" style={{ backgroundColor: scene.accent, color: scene.accentInk }}>
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="text-[9px] font-black uppercase tracking-[0.14em]">New in {scene.name}</p><p className="mt-3 max-w-[250px] text-lg font-bold leading-tight">{scene.updateTitle}</p></div>
                    <button type="button" onClick={() => setPanelOpen(false)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-black/10 transition-colors hover:bg-black/20" aria-label="Close product update"><X className="h-4 w-4" /></button>
                  </div>
                  <span className="absolute -bottom-12 -right-8 h-32 w-32 rounded-full border-[24px] border-black/10" />
                </div>
                <div className="p-5">
                  <p className="text-xs leading-5 text-zinc-600">{scene.updateBody}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-zinc-200 pt-4">
                    <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500"><Check className="h-3 w-3" /> Shown inside the product</span>
                    <button type="button" onClick={() => setPanelOpen(false)} className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-900">Explore it <ArrowUpRight className="h-3 w-3" /></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid border-t border-white/10 sm:grid-cols-[1fr_auto]">
        <div className="grid grid-cols-3">
          {scenes.map((item, index) => (
            <button key={item.name} type="button" onClick={() => chooseScene(index)} aria-pressed={sceneIndex === index} className={cn('relative px-3 py-3 text-left transition-colors sm:px-4', index > 0 && 'border-l border-white/10', sceneIndex === index ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]')}>
              <span className="block text-[10px] font-semibold text-zinc-200">{item.name}</span>
              <span className="mt-0.5 hidden text-[9px] text-zinc-500 sm:block">{item.product}</span>
              {sceneIndex === index && <span key={`${sceneIndex}-${hovered}-${paused}`} className={cn('absolute bottom-0 left-0 h-0.5 w-full', !paused && !reduceMotion && 'landing-carousel-progress')} style={{ backgroundColor: item.accent }} />}
            </button>
          ))}
        </div>
        <div className="hidden items-center gap-1 border-l border-white/10 px-2 sm:flex">
          <button type="button" onClick={() => stepScene(-1)} className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-white" aria-label="Previous example"><ChevronLeft className="h-4 w-4" /></button>
          <button type="button" onClick={() => stepScene(1)} className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-white" aria-label="Next example"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  )
}
