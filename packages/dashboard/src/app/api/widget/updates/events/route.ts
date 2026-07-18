import { NextRequest, NextResponse } from 'next/server'
import { isProductUpdateId, type ProductUpdateMetricType } from '@feedbacks/shared'
import { createAdminSupabase } from '@/lib/supabase-server'
import { hashProjectApiKey } from '@/lib/project-api-keys'
import { isWidgetRequestOriginAllowed } from '@/lib/origin-allowlist'
import { publicEnv } from '@/lib/public-env'
import { checkRateLimit } from '@/lib/rate-limit'
import { readRequestBodyWithLimit, RequestBodyTooLargeError } from '@/lib/request-body-limit'
import type { Project } from '@/lib/types'
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', Vary: 'Origin' }
const eventTypes: ProductUpdateMetricType[] = ['impression', 'dismissal', 'cta_click']
export async function OPTIONS() { return new NextResponse(null, { status: 204, headers: cors }) }
export async function POST(request: NextRequest) {
  const rate = await checkRateLimit(request, 'product-updates-events', 60, 1); if (!rate.allowed) return NextResponse.json({ error: 'Too many requests.' }, { status: 429, headers: cors })
  let body: { projectKey?: unknown; events?: unknown }; try { body = JSON.parse(new TextDecoder().decode(await readRequestBodyWithLimit(request, 8 * 1024))) } catch (error) { return NextResponse.json({ error: error instanceof RequestBodyTooLargeError ? 'Request too large.' : 'Invalid JSON.' }, { status: 400, headers: cors }) }
  if (typeof body.projectKey !== 'string' || body.projectKey.length > 200 || !Array.isArray(body.events) || body.events.length < 1 || body.events.length > 10) return NextResponse.json({ error: 'Invalid events.' }, { status: 400, headers: cors })
  const events = body.events.filter((event): event is { updateId: string; type: ProductUpdateMetricType } => Boolean(event && typeof event === 'object' && isProductUpdateId((event as { updateId?: string }).updateId || '') && eventTypes.includes((event as { type?: ProductUpdateMetricType }).type || 'impression')))
  if (events.length !== body.events.length) return NextResponse.json({ error: 'Invalid events.' }, { status: 400, headers: cors })
  const admin = await createAdminSupabase(); const { data: project } = await admin.from('projects').select('id,settings').eq('api_key_hash', await hashProjectApiKey(body.projectKey)).maybeSingle()
  if (!project) return new NextResponse(null, { status: 202, headers: cors })
  if (!isWidgetRequestOriginAllowed(request, (project as Project).settings?.widget_origin_restriction, { trustedOrigins: [publicEnv.NEXT_PUBLIC_APP_ORIGIN] })) return NextResponse.json({ error: 'Origin not allowed.' }, { status: 403, headers: cors })
  const { data: settings } = await admin.from('product_update_settings').select('enabled').eq('project_id', project.id).maybeSingle()
  if (!settings?.enabled) return new NextResponse(null, { status: 202, headers: cors })
  const now = new Date().toISOString()
  const { data: updates } = await admin.from('product_updates').select('id').eq('project_id', project.id).eq('status', 'published').lte('published_at', now).or(`expires_at.is.null,expires_at.gt.${now}`).in('id', events.map((event) => event.updateId))
  if ((updates || []).length !== events.length) return NextResponse.json({ error: 'Unknown update.' }, { status: 400, headers: cors })
  await Promise.all(events.map((event) => admin.rpc('increment_product_update_metric', { p_project_id: project.id, p_update_id: event.updateId, p_event_type: event.type })))
  return new NextResponse(null, { status: 202, headers: cors })
}
