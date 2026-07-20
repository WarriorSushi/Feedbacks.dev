'use client'

import * as React from 'react'
import { ArrowUpRight, Bug, Check, ChevronRight, MessageSquare, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

type DemoView = 'feedback' | 'updates'

export function LandingProductLoop() {
  const [view, setView] = React.useState<DemoView>('feedback')

  return (
    <div className="landing-product-loop" aria-label="Interactive preview of feedbacks.dev inside a product">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-300 text-[10px] font-black text-zinc-950">N</span>
          <span className="text-xs font-semibold text-zinc-100">Northstar</span>
          <span className="hidden text-[11px] text-zinc-400 sm:inline">/ Analytics</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-zinc-400">
          <span className="hidden sm:inline">Live product preview</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_0_4px_rgb(110_231_183/0.08)]" />
        </div>
      </div>

      <div className="grid min-h-[410px] grid-cols-[56px_minmax(0,1fr)] sm:grid-cols-[150px_minmax(0,1fr)]">
        <aside className="border-r border-white/10 px-2 py-4 sm:px-3" aria-label="Example product navigation">
          <div className="mx-auto h-7 w-7 rounded-md bg-white/[0.07] sm:mx-1" />
          <div className="mt-6 space-y-1.5">
            {['Overview', 'Reports', 'Customers'].map((item, index) => (
              <div key={item} className={cn('flex h-8 items-center gap-2 rounded-md px-2 text-[11px]', index === 0 ? 'bg-white/[0.07] text-zinc-200' : 'text-zinc-400')}>
                <span className="h-3 w-3 rounded-sm border border-current opacity-60" />
                <span className="hidden sm:inline">{item}</span>
              </div>
            ))}
          </div>
        </aside>

        <div className="relative min-w-0 overflow-hidden bg-[linear-gradient(180deg,rgb(24_24_27),rgb(19_19_22))] p-4 sm:p-6">
          <div className="flex items-end justify-between border-b border-white/[0.07] pb-5">
            <div>
              <p className="text-[10px] text-zinc-400">PRODUCT HEALTH</p>
              <p className="mt-1 text-lg font-semibold tracking-tight text-zinc-100">Weekly overview</p>
            </div>
            <span className="text-[10px] text-zinc-400">Jul 14 – Jul 20</span>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {['Active users', 'Activation', 'Retention'].map((label, index) => (
              <div key={label} className="border-t border-white/10 pt-3">
                <p className="text-[9px] text-zinc-400 sm:text-[10px]">{label}</p>
                <p className="mt-1 text-sm font-medium text-zinc-300 sm:text-base">{['8,412', '64.8%', '72.1%'][index]}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex h-24 items-end gap-1.5 border-b border-white/[0.08] pb-px" aria-hidden="true">
            {[32, 45, 38, 63, 52, 76, 68, 88, 72, 94, 82, 100].map((height, index) => (
              <span key={index} className="flex-1 rounded-t-[2px] bg-emerald-300/[0.16]" style={{ height: `${height}%` }} />
            ))}
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex flex-col-reverse items-stretch gap-3 sm:bottom-6 sm:left-6 sm:right-6 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div className="inline-flex self-start rounded-lg border border-white/10 bg-zinc-950/90 p-1 shadow-2xl shadow-black/35">
              <button
                type="button"
                onClick={() => setView('feedback')}
                aria-pressed={view === 'feedback'}
                className={cn('inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium transition-colors', view === 'feedback' ? 'bg-emerald-300 text-zinc-950' : 'text-zinc-400 hover:text-zinc-100')}
              >
                <MessageSquare className="h-3.5 w-3.5" /> Feedback
              </button>
              <button
                type="button"
                onClick={() => setView('updates')}
                aria-pressed={view === 'updates'}
                className={cn('inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium transition-colors', view === 'updates' ? 'bg-emerald-300 text-zinc-950' : 'text-zinc-400 hover:text-zinc-100')}
              >
                <Sparkles className="h-3.5 w-3.5" /> What&apos;s new
              </button>
            </div>

            <div className="w-full shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/45 sm:w-[280px]">
              {view === 'feedback' ? (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
                    <div><p className="text-xs font-semibold text-zinc-100">Send feedback</p><p className="mt-0.5 text-[10px] text-zinc-400">We include technical context automatically.</p></div>
                    <span className="text-[10px] text-zinc-400">ESC</span>
                  </div>
                  <div className="p-4">
                    <div className="flex gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-rose-400/10 px-2 py-1 text-[10px] text-rose-300"><Bug className="h-3 w-3" /> Bug</span>
                      <span className="rounded-md bg-white/[0.05] px-2 py-1 text-[10px] text-zinc-400">Idea</span>
                    </div>
                    <div className="mt-3 min-h-14 rounded-md border border-white/10 bg-zinc-950/60 p-2.5 text-[11px] leading-4 text-zinc-300">Export gets stuck at 80% on large reports.</div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[9px] text-zinc-400">URL · browser · screenshot</span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-300 px-2.5 py-1.5 text-[10px] font-semibold text-zinc-950">Send <ChevronRight className="h-3 w-3" /></span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <div className="relative h-24 overflow-hidden bg-emerald-300 p-4 text-zinc-950">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em]">New this week</p>
                    <p className="mt-2 text-base font-semibold leading-tight">Exports are now 3× faster</p>
                    <span className="absolute -bottom-8 -right-5 h-24 w-24 rounded-full border-[18px] border-zinc-950/10" />
                  </div>
                  <div className="p-4">
                    <p className="text-[11px] leading-5 text-zinc-400">Large reports now process in the background, with live progress and a download notification.</p>
                    <div className="mt-3 flex items-center justify-between border-t border-white/[0.08] pt-3">
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300"><Check className="h-3 w-3" /> Seen by your users</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-300">Read update <ArrowUpRight className="h-3 w-3" /></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid border-t border-white/10 sm:grid-cols-2">
        <button type="button" onClick={() => setView('feedback')} className={cn('group flex items-center gap-3 px-4 py-3 text-left transition-colors sm:px-5', view === 'feedback' ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]')}>
          <span className={cn('h-1.5 w-1.5 rounded-full', view === 'feedback' ? 'bg-emerald-300' : 'bg-zinc-700')} />
          <span><span className="block text-[11px] font-medium text-zinc-200">Collect product feedback</span><span className="mt-0.5 block text-[10px] text-zinc-400">Users send signal to your team</span></span>
        </button>
        <button type="button" onClick={() => setView('updates')} className={cn('group flex items-center gap-3 border-t border-white/10 px-4 py-3 text-left transition-colors sm:border-l sm:border-t-0 sm:px-5', view === 'updates' ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]')}>
          <span className={cn('h-1.5 w-1.5 rounded-full', view === 'updates' ? 'bg-emerald-300' : 'bg-zinc-700')} />
          <span><span className="block text-[11px] font-medium text-zinc-200">Show product updates</span><span className="mt-0.5 block text-[10px] text-zinc-400">Your team closes the loop with users</span></span>
        </button>
      </div>
    </div>
  )
}
