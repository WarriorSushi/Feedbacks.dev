import { NextRequest, NextResponse } from 'next/server'
import { getAuthedUserAndProject } from '@/lib/api-auth'
import { publicImageUrl } from '@/lib/product-update-service'
import { readRequestBodyWithLimit, RequestBodyTooLargeError } from '@/lib/request-body-limit'

const headers = { 'Cache-Control': 'no-store' }
const extensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
function looksLikeImage(bytes: Uint8Array, type: string): boolean {
  if (type === 'image/png') return bytes.length >= 8 && bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71
  if (type === 'image/jpeg') return bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
  return type === 'image/webp' && bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
}
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; updateId: string }> }) {
  const { id, updateId } = await params; const auth = await getAuthedUserAndProject(id); if ('error' in auth) return auth.error
  let bytes: Uint8Array; try { bytes = await readRequestBodyWithLimit(request, 2 * 1024 * 1024) } catch (error) { return NextResponse.json({ error: error instanceof RequestBodyTooLargeError ? 'Image exceeds 2 MB.' : 'Unable to read image.' }, { status: 413, headers }) }
  const contentType = request.headers.get('content-type')?.split(';')[0] || ''
  if (bytes.byteLength > 2 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(contentType) || !looksLikeImage(bytes, contentType)) return NextResponse.json({ error: 'Use a JPEG, PNG, or WebP image up to 2 MB.' }, { status: 400, headers })
  const { data: update } = await auth.admin.from('product_updates').select('image_path').eq('project_id', id).eq('id', updateId).maybeSingle()
  if (!update) return NextResponse.json({ error: 'Update not found.' }, { status: 404, headers })
  const path = `${id}/${updateId}/${crypto.randomUUID()}.${extensions[contentType]}`
  const { error: uploadError } = await auth.admin.storage.from('product_update_images').upload(path, bytes, { contentType, upsert: false })
  if (uploadError) return NextResponse.json({ error: 'Unable to upload image.' }, { status: 500, headers })
  const { data, error } = await auth.admin.from('product_updates').update({ image_path: path }).eq('project_id', id).eq('id', updateId).select('*').single()
  if (error) { await auth.admin.storage.from('product_update_images').remove([path]); return NextResponse.json({ error: 'Unable to save image.' }, { status: 500, headers }) }
  if (update.image_path) await auth.admin.storage.from('product_update_images').remove([update.image_path])
  return NextResponse.json({ update: { ...data, imageUrl: publicImageUrl(auth.admin, path) } }, { headers })
}
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string; updateId: string }> }) {
  const { id, updateId } = await params; const auth = await getAuthedUserAndProject(id); if ('error' in auth) return auth.error
  const { data: update } = await auth.admin.from('product_updates').select('image_path').eq('project_id', id).eq('id', updateId).maybeSingle()
  if (!update) return NextResponse.json({ error: 'Update not found.' }, { status: 404, headers })
  const { error } = await auth.admin.from('product_updates').update({ image_path: null }).eq('project_id', id).eq('id', updateId)
  if (error) return NextResponse.json({ error: 'Unable to remove image.' }, { status: 500, headers })
  if (update.image_path) await auth.admin.storage.from('product_update_images').remove([update.image_path])
  return new NextResponse(null, { status: 204, headers })
}
