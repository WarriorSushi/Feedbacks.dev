import { NextRequest, NextResponse } from 'next/server'
import { getAuthedUserAndProject } from '@/lib/api-auth'
const headers = { 'Cache-Control': 'no-store' }
export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string; updateId: string }> }) {
  const { id, updateId } = await params; const auth = await getAuthedUserAndProject(id); if ('error' in auth) return auth.error
  const { data, error } = await auth.admin.from('product_updates').update({ status: 'archived' }).eq('project_id', id).eq('id', updateId).select('*').maybeSingle()
  if (error || !data) return NextResponse.json({ error: 'Update not found.' }, { status: 404, headers })
  return NextResponse.json({ update: data }, { headers })
}
