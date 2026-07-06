import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase-server'
import { evaluateCronHealth } from '@/lib/operational-health'
import { getRequestId, logOperationalEvent } from '@/lib/operational-logging'

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  return Boolean(secret && request.headers.get('authorization') === `Bearer ${secret}`)
}

export async function GET(request: NextRequest) {
  const requestId = getRequestId(request)
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = await createAdminSupabase()
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const [
    cronResult,
    backlogResult,
    oldestResult,
    failedResult,
    deliveredResult,
    submissionResult,
    activationResults,
  ] = await Promise.all([
    admin
      .from('cron_runs')
      .select('job_name, status, started_at, finished_at')
      .order('started_at', { ascending: false })
      .limit(20),
    admin
      .from('webhook_jobs')
      .select('id', { count: 'exact', head: true })
      .in('status', ['pending', 'retrying', 'processing']),
    admin
      .from('webhook_jobs')
      .select('next_attempt_at, status')
      .in('status', ['pending', 'retrying', 'processing'])
      .order('next_attempt_at', { ascending: true })
      .limit(1)
      .maybeSingle(),
    admin
      .from('webhook_jobs')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'failed')
      .gte('updated_at', oneDayAgo),
    admin
      .from('webhook_deliveries')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'success')
      .gte('created_at', oneDayAgo),
    admin
      .from('feedback')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', oneHourAgo),
    Promise.all([
      'project_created',
      'install_code_copied',
      'verification_completed',
      'first_feedback_received',
    ].map((eventName) => admin
      .from('activation_milestones')
      .select('project_id', { count: 'exact', head: true })
      .eq('event_name', eventName))),
  ])

  const databaseError = [cronResult, backlogResult, oldestResult, failedResult, deliveredResult, submissionResult]
    .map((result) => result.error)
    .find(Boolean)
  if (databaseError) {
    logOperationalEvent('error', 'health.database_unavailable', requestId, {
      error: databaseError.message,
    })
    return NextResponse.json(
      { healthy: false, error: 'Health data unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  const cron = evaluateCronHealth(cronResult.data || [])
  const queueBacklog = backlogResult.count || 0
  const failedLast24Hours = failedResult.count || 0
  const deliveredLast24Hours = deliveredResult.count || 0
  const activationAvailable = activationResults.every((result) => !result.error)
  const [projectsCreated, installCodesCopied, verified, reachedFirstFeedback] = activationResults
    .map((result) => result.count || 0)
  const healthy = Object.values(cron).every((job) => job.healthy)
    && queueBacklog < 100
    && failedLast24Hours < 20

  return NextResponse.json({
    healthy,
    checkedAt: new Date().toISOString(),
    cron,
    webhooks: {
      queueBacklog,
      oldestNextAttemptAt: oldestResult.data?.next_attempt_at || null,
      failedLast24Hours,
      deliveredLast24Hours,
    },
    submissions: {
      receivedLastHour: submissionResult.count || 0,
    },
    installation: !activationAvailable
      ? { available: false }
      : {
          available: true,
          projectsCreated,
          installCodesCopied,
          verified,
          reachedFirstFeedback,
        },
  }, {
    status: healthy ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  })
}
