'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { rememberProjectApiKey } from '@/lib/project-api-keys'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Check, CheckCircle2, Code2, Inbox, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { DEFAULT_PROJECT_ICON, PROJECT_ICONS } from '@/lib/project-icons'

const setupSteps = [
  { Icon: CheckCircle2, title: 'Create this project', body: 'Choose the first product. You can enable the other later.' },
  { Icon: Code2, title: 'Install one shared embed', body: 'Paste the generated Website snippet into your app shell.' },
  { Icon: Inbox, title: 'Verify the connection', body: 'Send one test and confirm it reached the project inbox.' },
]

const productChoices = [
  { value: 'feedback', label: 'Feedback form', body: 'Collect bugs, ideas, questions, ratings, and screenshots.' },
  { value: 'updates', label: 'Updates for users', body: 'Publish in-product “What’s new” announcements.' },
  { value: 'both', label: 'Both products', body: 'Collect user signal and communicate what shipped.' },
] as const

export default function NewProjectPage() {
  const [name, setName] = React.useState('')
  const [domain, setDomain] = React.useState('')
  const [icon, setIcon] = React.useState<string>(DEFAULT_PROJECT_ICON)
  const [goal, setGoal] = React.useState<'updates' | 'feedback' | 'both'>('feedback')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [limitMessage, setLimitMessage] = React.useState('')
  const router = useRouter()

  React.useEffect(() => {
    const requestedGoal = new URLSearchParams(window.location.search).get('goal')
    if (requestedGoal === 'updates' || requestedGoal === 'feedback' || requestedGoal === 'both') {
      setGoal(requestedGoal)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError('')
    setLimitMessage('')

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          domain: domain.trim() || null,
          icon,
        }),
      })

      const payload = await response.json()
      if (!response.ok) {
        if (payload.code === 'project_limit_reached') {
          setLimitMessage(payload.error || 'Free plan includes 2 projects. Upgrade to Pro to create more.')
        }
        setError(payload.error || 'Failed to create project')
        return
      }

      if (payload.api_key) {
        rememberProjectApiKey(payload.id, payload.api_key)
      }
      const modulesResponse = await fetch(`/api/projects/${payload.id}/modules`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback: goal !== 'updates',
          updates: goal !== 'feedback',
        }),
      })
      if (!modulesResponse.ok) {
        const modulePayload = await modulesResponse.json().catch(() => null)
        throw new Error(modulePayload?.error || 'Project created, but the product choice could not be saved.')
      }
      router.push(goal === 'feedback'
        ? `/projects/${payload.id}/install?created=1`
        : goal === 'updates'
          ? `/projects/${payload.id}/release-notes`
          : `/projects/${payload.id}`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-7 animate-fade-in">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to projects
      </Link>

      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">New project</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em]">What are you adding to your product?</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">A project is one app or website. Start with the product you need now, then install the shared embed once.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <Card data-tour="project-create-form" className="border-0 bg-transparent shadow-none">
          <CardHeader className="border-b border-foreground/10 px-0 pt-0">
            <CardTitle className="text-lg">Project details</CardTitle>
            <CardDescription>
              One name is enough. The next screen gives you a working install snippet immediately.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project name</Label>
              <Input
                id="name"
                placeholder="Acme Web App"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                maxLength={80}
              />
              <p className="text-xs text-muted-foreground">
                Use the name your team recognizes. You can rename it later.
              </p>
            </div>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">What do you want to do first?</legend>
              <div className="grid gap-2">
                {productChoices.map(({ value, label, body }) => (
                  <button key={value} type="button" onClick={() => setGoal(value)} className={cn('grid min-h-16 grid-cols-[18px_1fr] gap-3 border-y px-4 py-3 text-left transition-colors', goal === value ? 'border-primary bg-primary/[0.055]' : 'border-foreground/10 hover:bg-muted/30')} aria-label={label} aria-pressed={goal === value}>
                    <span className={cn('mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border', goal === value ? 'border-primary bg-primary' : 'border-input')}>{goal === value && <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}</span>
                    <span><span className={cn('block text-sm font-semibold', goal === value && 'text-primary')}>{label}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{body}</span></span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">You can turn either product on or off later without changing the shared embed.</p>
            </fieldset>
            <details className="rounded-lg border bg-muted/10">
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
                Personalize project (optional) · {icon}
              </summary>
              <div className="space-y-4 border-t px-4 py-3">
                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium">Project icon</legend>
                  <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
                    {PROJECT_ICONS.map((option) => {
                      const selected = icon === option.emoji
                      return (
                        <button
                          key={option.emoji}
                          type="button"
                          onClick={() => setIcon(option.emoji)}
                          className={cn(
                            'relative flex h-10 items-center justify-center rounded-md border text-lg transition-colors',
                            'hover:border-primary/40 hover:bg-primary/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            selected && 'border-primary/50 bg-primary/[0.09]'
                          )}
                          aria-label={`${option.label} icon`}
                          aria-pressed={selected}
                          title={option.label}
                        >
                          <span aria-hidden="true">{option.emoji}</span>
                          {selected && (
                            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <Check className="h-2.5 w-2.5" />
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">Shown in the project switcher so projects are easier to scan.</p>
                </fieldset>
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain (optional)</Label>
                  <Input
                    id="domain"
                    placeholder="myapp.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    This helps identify the project, but it is not required to install the widget.
                  </p>
                </div>
              </div>
            </details>
            {error && (
              <p role="alert" className="text-sm text-destructive">{error}</p>
            )}
            {limitMessage && (
              <div className="rounded-lg border border-primary/30 bg-primary/[0.04] p-4">
                <p className="text-sm font-medium text-foreground">Free plan project limit reached</p>
                <p className="mt-1 text-sm text-muted-foreground">{limitMessage}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href="/billing">
                    <Button type="button" variant="outline" size="sm">Open Billing</Button>
                  </Link>
                  <Link href="/projects">
                    <Button type="button" variant="ghost" size="sm">Back to projects</Button>
                  </Link>
                </div>
              </div>
            )}
            <Button data-tour="project-create-submit" type="submit" size="lg" className="w-full" disabled={loading || !name.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {goal === 'updates' ? 'Create project and set up user updates' : goal === 'both' ? 'Create project and set up both' : 'Create project and get install code'}
            </Button>
          </form>
          </CardContent>
        </Card>

        <aside className="border-t border-foreground/10 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <p className="text-sm font-semibold">What happens next</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Three focused screens. Advanced settings stay out of the way.</p>
          <div className="mt-5 border-y">
            {setupSteps.map(({ title, body }, index) => (
              <div key={title} className="flex gap-3 border-b py-4 last:border-b-0">
                <span className="font-mono text-[10px] text-primary">0{index + 1}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{title}</p>
                  <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{body}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" /> Future form changes and user-facing product updates are delivered remotely. No new snippet.</p>
        </aside>
      </div>
    </div>
  )
}
