export const CURRENT_PROJECT_COOKIE = 'feedbacks_current_project'

export function getSelectedProject<T extends { id: string }>(
  projects: T[],
  selectedProjectId?: string,
): T | undefined {
  return projects.find((project) => project.id === selectedProjectId) || projects[0]
}
