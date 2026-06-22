/** @type {import('next').NextConfig} */
function normalizeOrigin(value) {
  return (value || '').replace(/\/+$/, '')
}

function buildCspReportOnlyHeader() {
  const appOrigin = normalizeOrigin(process.env.NEXT_PUBLIC_APP_ORIGIN || 'https://app.feedbacks.dev')
  const supabaseOrigin = normalizeOrigin(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const supabaseWsOrigin = supabaseOrigin.replace(/^https:/, 'wss:')
  const dodoOrigin = process.env.DODO_PAYMENTS_ENVIRONMENT === 'live'
    ? 'https://live.dodopayments.com'
    : 'https://test.dodopayments.com'

  const connectSources = [
    "'self'",
    appOrigin,
    supabaseOrigin,
    supabaseWsOrigin,
    dodoOrigin,
  ].filter(Boolean)

  const imageSources = [
    "'self'",
    'data:',
    'blob:',
    supabaseOrigin,
  ].filter(Boolean)

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    `img-src ${imageSources.join(' ')}`,
    "font-src 'self' data:",
    `connect-src ${connectSources.join(' ')}`,
    "worker-src 'self' blob:",
    "frame-src 'self'",
    'report-uri /api/security/csp-report',
  ].join('; ')
}

const securityHeaders = [
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy-Report-Only',
    value: buildCspReportOnlyHeader(),
  },
]

const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  transpilePackages: ['@feedbacks/shared'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
