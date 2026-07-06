import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'
import { recordActivationMilestone, type ActivationMilestone } from '@/lib/activation-milestones'

const CLIENT_MILESTONES = new Set<ActivationMilestone>([
  'install_code_copied',
  'verification_completed',
  'first_feedback_triaged',
])

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const eventName = body?.event as ActivationMilestone | undefined
  if (!eventName || !CLIENT_MILESTONES.has(eventName)) {
    return NextResponse.json({ error: 'Unsupported activation milestone' }, { status: 400 })
  }

  const admin = await createAdminSupabase()
  const { data: project } = await admin
    .from('projects')
    .select('id')
    .eq('id', id)
    .eq('owner_user_id', user.id)
    .maybeSingle()
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  await recordActivationMilestone({ projectId: id, userId: user.id, eventName, admin })
  return NextResponse.json({ recorded: true })
}
