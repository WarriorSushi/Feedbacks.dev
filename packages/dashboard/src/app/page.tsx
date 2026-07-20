import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BrandWordmark } from '@/components/brand-wordmark'
import { PLAN_MATRIX, generateInstallSnippets } from '@feedbacks/shared'
import { CodeSnippet } from '@/components/code-snippet'
import { publicEnv } from '@/lib/public-env'
import {
  ArrowRight,
  Bot,
  Bug,
  Check,
  CheckCircle2,
  Code2,
  Github,
  Inbox,
  Lightbulb,
  Megaphone,
  MessageSquare,
  MousePointer2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { ScrollHeader, WidgetDemo } from './widget-demo-client'
import { AuthenticatedRedirect } from './authenticated-redirect'

const appOrigin = publicEnv.NEXT_PUBLIC_APP_ORIGIN
const authHref = `${appOrigin}/auth`
const dashboardHref = `${appOrigin}/dashboard`

const installSnippet = generateInstallSnippets({
  projectKey: 'your-project-key',
  appOrigin,
}).find((snippet) => snippet.label === 'Website')?.code || ''

const freePlan = PLAN_MATRIX.free
const proPlan = PLAN_MATRIX.pro

const setupSteps = [
  { number: '01', title: 'Create a project', body: 'Choose Feedback form, Release notes, or both.' },
  { number: '02', title: 'Install one embed', body: 'Paste one stable snippet into your app shell.' },
  { number: '03', title: 'Verify and manage', body: 'Send a test, then change both products remotely.' },
]

function ProductSystemPreview() {
  return (
    <div className="relative mx-auto max-w-[620px]" aria-label="feedbacks.dev product preview">
      <div className="absolute -inset-8 -z-10 bg-[radial-gradient(circle,oklch(var(--primary)/0.15),transparent_64%)] blur-2xl" />
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-[var(--shadow-float)]">
        <div className="flex h-11 items-center gap-2 border-b bg-muted/35 px-4">
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
          <span className="ml-2 text-[11px] font-medium text-muted-foreground">Acme product workspace</span>
        </div>
        <div className="grid min-h-[330px] grid-cols-[122px_1fr] sm:grid-cols-[166px_1fr]">
          <div className="border-r bg-muted/20 p-3">
            <p className="px-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Products</p>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 rounded-md bg-primary/10 px-2 py-2 text-[11px] font-semibold text-primary sm:text-xs">
                <MessageSquare className="h-3.5 w-3.5" /> Feedback form
              </div>
              <div className="flex items-center gap-2 rounded-md px-2 py-2 text-[11px] text-muted-foreground sm:text-xs">
                <Megaphone className="h-3.5 w-3.5" /> Release notes
              </div>
            </div>
            <p className="mt-5 px-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Delivery</p>
            <div className="mt-2 flex items-center gap-2 rounded-md px-2 py-2 text-[11px] text-muted-foreground sm:text-xs">
              <Code2 className="h-3.5 w-3.5" /> One embed
            </div>
          </div>
          <div className="min-w-0 p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4 border-b pb-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Feedback form</p>
                <p className="mt-1 text-base font-semibold">Collect useful context</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1 text-[10px] font-medium text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Live
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border bg-background p-3">
                <Bug className="h-4 w-4 text-rose-500" />
                <p className="mt-5 text-xs font-semibold">Export stalls on large files</p>
                <p className="mt-1 text-[10px] leading-4 text-muted-foreground">/reports/export · Chrome · screenshot</p>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <p className="mt-5 text-xs font-semibold">Add saved dashboard views</p>
                <p className="mt-1 text-[10px] leading-4 text-muted-foreground">/dashboard · rating 5/5</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/[0.055] p-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
              <p className="text-[11px] leading-4 text-muted-foreground"><span className="font-semibold text-foreground">Connected.</span> Saved form and release-note changes are now delivered remotely.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-7 -right-2 hidden items-center gap-2 rounded-lg border bg-card px-3 py-2 text-xs font-medium shadow-lg sm:flex">
        <Inbox className="h-4 w-4 text-primary" /> New feedback received
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AuthenticatedRedirect appOrigin={appOrigin} />
      <ScrollHeader>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6">
          <Link href="/" className="font-semibold transition-opacity hover:opacity-80">
            <BrandWordmark className="text-lg" priority />
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            <Link href="#products"><Button variant="ghost" size="sm">Products</Button></Link>
            <Link href="#setup"><Button variant="ghost" size="sm">How it works</Button></Link>
            <Link href="#pricing"><Button variant="ghost" size="sm">Pricing</Button></Link>
            <Link href="/docs" prefetch={false}><Button variant="ghost" size="sm">Docs</Button></Link>
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link href={authHref} className="hidden sm:block"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link href={authHref}>
              <Button size="sm" className="gap-1.5">Start free <ArrowRight className="h-3.5 w-3.5" /></Button>
            </Link>
          </div>
        </div>
      </ScrollHeader>

      <main>
        <section className="relative overflow-hidden border-b">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_12%,oklch(var(--primary)/0.1),transparent_34%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-14 px-5 pb-20 pt-16 sm:px-6 sm:pt-24 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:pb-28">
            <div>
              <div className="inline-flex items-center gap-2 border-l-2 border-primary pl-3 text-xs font-semibold text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Built for product teams that ship
              </div>
              <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl lg:text-[3.75rem]">
                Hear users clearly.<br />Show them what shipped.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                Add an in-product feedback form and a clear “What’s new” feed with one lightweight embed. Install once, verify it works, then manage everything remotely.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={authHref}>
                  <Button size="lg" className="h-12 w-full gap-2 px-6 sm:w-auto">Create a free project <ArrowRight className="h-4 w-4" /></Button>
                </Link>
                <Link href="#setup"><Button variant="outline" size="lg" className="h-12 w-full bg-background/70 px-6 sm:w-auto">See the 3-step setup</Button></Link>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                {['No credit card', 'Browser-safe project key', 'No snippet replacement'].map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" />{item}</span>
                ))}
              </div>
            </div>
            <ProductSystemPreview />
          </div>
        </section>

        <section id="products" className="border-b py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Two products, clearly separated</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Feedback is the input.<br />Release notes are the response.</h2>
                <p className="mt-5 max-w-md leading-7 text-muted-foreground">No vague “updates” label. Your team collects signals in the Feedback form, then tells users what changed through in-product Release notes.</p>
              </div>
              <div className="border-y">
                <div className="grid gap-5 border-b py-7 sm:grid-cols-[48px_1fr_auto] sm:items-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><MessageSquare className="h-5 w-5" /></span>
                  <div><h3 className="text-lg font-semibold">Feedback form</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">Collect bugs, ideas, questions, ratings, screenshots, URL, and browser context inside your product.</p></div>
                  <span className="text-xs font-medium text-muted-foreground">Users → your team</span>
                </div>
                <div className="grid gap-5 py-7 sm:grid-cols-[48px_1fr_auto] sm:items-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400"><Megaphone className="h-5 w-5" /></span>
                  <div><h3 className="text-lg font-semibold">Release notes</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">Publish “What’s new” announcements inside your product. This is not a log of feedbacks.dev website changes.</p></div>
                  <span className="text-xs font-medium text-muted-foreground">Your team → users</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="setup" className="border-b bg-muted/20 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-6">
            <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">One-time setup</p>
                <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">One embed. No configuration-code treadmill.</h2>
                <p className="mt-5 max-w-xl leading-7 text-muted-foreground">Paste the generated Website snippet once. Colors, copy, fields, placement, feedback availability, and release notes are fetched from your saved project settings.</p>
                <div className="mt-8 border-y">
                  {setupSteps.map((step) => (
                    <div key={step.number} className="grid grid-cols-[38px_1fr] gap-3 border-b py-4 last:border-b-0">
                      <span className="font-mono text-xs text-primary">{step.number}</span>
                      <div><p className="text-sm font-semibold">{step.title}</p><p className="mt-1 text-sm text-muted-foreground">{step.body}</p></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="min-w-0 rounded-xl border border-zinc-800 bg-zinc-950 p-3 shadow-[var(--shadow-float)]">
                <div className="flex items-center justify-between px-2 pb-3 pt-1">
                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-400"><Code2 className="h-3.5 w-3.5" /> Website snippet</div>
                  <span className="text-[10px] font-medium text-zinc-400">Install once</span>
                </div>
                <CodeSnippet className="border-zinc-800 bg-zinc-900 text-zinc-100" tabs={[{ label: 'HTML', code: installSnippet, language: 'html' }]} wrap maxHeightClassName="max-h-56" />
                <div className="grid gap-2 p-2 pt-4 sm:grid-cols-3">
                  {['Copy', 'Verify', 'Manage remotely'].map((label, index) => (
                    <div key={label} className="flex items-center gap-2 text-xs text-zinc-400"><span className="flex h-5 w-5 items-center justify-center rounded bg-primary/15 font-mono text-[10px] text-primary">{index + 1}</span>{label}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b py-20 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="relative flex min-h-[440px] items-center justify-center overflow-hidden rounded-xl border bg-muted/25 p-8">
              <div className="absolute inset-0 bg-grid-pattern opacity-35" />
              <div className="relative"><WidgetDemo /></div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Useful signal, less interrogation</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">The form feels native. The context arrives automatically.</h2>
              <p className="mt-5 leading-7 text-muted-foreground">Choose the fields you need and keep the form short. Every submission can arrive with the page URL, browser context, rating, and screenshot, ready to triage.</p>
              <div className="mt-8 space-y-4">
                {[
                  [MousePointer2, 'Remote presentation', 'Change the trigger, placement, labels, fields, and color without replacing the embed.'],
                  [Inbox, 'Focused triage', 'Search, filter, tag, and route feedback from one project-aware inbox.'],
                  [Bot, 'Agent-ready handoff', 'Give your coding agent a scoped setup packet instead of copying secrets into chat.'],
                  [ShieldCheck, 'Trust by default', 'Browser-safe keys in public code. Private and service-role credentials stay server-side.'],
                ].map(([Icon, title, body]) => {
                  const ItemIcon = Icon as typeof Inbox
                  return <div key={String(title)} className="flex gap-4"><ItemIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><div><h3 className="text-sm font-semibold">{String(title)}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{String(body)}</p></div></div>
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="border-b bg-muted/20 py-20 sm:py-28">
          <div className="mx-auto max-w-5xl px-5 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
              <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Straightforward pricing</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Start free. Upgrade for scale, not basics.</h2><p className="mt-5 leading-7 text-muted-foreground">Both products, the install flow, and the dashboard are available from day one.</p></div>
              <div className="overflow-hidden rounded-xl border bg-card shadow-[var(--shadow-card)]">
                <div className="grid md:grid-cols-2">
                  <div className="p-6 sm:p-8">
                    <p className="text-sm font-semibold">Free</p><p className="mt-3 text-4xl font-semibold tracking-tight">${freePlan.monthlyPrice}<span className="text-sm font-normal text-muted-foreground"> / month</span></p>
                    <p className="mt-2 text-sm text-muted-foreground">For one or two products getting started.</p>
                    <ul className="mt-6 space-y-3 text-sm">{[`${freePlan.projectLimit} projects`, `${freePlan.feedbackMonthlyLimit} feedback / month`, 'Feedback form + release notes', 'One shared embed'].map(item => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-primary" />{item}</li>)}</ul>
                    <Link href={authHref} className="mt-7 block"><Button variant="outline" className="w-full">Start free</Button></Link>
                  </div>
                  <div className="border-t border-primary/20 bg-primary/[0.045] p-6 sm:p-8 md:border-l md:border-t-0">
                    <div className="flex items-center justify-between"><p className="text-sm font-semibold">Pro</p><span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Full product</span></div>
                    <p className="mt-3 text-4xl font-semibold tracking-tight">${proPlan.monthlyPrice}<span className="text-sm font-normal text-muted-foreground"> / month</span></p>
                    <p className="mt-2 text-sm text-muted-foreground">For teams routing product signal every week.</p>
                    <ul className="mt-6 space-y-3 text-sm">{[`${proPlan.projectLimit} projects`, 'Unlimited feedback history', 'Integrations, boards, API & MCP', 'Priority support'].map(item => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-primary" />{item}</li>)}</ul>
                    <Link href={authHref} className="mt-7 block"><Button className="w-full">Start with Pro</Button></Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Ready when you are</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">Install once. Start listening today.</h2>
            <p className="mx-auto mt-5 max-w-xl leading-7 text-muted-foreground">Create a project, paste one safe snippet, and verify the first submission. The product guides the rest.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href={authHref}><Button size="lg" className="h-12 w-full gap-2 px-7 sm:w-auto">Create a free project <ArrowRight className="h-4 w-4" /></Button></Link><Link href="/docs" prefetch={false}><Button size="lg" variant="outline" className="h-12 w-full px-7 sm:w-auto">Read the docs</Button></Link></div>
          </div>
        </section>
      </main>

      <footer className="border-t px-5 py-8 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 sm:flex-row">
          <BrandWordmark className="text-sm font-semibold" markClassName="h-5 w-5" />
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground"><Link href="/docs" prefetch={false}>Docs</Link><Link href="/boards" prefetch={false}>Public boards</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div>
          <a href="https://github.com/WarriorSushi/feedbacks.dev-2026" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"><Github className="h-4 w-4" /> Source available</a>
        </div>
      </footer>
      <a href={dashboardHref} className="sr-only">Open dashboard</a>
    </div>
  )
}
