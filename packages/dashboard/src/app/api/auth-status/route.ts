import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { getAuthStatusCorsHeaders } from '@/lib/auth-status-cors'

export async function GET(request: Request) {
  const headers = getAuthStatusCorsHeaders(request.headers.get('origin'))

  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ user: null }, { headers })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
    }, { headers })
  } catch {
    return NextResponse.json({ user: null }, { headers })
  }
}

export function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: getAuthStatusCorsHeaders(request.headers.get('origin')),
  })
}
