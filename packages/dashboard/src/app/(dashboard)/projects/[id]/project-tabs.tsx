'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { readStoredProjectApiKey, rememberProjectApiKey } from '@/lib/project-api-keys'
import type { BillingSummary, Project } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { parseAllowedOrigins } from '@/lib/origin-allowlist'
import { ArrowLeft, Copy, Check, Loader2, Trash2, Download, RefreshCw, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { BoardSettingsTab } from './board-settings'
import { ApiDocs } from './api-docs'
import { toast } from '@/hooks/use-toast'
import { Suspense } from 'react'
import { InstallTab } from './install-tab'
import { CustomizeTab } from './customize-tab'
import { IntegrationsTab } from './integrations-tab'
import { ProjectMenu, SetupProgress, type ProjectSection, type SetupStep } from './project-flow-nav'
import { ProductUpdatesTab } from '@/components/product-updates/ProductUpdatesTab'

interface ProjectTabsProps {
  project: Project
  billingSummary: BillingSummary | null
}

type TabId = 'install' | 'customize' | 'integrations' | 'board' | 'updates' | 'api' | 'settings'

const tabs: TabId[] = ['install', 'customize', 'integrations', 'board', 'updates', 'api', 'settings']

export function ProjectTabs({ project, billingSummary }: ProjectTabsProps) {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          Loading project workspace...
        </div>
      }
    >
      <ProjectTabsInner project={project} billingSummary={billingSummary} />
    </Suspense>
  )
}

