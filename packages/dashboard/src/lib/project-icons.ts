export const PROJECT_ICONS = [
  { emoji: '🚀', label: 'Rocket' },
  { emoji: '💬', label: 'Conversation' },
  { emoji: '🧩', label: 'Puzzle' },
  { emoji: '🛠️', label: 'Tools' },
  { emoji: '📦', label: 'Package' },
  { emoji: '🌐', label: 'Website' },
  { emoji: '📱', label: 'Mobile app' },
  { emoji: '🛒', label: 'Store' },
  { emoji: '🎨', label: 'Design' },
  { emoji: '📊', label: 'Analytics' },
  { emoji: '🤖', label: 'AI' },
  { emoji: '🧪', label: 'Experiment' },
] as const

export const DEFAULT_PROJECT_ICON = PROJECT_ICONS[0].emoji

export function isProjectIcon(value: unknown): value is (typeof PROJECT_ICONS)[number]['emoji'] {
  return typeof value === 'string' && PROJECT_ICONS.some((icon) => icon.emoji === value)
}
