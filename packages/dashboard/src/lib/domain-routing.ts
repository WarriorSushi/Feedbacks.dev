const DEFAULT_APP_ORIGIN = 'https://app.feedbacks.dev'
const DEFAULT_MARKETING_ORIGIN = 'https://www.feedbacks.dev'
const APEX_HOST = 'feedbacks.dev'

const APP_SURFACE_PREFIXES = [
  '/auth',
  '/dashboard',
  '/projects',
  '/feedback',
  '/settings',
  '/billing',
  '/integrations',
  '/api-docs',
]

const PROTECTED_APP_PREFIXES = APP_SURFACE_PREFIXES.filter((prefix) => prefix !== '/auth')
const MARKETING_SURFACE_PREFIXES = ['/', '/boards', '/privacy', '/terms']

function normalizeOrigin(value: string | undefined, fallback: string) {
  return (value || fallback).replace(/\/+$/, '')
}

function hostFromOrigin(origin: string) {
  return new URL(origin).hostname.toLowerCase()
}

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

function isKnownProductionHost(hostname: string, appHost: string, marketingHost: string) {
  return hostname === appHost || hostname === marketingHost || hostname === APEX_HOST
}

function withCanonicalOrigin(url: URL, origin: string, pathname = url.pathname) {
  const nextUrl = new URL(url.toString())
  const canonical = new URL(origin)
  nextUrl.protocol = canonical.protocol
  nextUrl.hostname = canonical.hostname
  nextUrl.port = canonical.port
  nextUrl.pathname = pathname
  return nextUrl
}

export function getAppOrigin() {
  return normalizeOrigin(process.env.NEXT_PUBLIC_APP_ORIGIN, DEFAULT_APP_ORIGIN)
}

export function getMarketingOrigin() {
  return normalizeOrigin(
    process.env.NEXT_PUBLIC_MARKETING_ORIGIN || process.env.NEXT_PUBLIC_SITE_ORIGIN,
    DEFAULT_MARKETING_ORIGIN,
  )
}

export function isAppSurfacePath(pathname: string) {
  return APP_SURFACE_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix))
}

export function isProtectedAppPath(pathname: string) {
  return PROTECTED_APP_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix))
}

export function isMarketingSurfacePath(pathname: string) {
  return MARKETING_SURFACE_PREFIXES.some((prefix) => {
    if (prefix === '/') return pathname === '/'
    return matchesPrefix(pathname, prefix)
  })
}

export function getCanonicalHostRedirect(url: URL, authenticated?: boolean) {
  const appOrigin = getAppOrigin()
  const marketingOrigin = getMarketingOrigin()
  const appHost = hostFromOrigin(appOrigin)
  const marketingHost = hostFromOrigin(marketingOrigin)
  const currentHost = url.hostname.toLowerCase()

  if (!isKnownProductionHost(currentHost, appHost, marketingHost)) {
    return null
  }

  if (currentHost === appHost) {
    if (url.pathname === '/') {
      return withCanonicalOrigin(url, appOrigin, authenticated ? '/dashboard' : '/auth')
    }

    if (isMarketingSurfacePath(url.pathname)) {
      return withCanonicalOrigin(url, marketingOrigin)
    }

    return null
  }

  if (isAppSurfacePath(url.pathname)) {
    return withCanonicalOrigin(url, appOrigin)
  }

  if (currentHost === APEX_HOST) {
    return withCanonicalOrigin(url, marketingOrigin)
  }

  return null
}
