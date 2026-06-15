import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiKey } from '@/lib/api-auth'
import { assertFeatureAccess } from '@/lib/billing'
import { buildAgentSetupPacket } from '@/lib/agent-setup'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
}

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: CORS_HEADERS })
}

function jsonError(message: string, status: number) {
  return json({ error: message }, status)
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const auth = await authenticateApiKey(request)
    if (!auth) return jsonError('Invalid or missing API key', 401)
    if (auth.project.id !== id) return jsonError('Forbidden', 403)

    const feature = await assertFeatureAccess(auth.project.owner_user_id, 'apiAccess')
    if (!feature.allowed) return jsonError(feature.message, 403)

    const projectKey = request.headers.get('X-API-Key')
    if (!projectKey) return jsonError('Invalid or missing API key', 401)

    return json(buildAgentSetupPacket(auth.project, projectKey))
  } catch (error) {
    console.error('v1 setup packet error:', error)
    return jsonError('Internal server error', 500)
  }
}
