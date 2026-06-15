import { NextRequest, NextResponse } from 'next/server'
import { createAgentSetupToken } from '@/lib/agent-setup'
import { getAuthedUserAndProject } from '@/lib/api-auth'
import { env } from '@/lib/env'
import { hashProjectApiKey } from '@/lib/project-api-keys'

type RouteParams = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const result = await getAuthedUserAndProject(id)
    if ('error' in result) return result.error

    const { user, project, admin } = result
    const body = await request.json().catch(() => ({}))
    const providedProjectKey = typeof body.projectKey === 'string' ? body.projectKey.trim() : ''
    const projectKey = providedProjectKey || project.api_key || ''

    if (!projectKey) {
      return NextResponse.json(
        {
          error: 'Generate a fresh project key before creating an agent setup packet.',
          code: 'project_key_required',
        },
        { status: 409 },
      )
    }

    const projectWithHash = project as typeof project & { api_key_hash?: string | null }
    const providedHash = await hashProjectApiKey(projectKey)
    if (projectWithHash.api_key_hash && providedHash !== projectWithHash.api_key_hash) {
      return NextResponse.json({ error: 'Project key does not match this project.' }, { status: 400 })
    }

    const { token, payload } = createAgentSetupToken({
      projectId: project.id,
      userId: user.id,
      projectKey,
    })
    const packetUrl = `${env.NEXT_PUBLIC_APP_ORIGIN}/api/setup/packet?token=${encodeURIComponent(token)}`

    await admin.from('agent_setup_audit').insert({
      id: crypto.randomUUID(),
      project_id: project.id,
      user_id: user.id,
      event_type: 'token_created',
      expires_at: payload.expiresAt,
      metadata: {
        user_agent: request.headers.get('user-agent') || null,
      },
      created_at: new Date().toISOString(),
    }).then(() => undefined, () => undefined)

    return NextResponse.json({
      token,
      packetUrl,
      expiresAt: payload.expiresAt,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create setup token' },
      { status: 500 },
    )
  }
}
