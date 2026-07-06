import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminSupabase } from '@/lib/supabase-server'

export const ACTIVATION_MILESTONES = [
  'project_created',
  'install_code_copied',
  'verification_completed',
  'first_feedback_received',
  'first_feedback_triaged',
  'integration_connected',
] as const

export type ActivationMilestone = typeof ACTIVATION_MILESTONES[number]

export async function recordActivationMilestone({
  projectId,
  userId,
  eventName,
  metadata = {},
  admin: providedAdmin,
}: {
  projectId: string
  userId: string
  eventName: ActivationMilestone
  metadata?: Record<string, string | number | boolean | null>
  admin?: SupabaseClient
}): Promise<void> {
  try {
    const admin = providedAdmin || await createAdminSupabase()
    await admin.from('activation_milestones').upsert({
      project_id: projectId,
      user_id: userId,
      event_name: eventName,
      metadata,
    }, { onConflict: 'project_id,event_name', ignoreDuplicates: true })
  } catch {
    // Product measurement must never change the product action's result.
  }
}

