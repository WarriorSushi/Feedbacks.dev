export function getProjectDestination({
  projectId,
  pathname,
  activeProjectTab,
}: {
  projectId: string
  pathname: string
  activeProjectTab?: string | null
}): string {
  const encodedProjectId = encodeURIComponent(projectId)
  if (pathname === '/dashboard/boards') return `/dashboard/boards?project=${encodedProjectId}`
  if (pathname === '/dashboard') return `/dashboard?project=${encodedProjectId}`
  if (pathname === '/feedback') return `/feedback?projectId=${encodedProjectId}`
  if (pathname === '/integrations') return getProjectRoute(projectId, 'integrations')
  if (pathname === '/api-docs') return getProjectRoute(projectId, 'api')
  const section = getProjectRouteSection(pathname)
  if (section) return getProjectRoute(projectId, section)
  if (/^\/projects\/[^/]+/.test(pathname) && activeProjectTab) {
    if (activeProjectTab === 'customize') return `${getProjectRoute(projectId, 'install')}?view=customize`
    return getProjectRoute(projectId, activeProjectTab as Parameters<typeof getProjectRoute>[1])
  }
  return `/projects/${encodedProjectId}`
}
type ProjectRouteSection = 'install' | 'integrations' | 'board' | 'updates' | 'api' | 'settings'

function getProjectRoute(projectId: string, section: ProjectRouteSection): string {
  return `/projects/${encodeURIComponent(projectId)}/${section}`
}

function getProjectRouteSection(pathname: string): ProjectRouteSection | null {
  const match = pathname.match(/^\/projects\/[^/]+\/(install|integrations|board|updates|api|settings)(?:\/|$)/)
  return match?.[1] as ProjectRouteSection | undefined || null
}
