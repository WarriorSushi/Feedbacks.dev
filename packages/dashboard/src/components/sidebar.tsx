'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { BrandWordmark } from '@/components/brand-wordmark'
import {
  LayoutDashboard,
  MessageSquare,
  FolderOpen,
  CreditCard,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  PanelLeftClose,
  PanelLeft,
  Check,
  Globe,
  ExternalLink,
  Plus,
  Loader2,
  Webhook,
  Code2,
  CircleHelp,
  BookOpen,
} from 'lucide-react'
import type { Project } from '@/lib/types'
import { createClient } from '@/lib/supabase-browser'
import { ThemeToggle } from '@/components/theme-toggle'
import type { BillingStatus, PlanTier } from '@feedbacks/shared'
import { CURRENT_PROJECT_COOKIE } from '@/lib/project-selection'

type SidebarProject = Pick<Project, 'id' | 'name'>

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true, tourId: 'nav-dashboard' },
  { href: '/feedback',  label: 'Feedback',  icon: MessageSquare, tourId: 'nav-feedback' },
  { href: '/projects',  label: 'Projects',  icon: FolderOpen, tourId: 'nav-projects' },
  { href: '/integrations', label: 'Integrations', icon: Webhook, tourId: 'nav-integrations' },
  { href: '/dashboard/boards', label: 'Public Boards', icon: Globe, tourId: 'nav-boards' },
  { href: '/api-docs', label: 'API', icon: Code2, tourId: 'nav-api' },
  { href: '/billing',   label: 'Billing',   icon: CreditCard, tourId: 'nav-billing' },
  { href: '/tutorials', label: 'Tutorials', icon: BookOpen, tourId: 'nav-tutorials' },
  { href: '/settings',  label: 'Settings',  icon: Settings, tourId: 'nav-settings' },
]

const projectColors = [
  'bg-indigo-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-pink-500',
  'bg-blue-500',
]

interface SidebarProps {
  user: { email?: string; user_metadata?: { avatar_url?: string; full_name?: string } }
  projects: SidebarProject[]
  currentProjectId?: string
  boardSlugs?: Record<string, string>
  billingAccount?: {
    plan_tier: PlanTier
    billing_status: BillingStatus
  } | null
}

