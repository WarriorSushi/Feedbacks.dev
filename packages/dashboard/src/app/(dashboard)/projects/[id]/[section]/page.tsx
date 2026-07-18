import { createServerSupabase } from '@/lib/supabase-server'
import { getCurrentUserBillingSummary } from '@/lib/billing'
import { notFound } from 'next/navigation'
import type { Project } from '@/lib/types'
import { PROJECT_ROUTE_SECTIONS, type ProjectRouteSection } from '@/lib/project-routes'
import { ProjectTabs, type ProjectTab } from '../project-tabs'

export const dynamic = 'force-dynamic'

export default async function ProjectSectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; section: string }>
  searchParams: Promise<{ view?: string }>
}) {
  const [{ id, section }, { view }] = await Promise.all([params, searchParams])
  if (!PROJECT_ROUTE_SECTIONS.includes(section as ProjectRouteSection)) notFound()

  const supabase = await createServerSupabase()
  const { data: project } = await supabase.from('projects').select('*').eq('id', id).single()
  if (!project) notFound()

  const initialTab: ProjectTab = section === 'install' && view === 'customize' ? 'customize' : section as ProjectTab
  const billingSummary = await getCurrentUserBillingSummary()
  return <ProjectTabs project={project as Project} billingSummary={billingSummary} initialTab={initialTab} />
}
