import type { NextRequest } from 'next/server'

function getBillingAppOrigin() {
  return (process.env.NEXT_PUBLIC_APP_ORIGIN || 'https://app.feedbacks.dev').replace(/\/+$/, '')
}

export function buildBillingReturnUrl(request: NextRequest, path: '/billing?checkout=return' | '/billing?portal=return') {
  return new URL(path, getBillingAppOrigin() || request.nextUrl.origin).toString()
}
