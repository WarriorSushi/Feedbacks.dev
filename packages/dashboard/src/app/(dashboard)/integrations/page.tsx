import { createServerSupabase } from '@/lib/supabase-server'
import { ProjectSurfacePicker, type ProjectSurfaceItem } from '@/components/project-surface-picker'
import type { WebhookConfig } from '@/lib/types'

export const metadata = {
  title: 'Integrations',
}

type IntegrationProject = {
  id: string
  name: string
  domain: string | null
  webhooks: WebhookConfig | null
}

function countActiveEndpoints(webhooks: WebhookConfig | null) {
  if (!webhooks) return 0

  const simpleGroups = [webhooks.slack, webhooks.discord, webhooks.generic]
  const simpleCount = simpleGroups.reduce((total, group) => {
    if (!group) return total
    const endpoints = group.endpoints?.filter((endpoint) => endpoint.enabled).length ?? 0
    const legacyEndpoint = group.enabled && group.url ? 1 : 0
    return total + Math.max(endpoints, legacyEndpoint)
  }, 0)

  const githubCount = webhooks.github?.endpoints?.filter((endpoint) => endpoint.enabled).length ?? 0
  return simpleCount + githubCount
}

export default async function IntegrationsPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, domain, webhooks')
    .eq('owner_user_id', user!.id)
    .order('created_at', { ascending: false })

  const items: ProjectSurfaceItem[] = ((projects as IntegrationProject[] | null) || []).map((project) => {
    const activeEndpoints = countActiveEndpoints(project.webhooks)
    return {
      id: project.id,
      name: project.name,
      domain: project.domain,
      href: `/projects/${project.id}?tab=integrations`,
      status: activeEndpoints === 0 ? 'No active endpoints' : `${activeEndpoints} active endpoint${activeEndpoints === 1 ? '' : 's'}`,
      detail: 'Slack, Discord, GitHub, or webhook routing',
    }
  })

  return (
    <ProjectSurfacePicker
      eyebrow="Integrations"
      title="Pick a project to connect"
      description="Each project has its own routing. Choose one, then add or test the endpoint for that product."
      actionLabel="Open integrations"
      emptyTitle="No projects to connect yet"
      emptyDescription="Create a project first. Then you can route feedback to Slack, Discord, GitHub, or a webhook."
      items={items}
    />
  )
}