export function Sidebar({ user, projects, currentProjectId, boardSlugs = {}, billingAccount }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const search = searchParams.toString()
  const currentHref = search ? `${pathname}?${search}` : pathname
  const routeProjectId = pathname.match(/^\/projects\/([^/]+)/)?.[1]
  const resolvedCurrentProjectId = currentProjectId || routeProjectId
  const [visibleProjects, setVisibleProjects] = React.useState(projects)
  const [pendingHref, setPendingHref] = React.useState<string | null>(null)
  const [projectOpen, setProjectOpen] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [collapsed, setCollapsed] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const supabase = React.useMemo(() => createClient(), [])

  React.useEffect(() => {
    setVisibleProjects(projects)
  }, [projects])

  React.useEffect(() => {
    const removeDeletedProject = (event: Event) => {
      const projectId = (event as CustomEvent<{ projectId?: string }>).detail?.projectId
      if (!projectId) return
      setVisibleProjects((current) => current.filter((project) => project.id !== projectId))
      setProjectOpen(false)
    }

    window.addEventListener('feedbacks:project-deleted', removeDeletedProject)
    return () => window.removeEventListener('feedbacks:project-deleted', removeDeletedProject)
  }, [])

  const currentProject = visibleProjects.find((p) => p.id === resolvedCurrentProjectId) || visibleProjects[0]
  const showProBrand =
    billingAccount?.plan_tier === 'pro' &&
    (billingAccount.billing_status === 'active' || billingAccount.billing_status === 'trialing')

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const displayName =
    user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProjectOpen(false)
      }
    }
    if (projectOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [projectOpen])

  // Close mobile nav on route change
  React.useEffect(() => {
    setMobileOpen(false)
    setPendingHref(null)
  }, [currentHref])

  React.useEffect(() => {
    const expandForTour = () => {
      setCollapsed(false)
      if (window.matchMedia('(max-width: 767px)').matches) {
        setMobileOpen(true)
      }
    }
    window.addEventListener('feedbacks:expand-sidebar', expandForTour)
    return () => window.removeEventListener('feedbacks:expand-sidebar', expandForTour)
  }, [])

  const beginNavigation = React.useCallback(
    (href: string) => {
      if (href === currentHref) return
      setPendingHref(href)
      router.prefetch(href)
    },
    [currentHref, router],
  )

  const rememberProject = React.useCallback((projectId: string) => {
    document.cookie = `${CURRENT_PROJECT_COOKIE}=${encodeURIComponent(projectId)}; Path=/; Max-Age=31536000; SameSite=Lax`
  }, [])

  React.useEffect(() => {
    if (routeProjectId) rememberProject(routeProjectId)
  }, [rememberProject, routeProjectId])

  const currentProjectColorClass =
    projectColors[visibleProjects.indexOf(currentProject!) % projectColors.length] ?? 'bg-muted-foreground'

  /* ── Shared sidebar content (used in both mobile drawer & desktop aside) ── */
  const sidebarContent = (
    <>
      {/* Logo row */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b px-3">
        <div
          className={cn(
            'overflow-hidden transition-[width,opacity] duration-200',
            collapsed ? 'w-0 opacity-0' : 'w-full opacity-100'
          )}
        >
          <Link
            href="/dashboard"
            prefetch={false}
            onClick={() => beginNavigation('/dashboard')}
            onMouseEnter={() => router.prefetch('/dashboard')}
            onFocus={() => router.prefetch('/dashboard')}
            className="whitespace-nowrap font-semibold transition-opacity active:opacity-70"
            tabIndex={collapsed ? -1 : 0}
          >
            <BrandWordmark
              className="text-[17px]"
              markClassName={cn('h-6 w-6', showProBrand && 'rounded-lg')}
              markSrc={showProBrand ? '/feedbacks.dev_pro_monthly.svg' : undefined}
              intro={!collapsed}
            />
          </Link>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="hidden h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground md:flex"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      {/* Project switcher */}
      {visibleProjects.length > 0 && !collapsed && (
        <div data-tour="project-switcher" className="shrink-0 border-b p-2.5" ref={dropdownRef}>
          <button
            onClick={() => setProjectOpen(!projectOpen)}
            aria-expanded={projectOpen}
            aria-label="Switch project"
            className={cn(
              'group flex min-h-11 w-full items-center justify-between rounded-lg px-2.5 py-2 text-[13px] md:min-h-0',
              'border border-border/60 bg-background/60',
              'transition-all duration-150 hover:border-border hover:bg-accent',
              projectOpen && 'border-primary/30 bg-accent'
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className={cn('h-2 w-2 shrink-0 rounded-full', currentProjectColorClass)} />
              <span className="truncate font-medium">
                {currentProject?.name ?? 'Select project'}
              </span>
            </span>
            {projectOpen ? (
              <ChevronUp className="ml-1.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronDown className="ml-1.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            )}
          </button>

          {/* Dropdown */}
          <div
            className={cn(
              'overflow-hidden transition-[grid-template-rows] duration-200 [transition-timing-function:cubic-bezier(0.25,1,0.5,1)]',
              projectOpen ? 'grid grid-rows-[1fr]' : 'grid grid-rows-[0fr]'
            )}
          >
            <div className="min-h-0">
              <div className="mt-1 overflow-hidden rounded-lg border border-border/80 bg-popover shadow-md shadow-black/5">
                {visibleProjects.map((p, i) => {
                  const isSelected = p.id === resolvedCurrentProjectId
                  return (
                    <Link
                      key={p.id}
                      href={`/projects/${p.id}`}
                      prefetch={false}
                      onClick={() => {
                        rememberProject(p.id)
                        beginNavigation(`/projects/${p.id}`)
                        setProjectOpen(false)
                      }}
                      onMouseEnter={() => router.prefetch(`/projects/${p.id}`)}
                      onFocus={() => router.prefetch(`/projects/${p.id}`)}
                      className={cn(
                        'flex min-h-11 items-center justify-between px-3 py-2 text-[13px] md:min-h-0',
                        'transition-[background-color,color,transform] duration-100 hover:bg-accent active:scale-[0.98] active:bg-accent/80',
                        isSelected && 'bg-accent/60'
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            'h-2 w-2 shrink-0 rounded-full',
                            projectColors[i % projectColors.length]
                          )}
                        />
                        <span className={cn('truncate', isSelected && 'font-medium')}>
                          {p.name}
                        </span>
                      </span>
                      {pendingHref === `/projects/${p.id}` ? (
                        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-primary" />
                      ) : isSelected && (
                        <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {visibleProjects.length === 0 && !collapsed && (
        <div className="shrink-0 border-b p-2.5">
          <Link
            href="/projects/new"
            prefetch={false}
            onClick={() => beginNavigation('/projects/new')}
            onMouseEnter={() => router.prefetch('/projects/new')}
            onFocus={() => router.prefetch('/projects/new')}
            className="flex min-h-11 items-center gap-2 rounded-lg border border-primary/25 bg-primary/[0.06] px-3 py-2 text-[13px] font-medium text-primary transition-[background-color,transform] hover:bg-primary/[0.1] active:scale-[0.98] active:bg-primary/[0.14]"
          >
            {pendingHref === '/projects/new' ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 shrink-0" />
            )}
            Create first project
          </Link>
        </div>
      )}

      {/* Nav — scrolls when it overflows, pushes footer to bottom when it doesn't */}
      <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-2.5">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <React.Fragment key={item.href}>
              <Link
                href={item.href}
                data-tour={item.tourId}
                prefetch={false}
                title={collapsed ? item.label : undefined}
                aria-label={collapsed ? item.label : undefined}
                onClick={() => beginNavigation(item.href)}
                onMouseEnter={() => router.prefetch(item.href)}
                onFocus={() => router.prefetch(item.href)}
                className={cn(
                  'group relative flex min-h-11 items-center gap-3 rounded-lg py-2 text-[13px] font-medium md:min-h-0',
                  'transition-all duration-150 active:scale-[0.98]',
                  collapsed ? 'justify-center px-2' : 'px-3',
                  isActive
                    ? [
                        'bg-primary/8 text-primary',
                        'before:absolute before:inset-y-1 before:left-0 before:w-[3px] before:rounded-r-full',
                        'before:bg-primary before:shadow-[0_0_8px_hsl(var(--primary)/0.5)]',
                      ]
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                {pendingHref === item.href ? (
                  <Loader2 className={cn('h-[17px] w-[17px] shrink-0 animate-spin', isActive && 'text-primary')} />
                ) : (
                  <item.icon
                    className={cn(
                      'h-[17px] w-[17px] shrink-0 transition-transform duration-150',
                      !isActive && 'group-hover:scale-[1.08]',
                      isActive && 'text-primary'
                    )}
                  />
                )}
                {!collapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </Link>
            </React.Fragment>
          )
        })}

        {/* Public Board links — inside the scrollable nav area */}
        {(() => {
          const projectsWithBoards = visibleProjects.filter((p) => boardSlugs[p.id])
          if (projectsWithBoards.length === 0 || collapsed) return null

          if (projectsWithBoards.length === 1) {
            const slug = boardSlugs[projectsWithBoards[0].id]
            return (
              <a
                href={`/p/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-muted-foreground transition-all duration-150 hover:bg-accent hover:text-foreground"
              >
                <Globe className="h-[17px] w-[17px] shrink-0 transition-transform duration-150 group-hover:scale-[1.08]" />
                <span className="truncate">Public Board</span>
                <ExternalLink className="ml-auto h-3 w-3 opacity-0 transition-opacity group-hover:opacity-60" />
              </a>
            )
          }

          return (
            <div className="pt-2">
              <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Public Boards
              </p>
              {projectsWithBoards.map((p) => {
                const slug = boardSlugs[p.id]
                return (
                  <a
                    key={p.id}
                    href={`/p/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-lg px-3 py-1.5 text-[13px] text-muted-foreground transition-all duration-150 hover:bg-accent hover:text-foreground"
                  >
                    <Globe className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{p.name}</span>
                    <ExternalLink className="ml-auto h-3 w-3 opacity-0 transition-opacity group-hover:opacity-60" />
                  </a>
                )
              })}
            </div>
          )
        })()}
      </nav>

      {/* Footer — always visible at bottom */}
      <div className="shrink-0 space-y-1 border-t p-2.5">
        <Link
          href="/dashboard?tour=1"
          prefetch={false}
          title={collapsed ? 'Take product tour' : undefined}
          aria-label={collapsed ? 'Take product tour' : undefined}
          data-tour="take-product-tour"
          onClick={() => {
            if (pathname === '/dashboard') {
              window.dispatchEvent(new CustomEvent('feedbacks:start-product-tour'))
            }
            beginNavigation('/dashboard?tour=1')
          }}
          onMouseEnter={() => router.prefetch('/dashboard?tour=1')}
          onFocus={() => router.prefetch('/dashboard?tour=1')}
          className={cn(
            'group flex min-h-11 items-center gap-2.5 rounded-lg py-2 text-[12px] font-medium text-muted-foreground md:min-h-0',
            'transition-[background-color,color,transform] duration-150 hover:bg-accent hover:text-foreground active:scale-[0.98]',
            collapsed ? 'justify-center px-0' : 'px-2.5',
          )}
        >
          {pendingHref === '/dashboard?tour=1' ? (
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-primary" />
          ) : (
            <CircleHelp className="h-3.5 w-3.5 shrink-0 transition-transform duration-150 group-hover:scale-[1.08]" />
          )}
          {!collapsed && <span className="truncate">Take product tour</span>}
        </Link>

        {/* Theme toggle */}
        <ThemeToggle collapsed={collapsed} />

        {/* User row */}
        <div
          className={cn(
            'flex items-center gap-2.5 rounded-lg px-2.5 py-2',
            collapsed && 'justify-center px-0'
          )}
        >
          <div
            className={cn(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
              'bg-[hsl(var(--primary)/0.12)] text-[12px] font-semibold text-primary',
              'ring-1 ring-[hsl(var(--primary)/0.15)]'
            )}
          >
            {displayName[0].toUpperCase()}
          </div>

          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium leading-tight">{displayName}</p>
                {user.email && (
                  <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive md:h-7 md:w-7"
                onClick={handleSignOut}
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* ── Mobile top bar ──────────────────────────────────────────────── */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-4 md:hidden">
        <Link href="/dashboard" prefetch={false} className="font-semibold transition-opacity active:opacity-70">
          <BrandWordmark
            className="text-[17px]"
            markClassName={cn('h-6 w-6', showProBrand && 'rounded-lg')}
            markSrc={showProBrand ? '/feedbacks.dev_pro_monthly.svg' : undefined}
          />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
        </Button>
      </div>

      {/* ── Mobile overlay ──────────────────────────────────────────────── */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-200 md:hidden',
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setMobileOpen(false)}
      />

      {/* ── Mobile drawer (fixed, slides in) ──────────────────────────── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r bg-card md:hidden',
          'transition-transform duration-300 [transition-timing-function:cubic-bezier(0.25,1,0.5,1)]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {sidebarContent}
      </aside>

      {/* ── Desktop sidebar (static flex child, full height from parent) ─ */}
      <aside
        className={cn(
          'hidden md:flex md:flex-col md:border-r md:bg-card',
          'transition-[width] duration-300 [transition-timing-function:cubic-bezier(0.25,1,0.5,1)]',
          collapsed ? 'md:w-[60px]' : 'md:w-60'
        )}
      >
        {sidebarContent}
      </aside>

    </>
  )
}
