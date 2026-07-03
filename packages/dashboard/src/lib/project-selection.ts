export const CURRENT_PROJECT_COOKIE = 'feedbacks_current_project'

export function prioritizeSelectedProject<T extends { id: string }>(
  projects: T[],
  selectedProjectId?: string,
): T[] {
  if (!selectedProjectId) return projects
  const selectedIndex = projects.findIndex((project) => project.id === selectedProjectId)
  if (selectedIndex <= 0) return projects

  return [projects[selectedIndex], ...projects.slice(0, selectedIndex), ...projects.slice(selectedIndex + 1)]
}
