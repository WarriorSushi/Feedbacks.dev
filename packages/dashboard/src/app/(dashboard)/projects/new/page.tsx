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
  { Icon: CheckCircle2, title: 'Create project', body: 'Name the place where feedback belongs.' },
  { Icon: Code2, title: 'Copy the default install', body: 'The generated snippet works without configuration.' },
  { Icon: Inbox, title: 'Verify one message', body: 'Send one test, confirm the inbox, then customize if needed.' },
]

export default function NewProjectPage() {
  const [name, setName] = React.useState('')
  const [domain, setDomain] = React.useState('')
  const [icon, setIcon] = React.useState<string>(DEFAULT_PROJECT_ICON)
  const [goal, setGoal] = React.useState<'updates' | 'feedback' | 'both'>('feedback')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [limitMessage, setLimitMessage] = React.useState('')
  const router = useRouter()

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
      router.push(goal === 'feedback' ? `/projects/${payload.id}/install?created=1` : `/projects/${payload.id}/updates`)
    } catch {
      setError('Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to projects
      </Link>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card data-tour="project-create-form">
          <CardHeader>
            <CardTitle>Create project</CardTitle>
            <CardDescription>
              One name is enough. The next screen gives you a working install snippet immediately.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
              <div className="grid gap-2 sm:grid-cols-3">
                {([
                  ['updates', 'Announce updates'],
                  ['feedback', 'Collect feedback'],
                  ['both', 'Both'],
                ] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setGoal(value)} className={cn('min-h-11 rounded-md border px-3 text-left text-sm font-medium', goal === value ? 'border-primary bg-primary/5 text-primary' : 'hover:bg-muted/50')} aria-pressed={goal === value}>{label}</button>)}
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
              Create project and get install code
            </Button>
          </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Setup stays linear</CardTitle>
            <CardDescription>
              One screen at a time, no setup maze.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {setupSteps.map(({ Icon, title, body }) => (
              <div key={title} className="flex gap-3 rounded-lg border bg-muted/20 p-3">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{title}</p>
                  <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{body}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
