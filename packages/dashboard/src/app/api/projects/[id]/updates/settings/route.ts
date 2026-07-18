import { NextRequest, NextResponse } from 'next/server'
import { sanitizeProductUpdateSettings } from '@feedbacks/shared'
import { getAuthedUserAndProject } from '@/lib/api-auth'
import { getProductUpdateEntitlements } from '@/lib/product-update-entitlements'
import { mapProductUpdateSettings } from '@/lib/product-update-service'

const headers = { 'Cache-Control': 'no-store' }
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const auth = await getAuthedUserAndProject(id); if ('error' in auth) return auth.error
  const { data, error } = await auth.admin.from('product_update_settings').select('*').eq('project_id', id).maybeSingle()
  if (error) return NextResponse.json({ error: 'Unable to load settings.' }, { status: 500, headers })
  return NextResponse.json({ enabled: data?.enabled === true, ...mapProductUpdateSettings(data) }, { headers })
}
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const auth = await getAuthedUserAndProject(id); if ('error' in auth) return auth.error
  let body: unknown; try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400, headers }) }
  const parsed = sanitizeProductUpdateSettings(body); if (Object.keys(parsed.errors).length) return NextResponse.json({ errors: parsed.errors }, { status: 400, headers })
  const entitlements = await getProductUpdateEntitlements(auth.user.id)
  const settings = parsed.data
  const { data, error } = await auth.admin.from('product_update_settings').upsert({
    project_id: id, enabled: settings.enabled ?? false, auto_show: settings.autoShow ?? true,
    display_delay_ms: settings.displayDelayMs ?? 1500, theme: settings.theme ?? 'auto', accent_color: settings.accentColor || null,
    include_paths: settings.includePaths || [], exclude_paths: settings.excludePaths || [], show_powered_by: entitlements.customBranding ? settings.showPoweredBy !== false : true,
  }).select('*').single()
  if (error || !data) return NextResponse.json({ error: 'Unable to save settings.' }, { status: 500, headers })
  return NextResponse.json({ enabled: data.enabled, ...mapProductUpdateSettings(data) }, { headers })
}
