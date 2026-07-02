const TRUSTED_MARKETING_ORIGINS = new Set([
  'https://feedbacks.dev',
  'https://www.feedbacks.dev',
])

export function getAuthStatusCorsHeaders(origin: string | null): HeadersInit {
  if (!origin || !TRUSTED_MARKETING_ORIGINS.has(origin)) return {}

  return {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}
