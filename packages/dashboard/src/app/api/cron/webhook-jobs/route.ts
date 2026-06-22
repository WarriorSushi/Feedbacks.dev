import { NextRequest, NextResponse } from 'next/server'
import { finishCronRun, startCronRun } from '@/lib/cron-runs'
import { createAdminSupabase } from '@/lib/supabase-server'
import { processWebhookDigests, processWebhookJobs } from '@/lib/webhook-delivery'

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false

  const authHeader = request.headers.get('authorization')
  return authHeader === `Bearer ${secret}`
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let admin: Awaited<ReturnType<typeof createAdminSupabase>> | null = null
  let cronRunId: string | null = null

  try {
    admin = await createAdminSupabase()
    cronRunId = await startCronRun(admin, 'webhook_jobs')
    const processed = await processWebhookJobs({ limit: 50 })
    const digestProcessed = await processWebhookDigests({ limit: 100 })
    await finishCronRun(admin, cronRunId, {
      status: 'succeeded',
      processedCount: processed.length + digestProcessed.reduce((sum, digest) => sum + digest.itemCount, 0),
      metadata: {
        deliveryStatuses: processed.map((job) => job.status),
        digestStatuses: digestProcessed.map((digest) => ({
          status: digest.status,
          itemCount: digest.itemCount,
        })),
      },
    })
    return NextResponse.json({ processed, digestProcessed })
  } catch (error) {
    if (admin) {
      await finishCronRun(admin, cronRunId, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Internal server error',
      })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
