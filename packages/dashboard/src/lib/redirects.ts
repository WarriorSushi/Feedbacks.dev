const DEFAULT_REDIRECT_PATH = '/dashboard'

export function sanitizeRedirectPath(value: string | null | undefined, fallback = DEFAULT_REDIRECT_PATH) {
  const candidate = value?.trim()
  if (!candidate) return fallback

  if (!candidate.startsWith('/') || candidate.startsWith('//') || candidate.includes('\\')) {
    return fallback
  }

  try {
    const parsed = new URL(candidate, 'https://feedbacks.dev')
    if (parsed.origin !== 'https://feedbacks.dev') return fallback
    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return fallback
  }
}
