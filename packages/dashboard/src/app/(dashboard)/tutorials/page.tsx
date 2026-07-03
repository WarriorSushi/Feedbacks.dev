import { createServerSupabase } from '@/lib/supabase-server'
import { TutorialCenter } from './tutorial-center'

export const metadata = { title: 'Guided Tutorials' }

export default async function TutorialsPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: project } = user
    ? await supabase
        .from('projects')
        .select('id')
        .eq('owner_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null }

  const { data: settings } = user
    ? await supabase
        .from('user_settings')
        .select('preferences')
        .eq('user_id', user.id)
        .maybeSingle()
    : { data: null }
  const preferences = settings?.preferences && typeof settings.preferences === 'object'
    ? settings.preferences as { guidedTutorialProgress?: Record<string, { stepIndex: number; completedAt?: string; dismissedAt?: string }> }
    : {}

  return <TutorialCenter defaultProjectId={project?.id} initialProgress={preferences.guidedTutorialProgress} />
}
