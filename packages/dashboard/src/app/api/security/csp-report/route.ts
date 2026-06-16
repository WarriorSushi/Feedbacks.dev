import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || ''
    const body = contentType.includes('json') || contentType.includes('csp-report')
      ? await request.json()
      : await request.text()

    console.warn('[security] CSP report-only violation', body)
  } catch (error) {
    console.warn('[security] Failed to parse CSP report', error)
  }

  return new NextResponse(null, { status: 204 })
}
