import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'
import { assertFeatureAccess } from '@/lib/billing'
import { hasE2EBypass } from '@/lib/e2e'
import { resendWebhookDelivery, sendTestWebhook } from '@/lib/webhook-delivery'
import type { WebhookEndpoint, GitHubEndpoint } from '@/lib/types'
import { countActiveWebhookEndpoints, normalizeWebhookConfig } from '@/lib/webhook-config'
import { recordActivationMilestone } from '@/lib/activation-milestones'

type RouteParams = { params: Promise<{ id: string }> }

async function getAuthedProject(projectId: string, request: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  const admin = await createAdminSupabase()
  const { data: project, error } = await admin
    .from('projects')
    .select('id, name, webhooks, owner_user_id')
    .eq('id', projectId)
    .eq('owner_user_id', user.id)
    .single()

  if (error || !project) return { error: NextResponse.json({ error: 'Project not found' }, { status: 404 }) }
  if (!hasE2EBypass(request)) {
    const feature = await assertFeatureAccess(user.id, 'webhooks', user.email)
    if (!feature.allowed) {
      return {
        error: NextResponse.json({ error: feature.message, code: feature.code }, { status: 403 }),
      }
    }
    return { project, admin, summary: feature.summary }
  }
  return { project, admin, summary: null }
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const result = await getAuthedProject(id, _request)
    if ('error' in result && !('admin' in result)) return result.error
    const { project } = result as Exclude<typeof result, { error: NextResponse }>
    return NextResponse.json(normalizeWebhookConfig(project.webhooks))
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const result = await getAuthedProject(id, request)
    if ('error' in result && !('admin' in result)) return result.error
    const { admin, summary, project } = result as Exclude<typeof result, { error: NextResponse }>

    const webhooks = normalizeWebhookConfig(await request.json())
    const endpointLimit = summary?.entitlements.webhookEndpointLimit ?? null
    const activeEndpointCount = countActiveWebhookEndpoints(webhooks)

    if (endpointLimit !== null && activeEndpointCount > endpointLimit) {
      return NextResponse.json(
        {
          error: `Free plan includes ${endpointLimit} active integration endpoint. Disable another endpoint or upgrade to Pro.`,
          code: 'webhook_endpoint_limit_reached',
          limit: endpointLimit,
          activeEndpointCount,
        },
        { status: 403 },
      )
    }

    const { data, error } = await admin
      .from('projects')
      .update({ webhooks, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('webhooks')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (activeEndpointCount > 0) {
      await recordActivationMilestone({
        projectId: id,
        userId: project.owner_user_id,
        eventName: 'integration_connected',
        admin,
      })
    }
    return NextResponse.json(data?.webhooks ?? {})
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const result = await getAuthedProject(id, request)
    if ('error' in result && !('admin' in result)) return result.error
    const { project } = result as Exclude<typeof result, { error: NextResponse }>

    const body = await request.json()

    if (body?.action === 'resend') {
      if (!body.deliveryId) {
        return NextResponse.json({ error: 'deliveryId is required' }, { status: 400 })
      }

      const replay = await resendWebhookDelivery(project.id, body.deliveryId)
      return NextResponse.json(replay)
    }

    const { type, endpoint } = body as {
      type: 'slack' | 'discord' | 'generic' | 'github'
      endpoint: WebhookEndpoint | GitHubEndpoint
    }

    if (!type || !endpoint?.url) {
      return NextResponse.json({ error: 'type and endpoint.url are required' }, { status: 400 })
    }

    const normalized = normalizeWebhookConfig({
      [type]: type === 'github'
        ? { endpoints: [endpoint] }
        : { endpoints: [endpoint] },
    })
    const normalizedEndpoint = type === 'github'
      ? normalized.github?.endpoints?.[0]
      : normalized[type]?.endpoints?.[0]

    if (!normalizedEndpoint) {
      return NextResponse.json({ error: 'Endpoint is invalid' }, { status: 400 })
    }

    const delivery = await sendTestWebhook(type, normalizedEndpoint, { id: project.id, name: project.name })
    return NextResponse.json(delivery)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
