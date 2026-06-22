import type { SupabaseClient } from '@supabase/supabase-js'

type FeedbackStorageRow = {
  screenshot_url: string | null
  attachments: unknown
}

export type FeedbackStoragePaths = {
  screenshots: string[]
  attachments: string[]
}

const SCREENSHOT_BUCKET = 'feedback_screenshots'
const ATTACHMENT_BUCKET = 'feedback_attachments'
const REMOVE_BATCH_SIZE = 100

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

export function extractStoragePathFromPublicUrl(
  publicUrl: string | null | undefined,
  bucket: string,
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL,
) {
  if (!publicUrl) return null

  try {
    const parsed = new URL(publicUrl)
    if (supabaseUrl) {
      const expectedOrigin = new URL(supabaseUrl).origin
      if (parsed.origin !== expectedOrigin) return null
    }

    const prefix = `/storage/v1/object/public/${bucket}/`
    if (!parsed.pathname.startsWith(prefix)) return null

    return decodeURIComponent(parsed.pathname.slice(prefix.length))
  } catch {
    return null
  }
}

export function collectFeedbackStoragePaths(
  rows: FeedbackStorageRow[],
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL,
): FeedbackStoragePaths {
  const screenshots: string[] = []
  const attachments: string[] = []

  for (const row of rows) {
    const screenshotPath = extractStoragePathFromPublicUrl(row.screenshot_url, SCREENSHOT_BUCKET, supabaseUrl)
    if (screenshotPath) screenshots.push(screenshotPath)

    if (!Array.isArray(row.attachments)) continue
    for (const attachment of row.attachments) {
      if (!attachment || typeof attachment !== 'object') continue
      const url = 'url' in attachment && typeof attachment.url === 'string' ? attachment.url : null
      const attachmentPath = extractStoragePathFromPublicUrl(url, ATTACHMENT_BUCKET, supabaseUrl)
      if (attachmentPath) attachments.push(attachmentPath)
    }
  }

  return {
    screenshots: unique(screenshots),
    attachments: unique(attachments),
  }
}

async function removeBucketObjects(admin: SupabaseClient, bucket: string, paths: string[]) {
  for (let i = 0; i < paths.length; i += REMOVE_BATCH_SIZE) {
    const batch = paths.slice(i, i + REMOVE_BATCH_SIZE)
    const { error } = await admin.storage.from(bucket).remove(batch)
    if (error) throw error
  }
}

export async function cleanupFeedbackStorageForProjectIds(admin: SupabaseClient, projectIds: string[]) {
  const ids = unique(projectIds)
  if (ids.length === 0) return { screenshots: 0, attachments: 0 }

  const { data, error } = await admin
    .from('feedback')
    .select('screenshot_url, attachments')
    .in('project_id', ids)

  if (error) throw error

  const paths = collectFeedbackStoragePaths((data ?? []) as FeedbackStorageRow[])

  await removeBucketObjects(admin, SCREENSHOT_BUCKET, paths.screenshots)
  await removeBucketObjects(admin, ATTACHMENT_BUCKET, paths.attachments)

  return {
    screenshots: paths.screenshots.length,
    attachments: paths.attachments.length,
  }
}

export async function cleanupFeedbackStorageForUserProjects(admin: SupabaseClient, userId: string) {
  const { data, error } = await admin
    .from('projects')
    .select('id')
    .eq('owner_user_id', userId)

  if (error) throw error

  const projectIds = (data ?? [])
    .map((project) => (typeof project.id === 'string' ? project.id : null))
    .filter((id): id is string => Boolean(id))

  return cleanupFeedbackStorageForProjectIds(admin, projectIds)
}
