'use client'

import * as React from 'react'
import { Bug, Camera, Check, CircleHelp, Lightbulb, MessageSquare, Star, X } from 'lucide-react'
import type { CategoryType } from './landing-types'
import { cn } from '@/lib/utils'

const demos: {
  type: CategoryType | 'question'
  label: string
  Icon: typeof Bug
  text: string
}[] = [
  { type: 'bug', label: 'Bug', Icon: Bug, text: 'CSV export stalls when the report contains more than 1,000 rows.' },
  { type: 'idea', label: 'Idea', Icon: Lightbulb, text: 'Let me save this filter as a view for the rest of my team.' },
  { type: 'praise', label: 'Praise', Icon: Star, text: 'The new search is noticeably faster. Great improvement!' },
  { type: 'question', label: 'Question', Icon: CircleHelp, text: 'Can I invite a client to view this report without editing it?' },
]

export function WidgetDemo() {
  const [active, setActive] = React.useState(0)
  const [open, setOpen] = React.useState(true)
  const [submitted, setSubmitted] = React.useState(false)
  const [screenshotReady, setScreenshotReady] = React.useState(false)

  const selectDemo = (index: number) => {
    setActive(index)
    setSubmitted(false)
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-3 text-sm font-semibold text-background shadow-2xl transition-transform hover:-translate-y-0.5">
        <MessageSquare className="h-4 w-4" /> Send feedback
      </button>
    )
  }

  return (
    <div className="w-[min(360px,calc(100vw-64px))] overflow-hidden rounded-[14px] border bg-background shadow-2xl shadow-black/15">
      {submitted ? (
        <div className="flex min-h-[390px] flex-col items-center justify-center px-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check className="h-5 w-5" /></span>
          <h3 className="mt-4 text-lg font-bold">Thank you!</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Your feedback was sent with the useful context attached.</p>
          <button type="button" onClick={() => setSubmitted(false)} className="mt-5 rounded-md bg-foreground px-4 py-2 text-xs font-semibold text-background">Send another</button>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between px-5 pb-0 pt-5">
            <div><h3 className="text-base font-bold">Send feedback</h3><p className="mt-1 text-xs text-muted-foreground">Help us improve by sharing your thoughts.</p></div>
            <button type="button" onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Close feedback form"><X className="h-4 w-4" /></button>
          </div>

          <div className="space-y-4 p-5">
            <div>
              <p className="mb-2 text-xs font-semibold">Category</p>
              <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="Feedback category">
                {demos.map((demo, index) => {
                  const DemoIcon = demo.Icon
                  return <button key={demo.type} type="button" role="radio" aria-checked={index === active} onClick={() => selectDemo(index)} className={cn('flex min-w-0 flex-col items-center gap-1 rounded-md border px-1 py-2 text-[10px] font-medium transition-all', index === active ? 'border-primary bg-primary/[0.08] text-primary' : 'text-muted-foreground hover:border-foreground/30 hover:text-foreground')}><DemoIcon className="h-3.5 w-3.5" /><span className="truncate">{demo.label}</span></button>
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold">Your feedback *</p>
              <div key={active} className="min-h-[72px] animate-fade-in rounded-md border bg-background px-3 py-2.5 text-sm leading-5 text-foreground/75 shadow-inner shadow-black/[0.025]">{demos[active].text}</div>
              <p className="mt-1 text-right text-[10px] text-muted-foreground">{demos[active].text.length} / 2,000</p>
            </div>

            <div className="flex items-end justify-between gap-4">
              <div><p className="text-xs font-semibold">Rating</p><div className="mt-1 flex text-amber-400">{[1, 2, 3, 4, 5].map((value) => <Star key={value} className={cn('h-4 w-4', value < 5 && 'fill-current')} />)}</div></div>
              <button type="button" onClick={() => setScreenshotReady((value) => !value)} className={cn('inline-flex items-center gap-1.5 rounded-md border px-2.5 py-2 text-[10px] font-medium transition-colors', screenshotReady ? 'border-emerald-300 text-emerald-600' : 'text-muted-foreground hover:text-foreground')}><Camera className="h-3.5 w-3.5" /> {screenshotReady ? 'Screenshot ready' : 'Capture screenshot'}</button>
            </div>

            <div className="flex items-center justify-between border-t pt-4"><span className="text-[10px] text-muted-foreground">Page + browser included</span><button type="button" onClick={() => setSubmitted(true)} className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">Send feedback</button></div>
          </div>
          <p className="border-t py-2 text-center text-[9px] text-muted-foreground">Powered by feedbacks.dev</p>
        </>
      )}
    </div>
  )
}
