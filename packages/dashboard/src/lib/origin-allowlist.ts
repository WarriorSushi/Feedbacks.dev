export interface WidgetOriginRestriction {
  enabled?: boolean
  origins?: string[]
}

interface HeaderCarrier {
  headers: {
    get(name: string): string | null
  }
}

interface OriginCheckOptions {
  trustedOrigins?: string[]
}

function dedupe(values: string[]): string[] {
  return Array.from(new Set(values))
}

export function normalizeAllowedOrigin(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed || trimmed.includes('*')) return null

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`

  try {
    const url = new URL(candidate)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
    if (!url.hostname || url.username || url.password) return null
    if (url.pathname !== '/' || url.search || url.hash) return null
    return url.origin
  } catch {
    return null
  }
}

export function parseAllowedOrigins(value: string): string[] {
  return dedupe(
    value
      .split(/[\n,]+/)
      .map((entry) => normalizeAllowedOrigin(entry))
      .filter((entry): entry is string => Boolean(entry)),
  )
}

export function sanitizeWidgetOriginRestriction(value: unknown): WidgetOriginRestriction {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { enabled: false, origins: [] }
  }

  const source = value as Record<string, unknown>
  const rawOrigins = Array.isArray(source.origins)
    ? source.origins
    : typeof source.origins === 'string'
      ? source.origins.split(/[\n,]+/)
      : []
  const origins = dedupe(
    rawOrigins
      .map((entry) => normalizeAllowedOrigin(entry))
      .filter((entry): entry is string => Boolean(entry)),
  ).slice(0, 20)

  return {
    enabled: Boolean(source.enabled) && origins.length > 0,
    origins,
  }
}

function originFromHeader(value: string | null): string | null {
  if (!value) return null
  return normalizeAllowedOrigin(value)
}

function originFromReferer(value: string | null): string | null {
  if (!value) return null

  try {
    const url = new URL(value)
    return normalizeAllowedOrigin(url.origin)
  } catch {
    return null
  }
}

export function isWidgetRequestOriginAllowed(
  request: HeaderCarrier,
  restriction: WidgetOriginRestriction | null | undefined,
  options: OriginCheckOptions = {},
): boolean {
  if (!restriction?.enabled || !restriction.origins?.length) return true

  const allowedOrigins = dedupe([
    ...restriction.origins.map((origin) => normalizeAllowedOrigin(origin)).filter((origin): origin is string => Boolean(origin)),
    ...(options.trustedOrigins || [])
      .map((origin) => normalizeAllowedOrigin(origin))
      .filter((origin): origin is string => Boolean(origin)),
  ])

  if (!allowedOrigins.length) return true

  const requestOrigin =
    originFromHeader(request.headers.get('origin')) ||
    originFromReferer(request.headers.get('referer'))

  return Boolean(requestOrigin && allowedOrigins.includes(requestOrigin))
}
