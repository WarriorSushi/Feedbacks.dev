import { createServerSupabase } from '@/lib/supabase-server'
import { ProjectSurfacePicker, type ProjectSurfaceItem } from '@/components/project-surface-picker'
import { cookies } from 'next/headers'
import { CURRENT_PROJECT_COOKIE, prioritizeSelectedProject } from '@/lib/project-selection'

export const metadata = {
  title: 'API',
}

type ApiProject = {
  id: string
  name: string
  domain: string | null
  api_key_last_four: string | null
}

export default async function ApiDocsIndexPage() {
  const cookieStore = await cookies()
  const preferredProjectId = cookieStore.get(CURRENT_PROJECT_COOKIE)?.value
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, domain, api_key_last_four')
    .eq('owner_user_id', user!.id)
    .order('created_at', { ascending: false })

  const orderedProjects = prioritizeSelectedProject((projects as ApiProject[] | null) || [], preferredProjectId)
  const currentProjectId = orderedProjects[0]?.id
  const items: ProjectSurfaceItem[] = orderedProjects.map((project) => ({
    id: project.id,
    name: project.name,
    domain: project.domain,
    href: `/projects/${project.id}?tab=api`,
    status: project.api_key_last_four ? `Key ends in ${project.api_key_last_four}` : 'Key hidden',
    detail: 'REST examples, project routes, and agent tools',
  }))

  return (
    <ProjectSurfacePicker
      eyebrow="API"
      title="Pick a project for API docs"
      description="API keys and examples are project-specific. Choose the project you want to connect from your backend or agent."
      actionLabel="Open API"
      emptyTitle="No project API yet"
      emptyDescription="Create a project first. Then the API page will show the right key, routes, and examples."
      items={items}
      preferredProjectId={currentProjectId}
    />
  )
}
