'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  buildRuntimeWidgetConfig,
  getWidgetExpectation,
  getWidgetModeLabel,
  type SavedWidgetConfig,
} from '@feedbacks/shared'
import { readStoredProjectApiKey, rememberProjectApiKey } from '@/lib/project-api-keys'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, ExternalLink, RefreshCw } from 'lucide-react'
import { WidgetPreviewSurface } from './widget-preview-surface'
import { SetupProgress } from './project-flow-nav'

interface ProjectVerifyClientProps {
  appOrigin: string
  projectId: string
  projectKey: string | null
  apiKeyLastFour: string | null
  projectName: string
  savedConfig: SavedWidgetConfig
}

export function ProjectVerifyClient({
  appOrigin,
  projectId,
  projectKey,
  apiKeyLastFour,
  projectName,
  savedConfig,
}: ProjectVerifyClientProps) {
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = React.useState<string | null>(null)
  const [resolvedProjectKey, setResolvedProjectKey] = React.useState<string | null>(projectKey)
  const [verifiedFeedbackId, setVerifiedFeedbackId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (projectKey) {
      rememberProjectApiKey(projectId, projectKey)
      setResolvedProjectKey(projectKey)
      return
    }

    const storedKey = readStoredProjectApiKey(projectId)
    if (storedKey) {
      setResolvedProjectKey(storedKey)
    }
  }, [projectId, projectKey])

  React.useEffect(() => {
    const handleSubmission = (event: Event) => {
      const feedbackId = (event as CustomEvent<{ id?: string }>).detail?.id
      if (feedbackId) {
        setVerifiedFeedbackId(feedbackId)
        void fetch(`/api/projects/${projectId}/activation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'verification_completed' }),
        })
      }
    }

    window.addEventListener('feedbacks:submitted', handleSubmission)
    return () => window.removeEventListener('feedbacks:submitted', handleSubmission)
  }, [projectId])

  const runtimeConfig = React.useMemo(
    () => buildRuntimeWidgetConfig(resolvedProjectKey || 'fb_verify_placeholder', savedConfig, { appOrigin }),
    [appOrigin, resolvedProjectKey, savedConfig],
  )
  const modeLabel = getWidgetModeLabel(runtimeConfig)
  const runtimeExpectation = getWidgetExpectation(runtimeConfig)
  const verifyInstruction = runtimeConfig.embedMode === 'inline'
    ? 'The form should show inside the box below. Fill it out and send one test.'
    : runtimeConfig.embedMode === 'trigger'
      ? 'Click the test button in the box below. Fill out the form and send one test.'
      : `Click the "${runtimeConfig.buttonText || 'Feedback'}" button in the bottom-right corner. Fill out the form and send one test.`

  return (
    <div className="mx-auto max-w-7xl space-y-6" data-tour="verify-surface">
      <SetupProgress projectId={projectId} activeStep="verify" />

      {verifiedFeedbackId && (
        <div className="flex flex-col gap-4 rounded-xl border border-primary/35 bg-primary/[0.08] p-5 sm:flex-row sm:items-center sm:justify-between" role="status">
          <div className="flex min-w-0 gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-semibold text-foreground">Verification reached the inbox</p>
              <p className="mt-1 text-sm text-muted-foreground">
                The project key, saved configuration, submission endpoint, and inbox path are working.
              </p>
            </div>
          </div>
          <Button asChild className="shrink-0">
            <Link href={`/feedback/${verifiedFeedbackId}`}>
              Open verified item
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}

      <div data-tour="verify-guide" className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Test your saved form</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
            This page is a safe test page. It proves your saved form can send feedback. It does not check the code on your own website.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/feedback?projectId=${projectId}`}>
            <Button variant="outline">Open project inbox</Button>
          </Link>
          <Link href={`/projects/${projectId}/feedback-form`}>
            <Button variant="outline">Manage feedback form</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Saved config</Badge>
              <Badge variant="outline">{modeLabel} mode</Badge>
            </div>
            <CardTitle className="text-lg">Do this</CardTitle>
            <CardDescription>
              Send one test. Then check the inbox.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-lg border bg-muted/20 p-4">
              1. Find the form on this page. {verifyInstruction}
            </div>
            <div className="rounded-lg border bg-muted/20 p-4">
              2. Type <span className="font-medium text-foreground">Install test for {projectName}</span>.
            </div>
            <div className="rounded-lg border bg-muted/20 p-4">
              3. When it arrives, open the verified item from the success banner.
            </div>
            <div className="rounded-lg border border-dashed bg-muted/10 p-4">
              {!resolvedProjectKey && 'A fresh project key is required before this hosted page can submit live test feedback.'}
              {resolvedProjectKey && status === 'loading' && 'Loading the live widget runtime…'}
              {resolvedProjectKey && status === 'ready' && `Ready. ${runtimeExpectation}`}
              {resolvedProjectKey && status === 'error' && `The widget could not be loaded: ${error}`}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-lg">Test area</CardTitle>
            <CardDescription>
              Use this area only to test the saved form. To test your real website, paste the install code there and send a test from that site.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="rounded-2xl border bg-background p-6 shadow-sm">
              <div className="max-w-xl space-y-3">
                <p className="text-sm font-medium text-foreground">Saved form test</p>
                <h2 className="text-2xl font-semibold tracking-tight">Send one test message.</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {verifyInstruction}
                </p>
              </div>

              {resolvedProjectKey ? (
                <div className="mt-8 rounded-2xl border border-dashed bg-muted/20 p-6">
                  <WidgetPreviewSurface
                    appOrigin={appOrigin}
                    projectKey={resolvedProjectKey}
                    config={savedConfig}
                    onStatusChange={(nextStatus, nextError) => {
                      setStatus(nextStatus)
                      setError(nextError || null)
                    }}
                  />
                </div>
              ) : (
                <div className="mt-8 rounded-2xl border border-dashed bg-muted/20 p-6">
                  <div className="rounded-xl border border-primary/20 bg-background p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">This key is hidden now.</p>
                    <p className="mt-1">
                      feedbacks.dev only reveals project keys once. Generate a fresh key from the install tab to run hosted verification again{apiKeyLastFour ? ` for the key ending in ${apiKeyLastFour}` : ''}.
                    </p>
                    <div className="mt-3">
                      <Link href={`/projects/${projectId}/install`}>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Open install and rotate key
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                If this page works but your website does not, the saved form is fine. Check where the install code was pasted on your site.
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href={`/feedback?projectId=${projectId}`}>
                <Button>
                  Open project inbox
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/projects/${projectId}/install`}>
                <Button variant="outline">Return to install instructions</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
