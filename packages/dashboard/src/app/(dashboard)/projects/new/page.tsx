'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { rememberProjectApiKey } from '@/lib/project-api-keys'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CheckCircle2, Code2, Inbox, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const setupSteps = [
  { Icon: CheckCircle2, title: 'Create project', body: 'Name the place where feedback belongs.' },
  { Icon: Code2, title: 'Customize first', body: 'Pick the form style before copying code.' },
  { Icon: Inbox, title: 'Install and test', body: 'Paste code, send one test, then check the inbox.' },
]

export default function NewProjectPage() {
  const [name, setName] = React.useState('')
  const [domain, setDomain] = React.useState('')
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
      router.push(`/projects/${payload.id}?created=1&tab=customize`)
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
            <CardTitle>Create your first project</CardTitle>
            <CardDescription>
              One name is enough. Next you choose the form style, then copy the matching code.
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
            <details className="rounded-lg border bg-muted/10">
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
                Add domain later, or set it now
              </summary>
              <div className="border-t px-4 py-3">
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
              Create project and customize
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
