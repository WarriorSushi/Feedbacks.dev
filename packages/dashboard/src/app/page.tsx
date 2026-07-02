import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BrandWordmark } from '@/components/brand-wordmark'
import { PLAN_MATRIX, generateInstallSnippets } from '@feedbacks/shared'
import { CodeSnippet } from '@/components/code-snippet'
import { publicEnv } from '@/lib/public-env'
import { createServerSupabase } from '@/lib/supabase-server'
import {
  ArrowRight,
  Check,
  Github,
  Zap,
  Bot,
  MessageSquare,
  Shield,
  Sparkles,
  Code2,
  LayoutDashboard,
  Webhook,
  Terminal,
  Globe,
  SlidersHorizontal,
  PanelTop,
} from 'lucide-react'
import { ScrollHeader, WidgetDemo } from './widget-demo-client'
import { AuthenticatedRedirect } from './authenticated-redirect'

// ─── Code snippets ────────────────────────────────────────────────────────────

const appOrigin = publicEnv.NEXT_PUBLIC_APP_ORIGIN
const authHref = `${appOrigin}/auth`
const dashboardHref = `${appOrigin}/dashboard`

const installSnippet = generateInstallSnippets({
  projectKey: 'your-project-key',
  appOrigin,
}).find((snippet) => snippet.label === 'Website')?.code || ''

const freePlan = PLAN_MATRIX.free
const proPlan = PLAN_MATRIX.pro

function LandingHeroSystem() {
  return (
    <div className="overflow-hidden rounded-[15px] border border-border/70 bg-card shadow-2xl shadow-primary/10">
      <Image
        src="/hero_banner_image.png"
        alt="feedbacks.dev feedback routing overview"
        width={1080}
        height={1080}
        priority
        className="h-auto w-full rounded-[15px] object-cover"
      />
    </div>
  )
}

// ─── Page (Server Component) ──────────────────────────────────────────────────

