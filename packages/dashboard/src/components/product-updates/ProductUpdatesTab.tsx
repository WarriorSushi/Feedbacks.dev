'use client'

import * as React from 'react'
import { Archive, CalendarClock, Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'

type Update = {
  id: string
  status: 'draft' | 'published' | 'archived'
  version_label: string | null
  title: string
  summary: string
  highlights: string[]
  cta_label: string | null
  cta_url: string | null
  imageUrl?: string
  published_at: string | null
  expires_at: string | null
  metrics: { impressions: number; dismissals: number; ctaClicks: number }
}

type Settings = {
  enabled: boolean
  autoShow: boolean
  displayDelayMs: number
  theme: 'auto' | 'light' | 'dark'
  accentColor: string
  includePaths: string[]
  excludePaths: string[]
  showPoweredBy: boolean
}

type Entitlements = {
  scheduling: boolean
  analyticsDays: number
  activeLimit: number | null
  customBranding: boolean
}

type FormValues = {
  versionLabel: string
  title: string
  summary: string
  highlights: string
  ctaLabel: string
  ctaUrl: string
}

const blankForm: FormValues = { versionLabel: '', title: '', summary: '', highlights: '', ctaLabel: '', ctaUrl: '' }

function toForm(update: Update): FormValues {
  return {
    versionLabel: update.version_label || '',
    title: update.title,
    summary: update.summary,
    highlights: update.highlights.join('\n'),
    ctaLabel: update.cta_label || '',
    ctaUrl: update.cta_url || '',
  }
}

function localDateTime(iso: string | null) {
  if (!iso) return ''
  const date = new Date(iso)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function stateLabel(update: Update) {
  if (update.status === 'archived') return 'Archived'
  if (update.status === 'draft') return 'Draft'
  if (update.expires_at && new Date(update.expires_at) <= new Date()) return 'Expired'
  if (update.published_at && new Date(update.published_at) > new Date()) return 'Scheduled'
  return 'Live'
}

export function ProductUpdatesTab({ projectId }: { projectId: string }) {
  const [updates, setUpdates] = React.useState<Update[]>([])
  const [settings, setSettings] = React.useState<Settings | null>(null)
  const [entitlements, setEntitlements] = React.useState<Entitlements | null>(null)
  const [form, setForm] = React.useState<FormValues>(blankForm)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [publishAt, setPublishAt] = React.useState('')
  const [previewMobile, setPreviewMobile] = React.useState(false)
  const [previewDark, setPreviewDark] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const selected = updates.find((update) => update.id === selectedId) || null

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/updates`, { cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to load Product Updates.')
      setUpdates(data.updates || [])
      setSettings(data.settings)
      setEntitlements(data.entitlements)
    } catch (error) {
      toast({ title: 'Could not load Product Updates', description: error instanceof Error ? error.message : 'Try again.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [projectId])

  React.useEffect(() => { void load() }, [load])

  const updateForm = (key: keyof FormValues, value: string) => setForm((current) => ({ ...current, [key]: value }))

  function newUpdate() {
    setSelectedId(null)
    setForm(blankForm)
    setPublishAt('')
  }

  function edit(update: Update) {
    setSelectedId(update.id)
    setForm(toForm(update))
    setPublishAt(localDateTime(update.published_at))
  }

  async function request(url: string, options?: RequestInit) {
    const response = await fetch(url, options)
    const data = await response.json().catch(() => null)
    if (!response.ok) throw new Error(data?.error || Object.values(data?.errors || {}).join(' ') || 'Request failed.')
    return data
  }

  function formBody() {
    return {
      versionLabel: form.versionLabel,
      title: form.title,
      summary: form.summary,
      highlights: form.highlights.split('\n').map((item) => item.trim()).filter(Boolean),
      ctaLabel: form.ctaLabel,
      ctaUrl: form.ctaUrl,
    }
  }

  async function saveDraft() {
    setSaving(true)
    try {
      const body = JSON.stringify(formBody())
      const data = selected
        ? await request(`/api/projects/${projectId}/updates/${selected.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body })
        : await request(`/api/projects/${projectId}/updates`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
      if (!selected && data.update?.id) setSelectedId(data.update.id)
      toast({ title: selected ? 'Update saved' : 'Draft saved' })
      await load()
    } catch (error) {
      toast({ title: 'Could not save draft', description: error instanceof Error ? error.message : 'Check the fields and try again.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  async function publish(scheduled = false) {
    if (!selected) return
    if (scheduled && !publishAt) {
      toast({ title: 'Choose a publication time', description: 'Scheduling requires a future local date and time.', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      await request(`/api/projects/${projectId}/updates/${selected.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publishedAt: scheduled ? new Date(publishAt).toISOString() : undefined }),
      })
      toast({ title: scheduled ? 'Update scheduled' : 'Update published', description: 'It is usually visible in the widget within a minute.' })
      await load()
    } catch (error) {
      toast({ title: 'Could not publish update', description: error instanceof Error ? error.message : 'Try again.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  async function lifecycle(update: Update, action: 'archive' | 'restore' | 'delete') {
    if (action === 'delete' && !window.confirm('Delete this Product Update and its image? This cannot be undone.')) return
    try {
      await request(`/api/projects/${projectId}/updates/${update.id}${action === 'delete' ? '' : `/${action}`}`, { method: action === 'delete' ? 'DELETE' : 'POST' })
      if (selectedId === update.id) newUpdate()
      await load()
    } catch (error) {
      toast({ title: `Could not ${action} update`, description: error instanceof Error ? error.message : 'Try again.', variant: 'destructive' })
    }
  }

  async function uploadImage(file: File | undefined) {
    if (!file || !selected) return
    setSaving(true)
    try {
      await request(`/api/projects/${projectId}/updates/${selected.id}/image`, { method: 'POST', headers: { 'Content-Type': file.type }, body: file })
      toast({ title: 'Image uploaded' })
      await load()
    } catch (error) {
      toast({ title: 'Could not upload image', description: error instanceof Error ? error.message : 'Use JPEG, PNG, or WebP under 2 MB.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  async function saveSettings(next: Settings) {
    setSettings(next)
    try {
      const result = await request(`/api/projects/${projectId}/updates/settings`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) })
      setSettings(result)
    } catch (error) {
      toast({ title: 'Could not save settings', description: error instanceof Error ? error.message : 'Try again.', variant: 'destructive' })
      void load()
    }
  }

  if (loading) return <Card><CardContent className="p-6 text-sm text-muted-foreground">Loading Product Updates…</CardContent></Card>

  const impressions = selected?.metrics.impressions || 0
  const ctaRate = impressions ? Math.round(((selected?.metrics.ctaClicks || 0) / impressions) * 100) : 0
  const dismissalRate = impressions ? Math.round(((selected?.metrics.dismissals || 0) / impressions) * 100) : 0

  return <div className="space-y-6">
    <section className="flex flex-wrap items-start justify-between gap-4 border-b pb-5">
      <div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Product Updates</p><h2 className="mt-1 text-xl font-semibold">Tell users what just shipped</h2><p className="mt-1 text-sm text-muted-foreground">Publish a concise update through the widget they already use. Automatic display happens once per browser.</p></div>
      <Button onClick={newUpdate}><Plus className="mr-2 h-4 w-4" />New update</Button>
    </section>

    {!settings?.enabled && <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm"><strong>Runtime is off.</strong> Enable these settings and enable Product Updates in Customize once before a published update can appear.</div>}

    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <section className="border-b pb-6"><div className="mb-4 flex items-center justify-between"><div><h3 className="font-semibold">{selected ? 'Edit update' : 'Create draft'}</h3><p className="mt-1 text-sm text-muted-foreground">Plain text only. A live update keeps its existing seen state when edited.</p></div>{selected && <Button variant="ghost" size="sm" onClick={newUpdate}>Cancel edit</Button>}</div>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Version label"><Input value={form.versionLabel} maxLength={32} placeholder="v2.4" onChange={(event) => updateForm('versionLabel', event.target.value)} /></Field><Field label="CTA label"><Input value={form.ctaLabel} maxLength={40} onChange={(event) => updateForm('ctaLabel', event.target.value)} /></Field></div>
          <div className="mt-4"><Field label="Title"><Input value={form.title} maxLength={120} onChange={(event) => updateForm('title', event.target.value)} /></Field></div>
          <div className="mt-4"><Field label="Summary"><Textarea value={form.summary} maxLength={280} rows={3} onChange={(event) => updateForm('summary', event.target.value)} /></Field></div>
          <div className="mt-4"><Field label="Highlights, one per line"><Textarea value={form.highlights} rows={5} onChange={(event) => updateForm('highlights', event.target.value)} /></Field></div>
          <div className="mt-4"><Field label="CTA URL"><Input value={form.ctaUrl} maxLength={2048} placeholder="/new-feature or https://example.com" onChange={(event) => updateForm('ctaUrl', event.target.value)} /></Field></div>
          {selected && <div className="mt-4"><Label htmlFor="update-image" className="text-sm">Image</Label><div className="mt-1 flex items-center gap-3">{selected.imageUrl && <span className="whitespace-nowrap text-xs text-muted-foreground">Image uploaded</span>}<Input id="update-image" type="file" accept="image/jpeg,image/png,image/webp" disabled={saving} onChange={(event) => void uploadImage(event.currentTarget.files?.[0])} /><span className="whitespace-nowrap text-xs text-muted-foreground">2 MB max</span></div></div>}
          <div className="mt-5 flex flex-wrap gap-2"><Button onClick={() => void saveDraft()} disabled={saving}>{saving ? 'Saving…' : selected?.status === 'published' ? 'Update live post' : 'Save draft'}</Button>{selected?.status === 'draft' && <Button variant="outline" onClick={() => void publish(false)} disabled={saving}>Publish now</Button>}</div>
          {selected?.status === 'draft' && <div className="mt-4 flex flex-wrap items-end gap-2 rounded-md bg-muted/40 p-3"><Field label="Publish later" className="min-w-[220px]"><Input type="datetime-local" value={publishAt} disabled={!entitlements?.scheduling} onChange={(event) => setPublishAt(event.target.value)} /></Field><Button variant="outline" disabled={saving || !entitlements?.scheduling} onClick={() => void publish(true)}><CalendarClock className="mr-2 h-4 w-4" />Schedule</Button>{!entitlements?.scheduling && <p className="pb-2 text-xs text-muted-foreground">Scheduling is available on Pro.</p>}</div>}
        </section>

        <section><div className="mb-3 flex items-center justify-between"><div><h3 className="font-semibold">Updates</h3><p className="text-sm text-muted-foreground">{entitlements?.activeLimit ? `Free includes ${entitlements.activeLimit} concurrent live updates.` : 'Unlimited live updates on Pro.'}</p></div></div>
          <div className="divide-y rounded-md border">{updates.length === 0 ? <p className="p-5 text-sm text-muted-foreground">No updates yet. Save a first draft to upload an image, preview, and publish.</p> : updates.map((update) => <div key={update.id} className={`flex flex-wrap items-center justify-between gap-4 p-4 ${selectedId === update.id ? 'bg-muted/35' : ''}`}><button className="min-w-0 text-left" onClick={() => edit(update)}><p className="truncate font-medium">{update.version_label ? `${update.version_label} · ` : ''}{update.title}</p><p className="mt-1 text-xs text-muted-foreground">{stateLabel(update)} · {update.metrics.impressions} impressions · {update.metrics.ctaClicks} CTA clicks</p></button><div className="flex items-center gap-1">{update.status === 'published' && <Button size="sm" variant="ghost" onClick={() => void lifecycle(update, 'archive')}><Archive className="mr-1 h-3.5 w-3.5" />Archive</Button>}{update.status === 'archived' && <Button size="sm" variant="ghost" onClick={() => void lifecycle(update, 'restore')}>Restore</Button>}<Button size="icon" variant="ghost" aria-label={`Edit ${update.title}`} onClick={() => edit(update)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" aria-label={`Delete ${update.title}`} onClick={() => void lifecycle(update, 'delete')}><Trash2 className="h-4 w-4" /></Button></div></div>)}</div>
        </section>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start"><section className="border rounded-lg p-4"><div className="flex items-center justify-between"><h3 className="font-semibold">Preview</h3><div className="flex gap-1"><Button size="sm" variant={previewMobile ? 'outline' : 'secondary'} onClick={() => setPreviewMobile(false)}>Desktop</Button><Button size="sm" variant={previewMobile ? 'secondary' : 'outline'} onClick={() => setPreviewMobile(true)}>Mobile</Button></div></div><div className="mt-3 flex items-center justify-between"><span className="text-xs text-muted-foreground">{settings?.theme === 'auto' ? 'Auto theme' : `${settings?.theme || 'Auto'} theme`}</span><Button size="sm" variant="ghost" onClick={() => setPreviewDark((value) => !value)}><Eye className="mr-1 h-3.5 w-3.5" />{previewDark ? 'Light' : 'Dark'}</Button></div><UpdatePreview form={form} dark={previewDark} mobile={previewMobile} accent={settings?.accentColor || '#6366f1'} /></section>
        {selected && <section className="border rounded-lg p-4"><h3 className="font-semibold">Approximate metrics</h3><p className="mt-1 text-xs text-muted-foreground">Last {entitlements?.analyticsDays || 7} days, aggregate only.</p><dl className="mt-4 grid grid-cols-3 gap-2 text-center"><Metric label="Views" value={impressions} /><Metric label="CTR" value={`${ctaRate}%`} /><Metric label="Dismissed" value={`${dismissalRate}%`} /></dl></section>}
        {settings && <section className="border rounded-lg p-4"><h3 className="font-semibold">Display settings</h3><div className="mt-4 space-y-3"><Check label="Enable Product Updates" value={settings.enabled} onChange={(enabled) => void saveSettings({ ...settings, enabled })} /><Check label="Auto-show newest unseen" value={settings.autoShow} onChange={(autoShow) => void saveSettings({ ...settings, autoShow })} /><Field label="Theme"><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={settings.theme} onChange={(event) => void saveSettings({ ...settings, theme: event.target.value as Settings['theme'] })}><option value="auto">Match visitor device</option><option value="light">Always light</option><option value="dark">Always dark</option></select></Field><Field label="Delay (milliseconds)"><Input type="number" min="0" max="30000" value={settings.displayDelayMs} onChange={(event) => setSettings({ ...settings, displayDelayMs: Number(event.target.value) || 0 })} onBlur={() => void saveSettings(settings)} /></Field><Field label="Accent color"><Input value={settings.accentColor} onChange={(event) => setSettings({ ...settings, accentColor: event.target.value })} onBlur={() => void saveSettings(settings)} /></Field><Field label="Included paths, one per line"><Textarea rows={2} value={settings.includePaths.join('\n')} onChange={(event) => setSettings({ ...settings, includePaths: event.target.value.split('\n').map((item) => item.trim()).filter(Boolean) })} onBlur={() => void saveSettings(settings)} /></Field><Field label="Excluded paths, one per line"><Textarea rows={2} value={settings.excludePaths.join('\n')} onChange={(event) => setSettings({ ...settings, excludePaths: event.target.value.split('\n').map((item) => item.trim()).filter(Boolean) })} onBlur={() => void saveSettings(settings)} /></Field><Check label="Show feedbacks.dev branding" value={settings.showPoweredBy} disabled={!entitlements?.customBranding} onChange={(showPoweredBy) => void saveSettings({ ...settings, showPoweredBy })} /></div></section>}
      </aside>
    </div>
  </div>
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={`block space-y-1.5 ${className || ''}`}><span className="text-sm font-medium">{label}</span>{children}</label>
}

function Check({ label, value, onChange, disabled }: { label: string; value: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
  return <label className={`flex items-center gap-2 text-sm ${disabled ? 'text-muted-foreground' : ''}`}><input type="checkbox" checked={value} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />{label}</label>
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div><dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt><dd className="mt-1 text-base font-semibold">{value}</dd></div>
}

function UpdatePreview({ form, dark, mobile, accent }: { form: FormValues; dark: boolean; mobile: boolean; accent: string }) {
  return <div className={`mx-auto mt-4 rounded-lg border p-5 shadow-sm ${mobile ? 'max-w-[280px]' : ''} ${dark ? 'border-slate-700 bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}><p className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: accent }}>{form.versionLabel || 'What’s New'}</p><h4 className="mt-2 text-lg font-semibold">{form.title || 'Your update title'}</h4><p className={`mt-2 text-sm leading-6 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{form.summary || 'A concise summary of the release appears here.'}</p>{form.highlights && <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">{form.highlights.split('\n').filter(Boolean).map((item) => <li key={item}>{item}</li>)}</ul>}{form.ctaLabel && <span className="mt-4 inline-flex rounded-md px-3 py-2 text-sm font-semibold text-white" style={{ backgroundColor: accent }}>{form.ctaLabel}</span>}</div>
}
