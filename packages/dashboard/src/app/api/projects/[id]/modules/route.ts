import { NextRequest, NextResponse } from 'next/server'
import { getAuthedUserAndProject } from '@/lib/api-auth'

const headers = { 'Cache-Control': 'no-store' }

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = await getAuthedUserAndProject(id)
  if ('error' in auth) return auth.error
  const { data } = await auth.admin.from('product_update_settings').select('enabled').eq('project_id', id).maybeSingle()
  return NextResponse.json({ feedback: auth.project.settings?.widget_config?.feedbackEnabled !== false, updates: data?.enabled === true }, { headers })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = await getAuthedUserAndProject(id)
  if ('error' in auth) return auth.error
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object' || Object.keys(body).some((key) => key !== 'feedback' && key !== 'updates') || Object.values(body).some((value) => typeof value !== 'boolean')) return NextResponse.json({ error: 'Only feedback and updates booleans are allowed.' }, { status: 400, headers })
  const values = body as { feedback?: boolean; updates?: boolean }
  if (values.feedback !== undefined) {
    const settings = auth.project.settings || {}
    const { error } = await auth.admin.from('projects').update({ settings: { ...settings, widget_config: { ...settings.widget_config, feedbackEnabled: values.feedback } } }).eq('id', id)
    if (error) return NextResponse.json({ error: 'Unable to update Feedback module.' }, { status: 500, headers })
  }
  if (values.updates !== undefined) {
    const { data: existing } = await auth.admin.from('product_update_settings').select('*').eq('project_id', id).maybeSingle()
    const { error } = await auth.admin.from('product_update_settings').upsert({ project_id: id, enabled: values.updates, auto_show: existing?.auto_show ?? true, display_delay_ms: existing?.display_delay_ms ?? 1500, theme: existing?.theme ?? 'auto', accent_color: existing?.accent_color ?? null, include_paths: existing?.include_paths ?? [], exclude_paths: existing?.exclude_paths ?? [], show_powered_by: existing?.show_powered_by ?? true })
    if (error) return NextResponse.json({ error: 'Unable to update Updates module.' }, { status: 500, headers })
  }
  return GET(new NextRequest('http://localhost'), { params: Promise.resolve({ id }) })
}
