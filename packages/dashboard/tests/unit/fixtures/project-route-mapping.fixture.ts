export const LEGACY_PROJECT_ROUTE_MAPPINGS = [
  { tab: 'install', futurePath: '/projects/{projectId}/install' },
  { tab: 'customize', futurePath: '/projects/{projectId}/install?view=customize' },
  { tab: 'integrations', futurePath: '/projects/{projectId}/integrations' },
  { tab: 'board', futurePath: '/projects/{projectId}/board' },
  { tab: 'updates', futurePath: '/projects/{projectId}/updates' },
  { tab: 'api', futurePath: '/projects/{projectId}/api' },
  { tab: 'settings', futurePath: '/projects/{projectId}/settings' },
] as const

export type LegacyProjectTab = typeof LEGACY_PROJECT_ROUTE_MAPPINGS[number]['tab']
