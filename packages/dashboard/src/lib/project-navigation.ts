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
  if (pathname === '/integrations') return `/projects/${encodedProjectId}?tab=integrations`
  if (pathname === '/api-docs') return `/projects/${encodedProjectId}?tab=api`
  if (/^\/projects\/[^/]+/.test(pathname) && activeProjectTab) {
    return `/projects/${encodedProjectId}?tab=${encodeURIComponent(activeProjectTab)}`
  }
  return `/projects/${encodedProjectId}`
}
