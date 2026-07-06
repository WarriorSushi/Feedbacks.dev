import { createServerSupabase } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { getCurrentUserBillingSummary, getHistoryCutoff } from '@/lib/billing'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CollapsibleDashboardSection } from '@/components/collapsible-dashboard-section'
import { DashboardRefresher } from '@/components/dashboard-refresher'
import { isFeedbackUnread } from '@/lib/feedback-read-state'
import { cn, formatRelativeTime, truncate, getStatusColor } from '@/lib/utils'
import type { Feedback } from '@/lib/types'
import { CURRENT_PROJECT_COOKIE, getSelectedProject } from '@/lib/project-selection'
import { loadDashboardStats } from '@/lib/dashboard-stats'
import Link from 'next/link'
import {
  Star,
  Bell,
  ArrowRight,
  Plus,
  Inbox,
  TrendingUp,
  Bot,
  Code2,
  ShieldCheck,
  BarChart3,
  Bug,
  Lightbulb,
  Smile,
  CircleHelp,
  MessageSquare,
} from 'lucide-react'

export const metadata = { title: 'Dashboard' }

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

const typeIcons = {
  bug: Bug,
  idea: Lightbulb,
  praise: Smile,
  question: CircleHelp,
  other: MessageSquare,
}

function TypeIcon({ type, className }: { type?: string | null; className?: string }) {
  const Icon = typeIcons[(type || 'other') as keyof typeof typeIcons] || MessageSquare
  return <Icon className={cn('h-4 w-4', className)} />
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; scope?: string }>
}) {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const [billingSummary, cookieStore, requestedParams, { data: ownedProjects }] = await Promise.all([
    getCurrentUserBillingSummary(),
    cookies(),
    searchParams,
    supabase
      .from('projects')
      .select('id, name, settings')
      .eq('owner_user_id', user!.id)
      .order('created_at', { ascending: false }),
  ])
  const historyCutoff = billingSummary ? getHistoryCutoff(billingSummary) : null
  const selectedProject = getSelectedProject(
    ownedProjects || [],
    requestedParams.project || cookieStore.get(CURRENT_PROJECT_COOKIE)?.value,
  )
  const showingAllProjects = requestedParams.scope === 'all'
  const scopedProjectId = showingAllProjects ? undefined : selectedProject?.id
  const feedbackHref = showingAllProjects
    ? '/feedback?projectId=all'
    : scopedProjectId
      ? `/feedback?projectId=${scopedProjectId}`
      : '/feedback'

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0] + 'T00:00:00'

  let totalQuery = historyCutoff
    ? supabase.from('feedback').select('*', { count: 'exact', head: true }).eq('is_archived', false).gte('created_at', historyCutoff)
    : supabase.from('feedback').select('*', { count: 'exact', head: true }).eq('is_archived', false)
  let unreadQuery = historyCutoff
    ? supabase.from('feedback').select('*', { count: 'exact', head: true }).is('read_at', null).eq('is_archived', false).gte('created_at', historyCutoff)
    : supabase.from('feedback').select('*', { count: 'exact', head: true }).is('read_at', null).eq('is_archived', false)
  let ratingQuery = historyCutoff
    ? supabase.from('feedback').select('rating').not('rating', 'is', null).eq('is_archived', false).gte('created_at', historyCutoff)
    : supabase.from('feedback').select('rating').not('rating', 'is', null).eq('is_archived', false)
  let agentQuery = historyCutoff
    ? supabase.from('feedback').select('*', { count: 'exact', head: true }).not('agent_name', 'is', null).eq('is_archived', false).gte('created_at', historyCutoff)
    : supabase.from('feedback').select('*', { count: 'exact', head: true }).not('agent_name', 'is', null).eq('is_archived', false)
  let recentQuery = historyCutoff
    ? supabase.from('feedback').select('*, projects(id, name)').eq('is_archived', false).gte('created_at', historyCutoff).order('created_at', { ascending: false }).limit(8)
    : supabase.from('feedback').select('*, projects(id, name)').eq('is_archived', false).order('created_at', { ascending: false }).limit(8)
  let typeQuery = historyCutoff
    ? supabase.from('feedback').select('type').eq('is_archived', false).gte('created_at', historyCutoff)
    : supabase.from('feedback').select('type').eq('is_archived', false)
  let sparkQuery = supabase
    .from('feedback')
    .select('created_at')
    .gte('created_at', historyCutoff && historyCutoff > sevenDaysAgoStr ? historyCutoff : sevenDaysAgoStr)
    .eq('is_archived', false)

  if (scopedProjectId) {
    totalQuery = totalQuery.eq('project_id', scopedProjectId)
    unreadQuery = unreadQuery.eq('project_id', scopedProjectId)
    ratingQuery = ratingQuery.eq('project_id', scopedProjectId)
    agentQuery = agentQuery.eq('project_id', scopedProjectId)
    recentQuery = recentQuery.eq('project_id', scopedProjectId)
    typeQuery = typeQuery.eq('project_id', scopedProjectId)
    sparkQuery = sparkQuery.eq('project_id', scopedProjectId)
  }

  const days7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

  const [aggregateStats, { data: recentFeedback }] = await Promise.all([
    loadDashboardStats({
      userId: user!.id,
      projectId: scopedProjectId,
      historyCutoff,
      trendStart: sevenDaysAgoStr,
    }),
    recentQuery,
  ])

  let total = aggregateStats?.total || 0
  let unread = aggregateStats?.unread || 0
  let agents = aggregateStats?.agentCount || 0
  let avgRating = aggregateStats?.averageRating ?? null
  let ratingCount = aggregateStats?.ratingCount || 0
  const typeCounts = { bug: 0, idea: 0, praise: 0, question: 0, other: 0 }
  let sparkCounts = days7.map((day) => aggregateStats?.dailyCounts[day] || 0)

  if (aggregateStats) {
    Object.entries(aggregateStats.typeCounts).forEach(([type, count]) => {
      if (type in typeCounts) typeCounts[type as keyof typeof typeCounts] = count
      else typeCounts.other += count
    })
  } else {
    // Compatibility fallback while migration 025 is being applied to an older environment.
    const [
      { count: totalCount },
      { count: unreadCount },
      { data: ratingData },
      { count: agentCount },
      { data: typeDist },
      { data: sparkData },
    ] = await Promise.all([totalQuery, unreadQuery, ratingQuery, agentQuery, typeQuery, sparkQuery])
    total = totalCount || 0
    unread = unreadCount || 0
    agents = agentCount || 0
    ratingCount = ratingData?.length || 0
    avgRating = ratingCount
      ? ratingData!.reduce((sum, feedback) => sum + (feedback.rating || 0), 0) / ratingCount
      : null
    typeDist?.forEach((feedback) => {
      const type = feedback.type as string
      if (type in typeCounts) typeCounts[type as keyof typeof typeCounts]++
      else typeCounts.other++
    })
    sparkCounts = days7.map(
      (day) => sparkData?.filter((feedback) => feedback.created_at.startsWith(day)).length || 0,
    )
  }

  const sparkMax = Math.max(...sparkCounts, 1)
  const projects = ownedProjects?.length || 0
  const primaryProject = selectedProject
  const displayName =
    user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'there'

  const feedbackLink = (params?: Record<string, string>) => {
    const query = new URLSearchParams()
    if (showingAllProjects) query.set('projectId', 'all')
    else if (scopedProjectId) query.set('projectId', scopedProjectId)
    Object.entries(params || {}).forEach(([key, value]) => query.set(key, value))
    const suffix = query.toString()
    return suffix ? `/feedback?${suffix}` : '/feedback'
  }

  const statCards = [
    {
      id: 'total',
      label: 'Feedback',
      value: total,
      urgent: false,
      sub: `${sparkCounts[sparkCounts.length - 1]} today`,
      href: feedbackHref,
    },
    {
      id: 'unread',
      label: 'Unread',
      value: unread,
      urgent: unread > 0,
      sub: unread > 0 ? 'needs review' : 'all caught up',
      href: feedbackLink({ read: 'unread' }),
    },
    {
      id: 'rating',
      label: 'Avg Rating',
      value: avgRating ? avgRating.toFixed(1) : '—',
      urgent: false,
      sub: ratingCount ? `${ratingCount} rated` : 'no ratings yet',
      href: feedbackHref,
    },
    ...(showingAllProjects ? [{
        id: 'projects',
        label: 'Projects',
        value: projects,
        urgent: false,
        sub: 'active',
        href: '/projects',
      }] : []),
    {
      id: 'agents',
      label: 'Via Agent',
      value: agents,
      urgent: false,
      sub: agents > 0 ? 'AI submitted' : 'none yet',
      href: feedbackLink({ agent: '1' }),
    },
  ]

  const typeColorMap: Record<string, string> = {
    bug: 'bg-red-500',
    idea: 'bg-indigo-500',
    praise: 'bg-emerald-500',
    question: 'bg-sky-500',
    other: 'bg-zinc-400',
  }

  if (projects === 0) {
    return (
      <div className="animate-fade-in mx-auto max-w-5xl space-y-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="overflow-hidden border-primary/25 bg-card">
            <CardContent className="p-6 sm:p-8">
              <Badge className="bg-primary/90 text-primary-foreground">First run</Badge>
              <h1 className="mt-5 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
                Good {getGreeting()}, {displayName}. Create one project, copy the install, send one test.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Start with the basic setup path. Advanced settings, public boards, API access, and integrations can wait until feedback reaches the inbox.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/projects/new">
                  <Button size="lg" className="w-full gap-2 sm:w-auto">
                    <Plus className="h-4 w-4" />
                    Create your first project
                  </Button>
                </Link>
                <Link href="/projects">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    View setup steps
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">What happens next</CardTitle>
              <CardDescription>
                The dashboard keeps the first setup run in order.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                ['1', 'Create project', 'Only the project name is required.'],
                ['2', 'Customize form', 'Pick floating button, custom trigger, or inline form.'],
                ['3', 'Install and test', 'Copy the matching code, then check the inbox.'],
              ].map(([step, title, body]) => (
                <div key={step} className="flex gap-3 rounded-lg border bg-muted/20 p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {step}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{body}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="divide-y p-0">
            {[
              { Icon: Code2, title: 'Code matches your saved form', body: 'The install screen uses the style you saved in Customize.' },
              { Icon: ShieldCheck, title: 'Safe by default', body: 'The first snippet uses the browser-safe project key, not private server credentials.' },
              { Icon: Inbox, title: 'One test proves the loop', body: 'Send a short test message, then use the inbox for triage and routing.' },
            ].map(({ Icon, title, body }) => (
              <div key={title} className="flex gap-3 px-5 py-4">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{title}</p>
                  <p className="mt-0.5 text-sm leading-6 text-muted-foreground">{body}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-5">
      {/* ─── Header ───────────────────────────────────────── */}
      <div className="grid gap-3 border-b pb-4 lg:grid-cols-[minmax(260px,1fr)_auto_minmax(220px,auto)] lg:items-center">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
            Good {getGreeting()},{' '}
            <span className="font-normal text-muted-foreground">{displayName}</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unread > 0 ? (
              <>
                <span className="font-semibold text-foreground">{unread}</span> unread{' '}
                {unread === 1 ? 'item' : 'items'} waiting in your inbox.
              </>
            ) : total > 0 ? (
              'All caught up. Here is your overview.'
            ) : (
              'Customize a project, install the code, then send one test message.'
            )}
          </p>
          {selectedProject && (
            <div className="mt-2 inline-flex items-center rounded-md border bg-card p-0.5 text-[11px]" aria-label="Dashboard project scope">
              <Link
                href="/dashboard"
                data-testid="dashboard-current-project-scope"
                aria-current={!showingAllProjects ? 'page' : undefined}
                className={cn(
                  'rounded px-2 py-1 font-medium transition-colors',
                  !showingAllProjects ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {selectedProject.name}
              </Link>
              <Link
                href="/dashboard?scope=all"
                data-testid="dashboard-all-projects-scope"
                aria-current={showingAllProjects ? 'page' : undefined}
                className={cn(
                  'rounded px-2 py-1 font-medium transition-colors',
                  showingAllProjects ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                All projects
              </Link>
            </div>
          )}
        </div>
        <div data-tour="dashboard-actions" className="flex flex-wrap items-center gap-2 lg:justify-center">
          <Link href="/projects/new">
            <Button size="sm" variant="outline" className="h-8 gap-1.5 px-2.5 text-xs font-medium">
              <Plus className="h-3.5 w-3.5" />
              New Project
            </Button>
          </Link>
          <Link href={feedbackHref}>
            <Button size="sm" className="h-8 gap-1.5 text-xs font-medium">
              <Inbox className="h-3.5 w-3.5" />
              Inbox
              {unread > 0 && (
                <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-white/20 px-1 text-[11px] font-bold">
                  {unread}
                </span>
              )}
            </Button>
          </Link>
        </div>
        {billingSummary && (
          <div className="min-w-0 rounded-md border bg-card px-3 py-2 lg:justify-self-end">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Plan</p>
            <p className="mt-0.5 truncate text-xs font-medium">
              {billingSummary.entitlements.label} · {billingSummary.entitlements.feedbackMonthlyLimit
                ? `${billingSummary.usage.feedbackThisMonth}/${billingSummary.entitlements.feedbackMonthlyLimit} feedback`
                : 'Unlimited feedback'}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {billingSummary.entitlements.historyDays
                ? `Last ${billingSummary.entitlements.historyDays} days visible`
                : 'Full history visible'}
            </p>
          </div>
        )}
      </div>

      {total === 0 && primaryProject ? (
        <div data-tour="dashboard-capabilities" className="flex flex-col gap-4 rounded-lg border border-primary/25 bg-primary/[0.05] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex min-w-0 gap-3">
            <Code2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-sm font-semibold">Send the first test for {primaryProject.name}</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Copy the default install code, send one known test, then confirm it reaches the inbox.
              </p>
            </div>
          </div>
          <Button asChild className="min-h-11 shrink-0 sm:min-h-10">
            <Link href={`/projects/${primaryProject.id}?tab=install`}>
              Continue setup <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : <DashboardRefresher />}

      {/* ─── Onboarding (shown when no projects) ──────────── */}
      {projects === 0 && (
        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.04] via-background to-background">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />
          <CardContent className="relative p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold tracking-tight">Get started in 2 minutes</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Set up your first project and start collecting feedback from your users.
              </p>
            </div>
            <div className="space-y-3">
              {[
                {
                  step: 1,
                  title: 'Create your first project',
                  description: 'Give it a name and optional domain',
                  href: '/projects/new',
                  done: false,
                  cta: 'Create project',
                },
                {
                  step: 2,
                  title: 'Choose the form style',
                  description: 'Save the placement before copying install code',
                  href: null,
                  done: false,
                  cta: null,
                },
                {
                  step: 3,
                  title: 'Install and send one test',
                  description: 'Paste the matching code, then confirm the inbox item',
                  href: null,
                  done: false,
                  cta: null,
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className={cn(
                    'flex items-center gap-4 rounded-xl border p-4 transition-all',
                    item.step === 1
                      ? 'border-primary/30 bg-primary/[0.04] shadow-sm'
                      : 'border-border/60 opacity-60'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                      item.step === 1
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {item.step}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  {item.href && item.cta && (
                    <Link href={item.href}>
                      <Button size="sm" className="h-8 gap-1.5 text-xs font-medium">
                        {item.cta}
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Stat Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(128px,1fr))] gap-2.5">
        {statCards.map((stat) => (
          <Link key={stat.id} href={stat.href} className="block">
            <Card
              className={cn(
                'h-full overflow-hidden transition-colors hover:border-primary/30 hover:bg-accent/20',
                stat.urgent && 'border-amber-300 bg-amber-50/50 dark:border-amber-700/70 dark:bg-amber-950/20'
              )}
            >
              <CardContent className="p-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {stat.label}
                </p>
                <p
                  className={cn(
                    'mt-1 text-2xl font-bold leading-none tabular-nums',
                    stat.urgent && 'text-amber-600 dark:text-amber-400'
                  )}
                >
                  {stat.value}
                </p>
                <p className="mt-1.5 text-[11px] text-muted-foreground">{stat.sub}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* ─── Activity + Sidebar ───────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-[1fr_272px]">
        {/* Mobile quick actions stay readable without horizontal scrolling. */}
        <div className="lg:hidden">
          <CollapsibleDashboardSection
            storageId="quick-actions-mobile"
            title="Quick Actions"
            contentClassName="grid grid-cols-2 gap-2 pb-3 pt-0"
          >
            <Link href={feedbackLink({ read: 'unread' })} className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2.5 text-xs font-medium hover:bg-accent">
              <Bell className="h-3.5 w-3.5 text-muted-foreground" />
              Unread
              {unread > 0 && <Badge variant="secondary" className="ml-auto h-5 text-[10px]">{unread}</Badge>}
            </Link>
            <Link href={feedbackLink({ type: 'bug' })} className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2.5 text-xs font-medium hover:bg-accent">
              <Bug className="h-3.5 w-3.5 text-muted-foreground" /> Bugs
            </Link>
            <Link href={feedbackLink({ type: 'idea' })} className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2.5 text-xs font-medium hover:bg-accent">
              <Lightbulb className="h-3.5 w-3.5 text-muted-foreground" /> Ideas
            </Link>
            <Link href="/projects/new" className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2.5 text-xs font-medium hover:bg-accent">
              <Plus className="h-3.5 w-3.5 text-muted-foreground" /> New project
            </Link>
          </CollapsibleDashboardSection>
        </div>

        {/* Recent Activity Feed */}
        <CollapsibleDashboardSection
          storageId="recent-activity"
          title="Recent Activity"
          contentClassName="p-0"
          action={
            <Link href={feedbackHref}>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-[11px] text-muted-foreground hover:text-foreground"
              >
                View all
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          }
        >
            {!recentFeedback || recentFeedback.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Inbox className="h-10 w-10 text-muted-foreground/40" />
                <p className="mt-4 text-sm font-medium">No feedback yet</p>
                <p className="mt-1.5 max-w-[240px] text-xs leading-relaxed text-muted-foreground">
                  Set up a project and feedback will appear here as it arrives.
                </p>
                <Link href="/projects/new" className="mt-4">
                  <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
                    <Plus className="h-3 w-3" />
                    Create a project
                  </Button>
                </Link>
              </div>
            ) : (
              <div>
                {(recentFeedback as Feedback[]).map((fb) => (
                  <Link
                    key={fb.id}
                    href={`/feedback/${fb.id}`}
                    className={cn(
                      'group flex gap-3 border-b px-4 py-3 transition-colors last:border-b-0 hover:bg-accent/40',
                      isFeedbackUnread(fb) &&
                        'bg-primary/[0.04] ring-1 ring-inset ring-primary/15 hover:bg-primary/[0.06] dark:bg-primary/[0.07]'
                    )}
                  >
                    <TypeIcon type={fb.type} className="mt-0.5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'text-[13px] leading-snug text-foreground/75 transition-colors group-hover:text-foreground',
                          isFeedbackUnread(fb) && 'font-medium text-foreground/90'
                        )}
                      >
                        {truncate(fb.message, 110)}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span
                          className={cn(
                            'text-[11px] capitalize',
                            getStatusColor(fb.status)
                          )}
                        >
                          {fb.status.replace('_', ' ')}
                        </span>
                        {fb.projects && (
                          <>
                            <span className="text-[11px] text-muted-foreground/35">·</span>
                            <span className="text-[11px] text-muted-foreground">
                              {fb.projects.name}
                            </span>
                          </>
                        )}
                        {fb.agent_name && (
                          <>
                            <span className="text-[11px] text-muted-foreground/35">·</span>
                            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Bot className="h-3 w-3" />
                              {fb.agent_name}
                            </span>
                          </>
                        )}
                        <span className="text-[11px] text-muted-foreground/35">·</span>
                        <span className="text-[11px] text-muted-foreground">
                          {formatRelativeTime(fb.created_at)}
                        </span>
                      </div>
                    </div>
                    {fb.rating && (
                      <div className="flex shrink-0 items-center gap-0.5 self-start pt-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'h-2.5 w-2.5',
                              i < fb.rating!
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground/15'
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
        </CollapsibleDashboardSection>

        {/* Sidebar — hidden on mobile, quick actions shown above instead */}
        <div className="hidden flex-col gap-4 lg:flex">
          {/* Type Breakdown */}
          <CollapsibleDashboardSection
            storageId="by-type"
            title="By Type"
            contentClassName="space-y-3 pb-4 pt-0"
          >
              {total === 0 ? (
                <div className="py-6 text-center">
                  <BarChart3 className="mx-auto h-8 w-8 text-muted-foreground/40" />
                  <p className="mt-2 text-xs text-muted-foreground">No data yet</p>
                </div>
              ) : (
                Object.entries(typeCounts)
                  .filter(([, count]) => count > 0)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => {
                    const pct = Math.round((count / (total || 1)) * 100)
                    return (
                      <div key={type}>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-[12px] capitalize">
                            <span
                              className={cn(
                                'h-2 w-2 rounded-full',
                                typeColorMap[type] || 'bg-zinc-400'
                              )}
                            />
                            <TypeIcon type={type} className="h-3.5 w-3.5" /> {type}
                          </span>
                          <span className="text-[11px] tabular-nums text-muted-foreground">
                            {count}{' '}
                            <span className="text-muted-foreground/50">({pct}%)</span>
                          </span>
                        </div>
                        <div className="h-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-700',
                              typeColorMap[type] || 'bg-zinc-400'
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })
              )}
          </CollapsibleDashboardSection>

          {/* Quick Actions */}
          <CollapsibleDashboardSection
            storageId="quick-actions"
            title="Quick Actions"
            contentClassName="space-y-0.5 pb-3 pt-0"
          >
              <Link
                href={feedbackLink({ read: 'unread' })}
                className="flex items-center justify-between rounded-md px-2 py-2 transition-colors hover:bg-accent"
              >
                <span className="flex items-center gap-2 text-[12px]">
                  <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                  Review unread
                </span>
                {unread > 0 && (
                  <Badge variant="secondary" className="h-5 text-[10px]">
                    {unread}
                  </Badge>
                )}
              </Link>
              <Link
                href={feedbackLink({ type: 'bug' })}
                className="flex items-center justify-between rounded-md px-2 py-2 transition-colors hover:bg-accent"
              >
                <span className="flex items-center gap-2 text-[12px]">
                  <Bug className="h-3.5 w-3.5 text-muted-foreground" />
                  Bug reports
                </span>
                {typeCounts.bug > 0 && (
                  <Badge variant="secondary" className="h-5 text-[10px]">
                    {typeCounts.bug}
                  </Badge>
                )}
              </Link>
              <Link
                href={feedbackLink({ type: 'idea' })}
                className="flex items-center justify-between rounded-md px-2 py-2 transition-colors hover:bg-accent"
              >
                <span className="flex items-center gap-2 text-[12px]">
                  <Lightbulb className="h-3.5 w-3.5 text-muted-foreground" />
                  Feature requests
                </span>
                {typeCounts.idea > 0 && (
                  <Badge variant="secondary" className="h-5 text-[10px]">
                    {typeCounts.idea}
                  </Badge>
                )}
              </Link>
              {agents > 0 && (
                <Link
                  href={feedbackLink({ agent: '1' })}
                  className="flex items-center justify-between rounded-md px-2 py-2 transition-colors hover:bg-accent"
                >
                  <span className="flex items-center gap-2 text-[12px]">
                    <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                    Agent submissions
                  </span>
                  <Badge variant="secondary" className="h-5 text-[10px]">
                    {agents}
                  </Badge>
                </Link>
              )}
              <Link
                href="/projects/new"
                className="flex items-center gap-2 rounded-md px-2 py-2 text-[12px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Plus className="h-3.5 w-3.5" />
                New project
              </Link>
          </CollapsibleDashboardSection>
        </div>
      </div>

      {/* ─── 7-Day Trend Chart ────────────────────────────── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4">
          <div>
            <CardTitle className="text-sm font-semibold">Feedback Volume</CardTitle>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Last 7 days</p>
          </div>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {total === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <TrendingUp className="h-9 w-9 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-medium">No data yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Trend will appear once you receive your first feedback.
              </p>
            </div>
          ) : (
            <div className="flex items-end gap-1.5 sm:gap-2" style={{ height: 96 }}>
              {days7.map((day, i) => {
                const count = sparkCounts[i] || 0
                const heightPct = Math.max((count / sparkMax) * 100, 4)
                const isToday = i === days7.length - 1
                return (
                  <div key={day} className="group flex flex-1 flex-col items-center gap-1">
                    <span
                      className={cn(
                        'text-[11px] tabular-nums',
                        count > 0 ? 'text-muted-foreground' : 'text-transparent select-none'
                      )}
                    >
                      {count || '0'}
                    </span>
                    <div
                      className={cn(
                        'w-full rounded-[3px] transition-all duration-300',
                        isToday
                          ? 'bg-primary/70'
                          : 'bg-primary/28 group-hover:bg-primary/50'
                      )}
                      style={{ height: `${heightPct}%` }}
                    />
                    <span
                      className={cn(
                        'text-[11px] font-medium uppercase',
                        isToday ? 'text-primary' : 'text-muted-foreground/55'
                      )}
                    >
                      {new Date(day + 'T12:00:00').toLocaleDateString('en', {
                        weekday: 'short',
                      })}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
