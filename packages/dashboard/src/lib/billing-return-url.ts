import type { NextRequest } from 'next/server'

export function buildBillingReturnUrl(request: NextRequest, path: '/billing?checkout=return' | '/billing?portal=return') {
  return new URL(path, request.nextUrl.origin).toString()
}