function ProjectTabsInner({ project, billingSummary }: ProjectTabsProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isInteractive, setIsInteractive] = React.useState(false)
  const [apiKey, setApiKey] = React.useState<string | null>(project.api_key)
  const [rotatingApiKey, setRotatingApiKey] = React.useState(false)
  const [publicBoardUrl, setPublicBoardUrl] = React.useState<string | null>(null)
  const tabParam = searchParams.get('tab') as TabId | null
  const created = searchParams.get('created') === '1'
  const activeTab = tabs.includes(tabParam as TabId) ? tabParam! : 'install'
  const activeSection: ProjectSection =
    activeTab === 'customize' || activeTab === 'install'
      ? 'setup'
      : activeTab === 'integrations'
        ? 'integrations'
        : activeTab === 'board'
          ? 'board'
          : activeTab === 'updates'
            ? 'updates'
          : activeTab === 'api'
            ? 'api'
            : 'settings'
  const activeSetupStep: SetupStep = activeTab === 'install' ? 'install' : 'customize'
  const apiKeyLastFour = React.useMemo(
    () => apiKey?.slice(-4) || project.api_key_last_four || null,
    [apiKey, project.api_key_last_four],
  )

  React.useEffect(() => {
    setIsInteractive(true)
  }, [])

  React.useEffect(() => {
    if (project.api_key) {
      rememberProjectApiKey(project.id, project.api_key)
      setApiKey(project.api_key)
      return
    }

    const storedKey = readStoredProjectApiKey(project.id)
    if (storedKey) {
      setApiKey(storedKey)
    }
  }, [project.api_key, project.id])

  React.useEffect(() => {
    let cancelled = false

    async function loadPublicBoardUrl() {
      try {
        const response = await fetch(`/api/projects/${project.id}/board`, { cache: 'no-store' })
        const data = await response.json().catch(() => null)
        const board = data?.board
        const visibility = board?.profile?.visibility || 'public'
        const isVisible = Boolean(board?.enabled && board?.slug && visibility !== 'private')

        if (!cancelled) {
          setPublicBoardUrl(isVisible ? `/p/${board.slug}` : null)
        }
      } catch {
        if (!cancelled) setPublicBoardUrl(null)
      }
    }

    void loadPublicBoardUrl()

    return () => {
      cancelled = true
    }
  }, [project.id, activeTab])

  const handleRotateApiKey = async () => {
    setRotatingApiKey(true)
    try {
      const response = await fetch(`/api/projects/${project.id}/rotate-key`, {
        method: 'POST',
      })
      const payload = await response.json().catch(() => ({ error: 'Failed to rotate API key' }))
      if (!response.ok || !payload.api_key) {
        throw new Error(payload.error || 'Failed to rotate API key')
      }

      rememberProjectApiKey(project.id, payload.api_key)
      setApiKey(payload.api_key)
      toast({
        title: 'New API key generated',
        description: 'This key is only visible in this browser session. Copy it into your app or agent config now.',
      })
      router.refresh()
    } catch (error) {
      toast({
        title: 'Failed to rotate API key',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setRotatingApiKey(false)
    }
  }

  return (
    <div className="space-y-6" data-project-tabs-ready={isInteractive ? 'true' : 'false'}>
      <ProjectMenu projectId={project.id} activeSection={activeSection} />

      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Projects
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{project.name}</h1>
        {created && (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Your default install is ready. Copy it, send one test, then customize the form if needed.
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <ApiKeyBadge
            apiKey={apiKey}
            lastFour={apiKeyLastFour}
            rotating={rotatingApiKey}
            onRotate={handleRotateApiKey}
          />
          <a href={`/api/projects/${project.id}/feedback.csv`} download>
            <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs font-medium">
              <Download className="h-3 w-3" />
              Export CSV
            </Button>
          </a>
          {publicBoardUrl && (
            <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs font-medium" asChild>
              <a href={publicBoardUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" />
                Public page
              </a>
            </Button>
          )}
        </div>
      </div>

      {activeSection === 'setup' && <SetupProgress projectId={project.id} activeStep={activeSetupStep} />}

      {activeTab === 'install' && (
        <InstallTab
          project={project}
          projectKey={apiKey}
          apiKeyLastFour={apiKeyLastFour}
          rotatingApiKey={rotatingApiKey}
          onRotateApiKey={handleRotateApiKey}
        />
      )}
      {activeTab === 'customize' && (
        <CustomizeTab
          project={project}
          projectKey={apiKey}
          apiKeyLastFour={apiKeyLastFour}
          rotatingApiKey={rotatingApiKey}
          onRotateApiKey={handleRotateApiKey}
        />
      )}
      {activeTab === 'integrations' && <IntegrationsTab project={project} initialBillingSummary={billingSummary} />}
      {activeTab === 'board' && <BoardSettingsTab project={project} />}
      {activeTab === 'updates' && <ProductUpdatesTab projectId={project.id} />}
      {activeTab === 'api' && (
        <ApiDocs
          project={project}
          projectKey={apiKey}
          apiKeyLastFour={apiKeyLastFour}
          rotatingApiKey={rotatingApiKey}
          onRotateApiKey={handleRotateApiKey}
        />
      )}
      {activeTab === 'settings' && <SettingsTab project={project} />}
    </div>
  )
}

function ApiKeyBadge({
  apiKey,
  lastFour,
  rotating,
  onRotate,
}: {
  apiKey: string | null
  lastFour: string | null
  rotating: boolean
  onRotate: () => Promise<void>
}) {
  const [copied, setCopied] = React.useState(false)
  const copy = async () => {
    if (!apiKey) return
    await navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      {apiKey ? (
        <button onClick={copy} className="flex items-center gap-1.5" aria-label="Copy API key">
          <Badge variant="outline" className="font-mono text-xs">
            {copied ? 'Copied key' : 'Key visible'} · ••••{lastFour || apiKey.slice(-4)}
          </Badge>
          {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
        </button>
      ) : (
        <Badge variant="outline" className="font-mono text-xs">
          Key hidden{lastFour ? ` · ••••${lastFour}` : ''}
        </Badge>
      )}
      <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs font-medium" onClick={() => void onRotate()} disabled={rotating}>
        {rotating ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
        Rotate API key
      </Button>
    </div>
  )
}

function SettingsTab({ project }: { project: Project }) {
  const router = useRouter()
  const [name, setName] = React.useState(project.name)
  const [domain, setDomain] = React.useState(project.domain || '')
  const [restrictOrigins, setRestrictOrigins] = React.useState(
    Boolean(project.settings?.widget_origin_restriction?.enabled),
  )
  const [allowedOriginsText, setAllowedOriginsText] = React.useState(
    (project.settings?.widget_origin_restriction?.origins || []).join('\n'),
  )
  const [saving, setSaving] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const [deleteInput, setDeleteInput] = React.useState('')

  const handleSave = async () => {
    setSaving(true)
    const origins = parseAllowedOrigins(allowedOriginsText)

    if (restrictOrigins && origins.length === 0) {
      setSaving(false)
      toast({
        title: 'Add at least one allowed site',
        description: 'Use full URLs like https://example.com, one per line.',
        variant: 'destructive',
      })
      return
    }

    const response = await fetch(`/api/projects/${project.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        domain: domain.trim() || null,
        settings: {
          ...project.settings,
          widget_origin_restriction: {
            enabled: restrictOrigins,
            origins,
          },
        },
      }),
    })
    const payload = await response.json().catch(() => null)
    setSaving(false)
    if (!response.ok) {
      toast({
        title: 'Failed to save settings',
        description: payload?.error || 'Please try again.',
        variant: 'destructive',
      })
      return
    }
    toast({ title: 'Project settings saved' })
    router.refresh()
  }

  const handleDelete = async () => {
    setDeleting(true)
    const response = await fetch(`/api/projects/${project.id}`, { method: 'DELETE' })
    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      toast({
        title: 'Failed to delete project',
        description: payload?.error || 'Please try again.',
        variant: 'destructive',
      })
      setDeleting(false)
      return
    }
    window.dispatchEvent(
      new CustomEvent('feedbacks:project-deleted', { detail: { projectId: project.id } }),
    )
    router.replace('/projects')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Project Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input id="project-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-domain">Domain</Label>
            <Input
              id="project-domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="myapp.com"
            />
          </div>
          <div className="rounded-lg border border-border/80 bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <input
                id="restrict-widget-origins"
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-border accent-primary"
                checked={restrictOrigins}
                onChange={(event) => setRestrictOrigins(event.target.checked)}
              />
              <div className="min-w-0 flex-1 space-y-2">
                <Label htmlFor="restrict-widget-origins" className="text-sm font-semibold">
                  Restrict widget submissions to my sites
                </Label>
                <p className="text-sm text-muted-foreground">
                  Leave this off while installing. Turn it on after the widget works to block submissions from other websites using your project key.
                </p>
                <Textarea
                  value={allowedOriginsText}
                  onChange={(event) => setAllowedOriginsText(event.target.value)}
                  placeholder={`https://example.com\nhttps://app.example.com`}
                  rows={3}
                  disabled={!restrictOrigins}
                  aria-label="Allowed widget origins"
                />
                <p className="text-xs text-muted-foreground">
                  One origin per line. Use only scheme and domain, like https://example.com. Do not include paths.
                </p>
              </div>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Permanently delete this project and all its feedback.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!confirmDelete ? (
            <Button
              variant="destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete Project
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-destructive">
                This cannot be undone. Type <strong>{project.name}</strong> to confirm.
              </p>
              <Input
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder={project.name}
                aria-label="Type project name to confirm deletion"
              />
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting || deleteInput !== project.name}
                >
                  {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm Delete
                </Button>
                <Button variant="outline" onClick={() => { setConfirmDelete(false); setDeleteInput('') }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
