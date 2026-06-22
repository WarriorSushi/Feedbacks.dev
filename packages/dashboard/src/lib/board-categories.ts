export const CURATED_BOARD_CATEGORIES = [
  'developer-tools',
  'saas',
  'analytics',
  'productivity',
  'design-tools',
  'ai',
  'infrastructure',
  'security',
  'billing',
  'open-source',
  'mobile',
  'ecommerce',
] as const

const CATEGORY_ALIASES: Record<string, string> = {
  devtools: 'developer-tools',
  developer: 'developer-tools',
  developers: 'developer-tools',
  'dev-tools': 'developer-tools',
  'design-tool': 'design-tools',
  infra: 'infrastructure',
  ecommerce: 'ecommerce',
  'e-commerce': 'ecommerce',
  opensource: 'open-source',
  'open source': 'open-source',
}

const CATEGORY_LABELS: Record<string, string> = {
  ai: 'AI',
  analytics: 'Analytics',
  billing: 'Billing',
  'design-tools': 'Design tools',
  'developer-tools': 'Developer tools',
  ecommerce: 'Ecommerce',
  infrastructure: 'Infrastructure',
  mobile: 'Mobile',
  'open-source': 'Open source',
  productivity: 'Productivity',
  saas: 'SaaS',
  security: 'Security',
}

export interface BoardCategoryOption {
  value: string
  label: string
  count: number
}

export function normalizeBoardCategory(input: string): string | null {
  const normalized = input
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)

  if (!normalized) return null
  return CATEGORY_ALIASES[normalized] || normalized
}

export function normalizeBoardCategories(input: unknown, limit = 8): string[] | undefined {
  if (!Array.isArray(input)) return undefined

  const categories = input
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => normalizeBoardCategory(entry))
    .filter((entry): entry is string => Boolean(entry))

  const deduped = [...new Set(categories)].slice(0, limit)
  return deduped.length > 0 ? deduped : undefined
}

export function getBoardCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] || category.split('-').map((part) => (
    part.length <= 2 ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1)
  )).join(' ')
}

export function buildDirectoryCategoryOptions(categoryLists: string[][]): BoardCategoryOption[] {
  const counts = new Map<string, number>()

  categoryLists.forEach((categories) => {
    const normalizedCategories = categories
      .map((category) => normalizeBoardCategory(category))
      .filter((category): category is string => Boolean(category))
    const uniqueCategories = new Set(normalizedCategories)
    uniqueCategories.forEach((category) => {
      counts.set(category, (counts.get(category) || 0) + 1)
    })
  })

  return [...counts.entries()]
    .map(([value, count]) => ({
      value,
      count,
      label: getBoardCategoryLabel(value),
    }))
    .sort((a, b) => {
      const countDiff = b.count - a.count
      if (countDiff !== 0) return countDiff

      const curatedDiff =
        Number(CURATED_BOARD_CATEGORIES.includes(b.value as (typeof CURATED_BOARD_CATEGORIES)[number])) -
        Number(CURATED_BOARD_CATEGORIES.includes(a.value as (typeof CURATED_BOARD_CATEGORIES)[number]))
      if (curatedDiff !== 0) return curatedDiff

      return a.label.localeCompare(b.label)
    })
    .slice(0, 12)
}
