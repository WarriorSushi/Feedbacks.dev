import { createServerSupabase } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ProjectRequiredEmpty } from '@/components/project-required-empty'
import { CURRENT_PROJECT_COOKIE, getSelectedProject } from '@/lib/project-selection'

export const metadata = {
  title: 'Integrations',
}

export default async function IntegrationsPage() {
  const cookieStore = await cookies()
  const preferredProjectId = cookieStore.get(CURRENT_PROJECT_COOKIE)?.value
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .eq('owner_user_id', user!.id)
    .order('created_at', { ascending: false })

  const project = getSelectedProject(projects || [], preferredProjectId)
  if (project) redirect(`/projects/${project.id}/integrations`)

  return (
    <ProjectRequiredEmpty
      eyebrow="Integrations"
      title="Connect feedback to your workflow"
      description="Create a project, then add Slack, Discord, GitHub, or webhook routing from its workspace."
    />
  )
}
