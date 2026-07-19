export const PROJECT_ROUTE_SECTIONS = [
  'install',
  'integrations',
  'board',
  'updates',
  'api',
  'settings',
] as const

export type ProjectRouteSection = typeof PROJECT_ROUTE_SECTIONS[number]

const LEGACY_TAB_DESTINATIONS: Record<string, { section: ProjectRouteSection; search?: Record<string, string> }> = {
  install: { section: 'install' },
  customize: { section: 'install', search: { view: 'customize' } },
  integrations: { section: 'integrations' },
  board: { section: 'board' },
  updates: { section: 'updates' },
  api: { section: 'api' },
  settings: { section: 'settings' },
}

export function getProjectRoute(projectId: string, section: ProjectRouteSection): string {
  return `/projects/${encodeURIComponent(projectId)}/${section}`
}

export function getProjectRouteSection(pathname: string): ProjectRouteSection | null {
  const match = pathname.match(/^\/projects\/[^/]+\/(install|integrations|board|updates|api|settings)(?:\/|$)/)
  return match?.[1] as ProjectRouteSection | undefined || null
}

export function getLegacyProjectTabRedirect(url: URL): string | null {
  const match = url.pathname.match(/^\/projects\/([^/]+)$/)
  const tab = url.searchParams.get('tab')
  const destination = tab ? LEGACY_TAB_DESTINATIONS[tab] : undefined
  if (!match || !destination) return null

  const search = new URLSearchParams(url.searchParams)
  search.delete('tab')
  Object.entries(destination.search || {}).forEach(([key, value]) => search.set(key, value))
  const pathname = getProjectRoute(decodeURIComponent(match[1]), destination.section)
  const query = search.toString()
  return query ? `${pathname}?${query}` : pathname
}