export default async function LandingPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AuthenticatedRedirect appOrigin={appOrigin} />
      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <ScrollHeader>
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="font-bold transition-opacity active:opacity-70">
            <BrandWordmark className="text-lg" priority />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/boards" prefetch={false} className="hidden sm:block">
              <Button variant="ghost" size="sm">
                Boards
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                Features
              </Button>
            </Link>
            <Link href="#pricing">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                Pricing
              </Button>
            </Link>
            <a
              href="https://github.com/WarriorSushi/feedbacks.dev-2026"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:flex"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
            <div className="mx-2 hidden h-4 w-px bg-border sm:block" />
            {isLoggedIn ? (
              <Link href={dashboardHref}>
                <Button size="sm" className="font-semibold">
                  Go to Dashboard
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href={authHref} className="hidden sm:block">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link href={authHref}>
                  <Button size="sm" className="font-semibold">
                    Start free
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </ScrollHeader>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,hsl(var(--primary)/0.14),transparent_32%),linear-gradient(180deg,hsl(var(--primary)/0.055),transparent_42%)]" />
        <div
          className="absolute inset-0 opacity-[0.045] dark:opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
            backgroundSize: '42px 42px',
          }}
        />

        <div className="relative mx-auto max-w-6xl px-6 pb-10 pt-8 md:pb-14 md:pt-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(460px,1.1fr)] lg:items-center">
            <div className="min-w-0">
              <div className="mb-5 flex flex-nowrap items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <Badge variant="secondary" className="shrink-0 gap-1 border-primary/20 bg-primary/[0.09] px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                  <Sparkles className="h-2.5 w-2.5" />
                  Install-first feedback stack
                </Badge>
                <Badge variant="outline" className="shrink-0 gap-1 bg-card/70 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  <Bot className="h-2.5 w-2.5" />
                  Agent-ready setup path
                </Badge>
              </div>

              <h1 className="max-w-3xl text-3xl font-black leading-[1.04] tracking-tighter sm:text-4xl lg:text-[2.8rem]">
                <span className="text-[#88C916]">Collecting user feedbacks & more</span>
                <span>, just became ridiculously simple</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
                Copy, paste, and start collecting from your userbase. Route every useful signal
                anywhere you work.
              </p>

              <div className="mt-7 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                <Link href={isLoggedIn ? dashboardHref : authHref} className="min-w-0">
                  <Button size="lg" className="group h-11 w-full gap-1.5 px-3 text-[13px] font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/25 sm:h-12 sm:w-auto sm:px-7 sm:text-sm">
                    <span className="truncate">{isLoggedIn ? 'Go to Dashboard' : 'Start collecting'}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 sm:h-4 sm:w-4" />
                  </Button>
                </Link>
                <Link href="#install" className="min-w-0">
                  <Button variant="outline" size="lg" className="h-11 w-full gap-1.5 bg-card/70 px-3 text-[13px] font-semibold sm:h-12 sm:w-auto sm:px-7 sm:text-sm">
                    See the snippet
                  </Button>
                </Link>
              </div>

              <div className="mt-5 flex flex-nowrap gap-1.5 overflow-x-auto pb-1 text-xs text-muted-foreground [scrollbar-width:none] sm:text-[13px] [&::-webkit-scrollbar]:hidden">
                {['No credit card', 'Website snippet first', 'Agent handoff ready'].map((item) => (
                  <span key={item} className="shrink-0 rounded-full border bg-card/70 px-2.5 py-0.5">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 rounded-[2rem] bg-primary/14 blur-3xl" />
              <LandingHeroSystem />
            </div>
          </div>
        </div>
      </section>

      {/* ── Install strip ────────────────────────────────────────────────────── */}
      <section id="install" className="border-b bg-zinc-950 px-6 py-16 dark:bg-zinc-900/80">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15">
              <Terminal className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                Quick start
              </p>
              <h2 className="text-lg font-bold tracking-tight text-zinc-50">
                Copy the Website snippet into your app.
              </h2>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0 space-y-3">
              <CodeSnippet
                className="border-zinc-800 bg-zinc-900/90 text-zinc-50"
                tabs={[{ label: 'HTML', code: installSnippet, language: 'html' }]}
                wrap
                maxHeightClassName="max-h-56"
              />
              <p className="text-sm text-zinc-500">
                Website is the recommended default. React and Vue examples stay available after the
                first install works.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
              <p className="text-sm font-semibold text-zinc-50">First-run loop</p>
              <div className="mt-4 space-y-3 text-sm text-zinc-400">
                {[
                  'Create a project',
                  'Paste this snippet where global scripts load',
                  'Send one test report and confirm it lands in the inbox',
                ].map((step, index) => (
                  <div key={step} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Widget Preview ───────────────────────────────────────────────────── */}
      <section id="features" className="border-b py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              The widget
            </p>
            <h2 className="text-3xl font-black tracking-tighter md:text-5xl">
              A feedback form that fits your product.
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Start with a floating button. Switch to modal, inline, or custom trigger when your
              app needs it.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { Icon: SlidersHorizontal, title: 'Custom fields', body: 'Ask for rating, email, type, or screenshot.' },
                { Icon: PanelTop, title: 'Multiple placements', body: 'Floating button, inline form, or your own trigger.' },
                { Icon: Shield, title: 'Privacy first', body: 'No analytics pixels. User email stays optional.' },
                { Icon: Zap, title: 'Lightweight', body: 'Small script, fast load, no iframe maze.' },
              ].map(({ Icon, title, body }) => (
                <div key={title} className="rounded-xl border bg-card/55 p-4">
                  <Icon className="mb-3 h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative min-h-[430px] overflow-hidden rounded-3xl border bg-[radial-gradient(circle_at_25%_20%,hsl(var(--primary)/0.18),transparent_34%),hsl(var(--card))] p-8">
            <Image
              src="/new_logo_feedbacks.dev.svg"
              alt=""
              width={500}
              height={500}
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-20 h-72 w-72 select-none opacity-[0.055] dark:opacity-[0.085] sm:h-96 sm:w-96"
            />
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
                backgroundSize: '36px 36px',
              }}
            />
            <div className="relative mx-auto flex min-h-[360px] max-w-sm items-center justify-center">
              <WidgetDemo />
            </div>
          </div>
        </div>
      </section>

      {/* ── Workflow ─────────────────────────────────────────────────────────── */}
      <section className="border-b bg-muted/15 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 max-w-2xl">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              The workflow
            </p>
            <h2 className="text-3xl font-black tracking-tighter md:text-5xl">
              Capture once. Decide faster.
            </h2>
            <p className="mt-4 text-muted-foreground">
              feedbacks.dev stays small at install, then gives you the surfaces you need when
              feedback starts turning into work.
            </p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-3">
            {[
              {
                Icon: LayoutDashboard,
                title: 'Triage in one inbox',
                body: 'Every item includes message, URL, browser, rating, and status.',
              },
              {
                Icon: MessageSquare,
                title: 'Publish what matters',
                body: 'Turn repeated requests into public boards when the signal is worth sharing.',
              },
              {
                Icon: Webhook,
                title: 'Route into your stack',
                body: 'Send high-priority feedback to webhooks, GitHub, or agent workflows.',
              },
            ].map(({ Icon, title, body }) => (
              <div key={title} className="bg-card p-6 md:p-8">
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold tracking-tight">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Strip ──────────────────────────────────────────────────────── */}
      <section className="border-b py-10">
        <div className="mx-auto grid max-w-6xl gap-3 px-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { Icon: Code2, label: 'Plain HTML first' },
            { Icon: Bot, label: 'Agent prompt included' },
            { Icon: Globe, label: 'Source available' },
            { Icon: Shield, label: 'No user tracking' },
          ].map(({ Icon, label }) => (
            <div key={label} className="flex items-center gap-3 rounded-xl border bg-card/55 px-4 py-3 text-sm font-semibold">
              <Icon className="h-4 w-4 text-primary" />
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────────── */}
      <section id="pricing" className="border-b py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Pricing
            </p>
            <h2 className="mb-3 text-4xl font-black tracking-tighter md:text-5xl">
              Simple. Honest. No traps.
            </h2>
            <p className="mx-auto max-w-md text-muted-foreground">
              Start free, upgrade when you need more. Two tiers, webhook-backed billing truth, and no usage-based surprises.
            </p>
          </div>

          <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
            <div className="rounded-2xl border bg-card p-8 transition-all hover:shadow-lg">
              <p className="mb-1 text-sm font-medium text-muted-foreground">Free</p>
              <p className="mb-1 text-5xl font-black tracking-tighter">
                ${freePlan.monthlyPrice}
              </p>
              <p className="mb-6 text-sm text-muted-foreground">Free forever. No credit card.</p>
              <ul className="mb-8 space-y-3">
                {[
                  `${freePlan.projectLimit} projects`,
                  `${freePlan.feedbackMonthlyLimit} feedback / month`,
                  'Dashboard + widget install',
                  'Optional public board',
                  `${freePlan.historyDays}-day history`,
                  'Community support',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 flex-shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href={isLoggedIn ? dashboardHref : authHref}>
                <Button variant="outline" className="w-full font-semibold">
                  {isLoggedIn ? 'Go to Dashboard' : 'Get started'}
                </Button>
              </Link>
            </div>

            <div className="relative rounded-2xl border-2 border-primary bg-card p-8 shadow-xl shadow-primary/10 transition-all hover:shadow-2xl hover:shadow-primary/15">
              <Badge className="absolute -top-3 left-6 bg-primary px-3.5 py-1 text-xs font-bold shadow-lg shadow-primary/30">
                Pro
              </Badge>
              <p className="mb-1 text-sm font-medium text-muted-foreground">Pro</p>
              <p className="mb-1 text-5xl font-black tracking-tighter">
                ${proPlan.monthlyPrice}
                <span className="text-lg font-normal text-muted-foreground">/mo</span>
              </p>
              <p className="mb-6 text-sm text-muted-foreground">Everything, unlimited.</p>
              <ul className="mb-8 space-y-3">
                {[
                  'Unlimited projects',
                  'Unlimited feedback',
                  'Webhook integrations',
                  'MCP server + AI agent API',
                  'Custom widget branding',
                  'Unlimited history',
                  'Priority support',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 flex-shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href={isLoggedIn ? dashboardHref : authHref}>
                <Button className="w-full font-semibold shadow-lg shadow-primary/20">
                  {isLoggedIn ? 'Go to Dashboard' : 'Start free trial'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────────── */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-3xl border bg-card px-8 py-20 text-center shadow-2xl shadow-black/[0.05] md:px-16">
            <div className="relative z-10 mb-8 flex justify-center">
              <Image
                src="/new_logo_feedbacks.dev.svg"
                alt=""
                width={100}
                height={100}
                aria-hidden="true"
                className="h-20 w-20 sm:h-[100px] sm:w-[100px]"
              />
            </div>
            {/* Dot grid texture */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
            <div className="relative">
              <h2 className="mb-4 text-4xl font-black tracking-tighter text-foreground md:text-5xl">
                Install the widget.
                <br />
                Verify the first submission.
              </h2>
              <p className="mx-auto mb-8 max-w-md text-muted-foreground">
                Start free, keep the setup path small, and add the public and automation layers
                only after the core loop is working.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href={isLoggedIn ? dashboardHref : authHref}>
                  <Button
                    size="lg"
                    className="h-12 px-8 font-semibold shadow-lg shadow-primary/20"
                  >
                    {isLoggedIn ? 'Go to Dashboard' : 'Start Free'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a
                  href="https://github.com/WarriorSushi/feedbacks.dev-2026"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 gap-2 bg-background/70 font-semibold text-foreground hover:bg-muted"
                  >
                    <Github className="h-4 w-4" />
                    Star on GitHub
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <span className="font-bold">
            <BrandWordmark className="text-sm" markClassName="h-5 w-5" />
          </span>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link href="/boards" prefetch={false} className="transition-colors hover:text-foreground">
              Boards
            </Link>
            <Link href="#pricing" className="transition-colors hover:text-foreground">
              Pricing
            </Link>
            <a
              href="https://github.com/WarriorSushi/feedbacks.dev-2026"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              GitHub
            </a>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs text-muted-foreground">
              Source available &middot; FSL-1.1-MIT
            </p>
            <a
              href="https://github.com/WarriorSushi/feedbacks.dev-2026"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
