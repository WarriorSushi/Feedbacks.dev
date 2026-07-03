'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  buildFeedbackApiUrl,
  buildRuntimeWidgetConfig,
  generateInstallSnippets,
  getWidgetExpectation,
  getWidgetModeLabel,
  type InstallSnippet,
  buildWidgetScriptUrl,
} from '@feedbacks/shared'
import type { Project } from '@/lib/types'
import { publicEnv } from '@/lib/public-env'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CodeSnippet } from '@/components/code-snippet'
import { CopyButton } from '@/components/copy-button'
import { Badge } from '@/components/ui/badge'
import { Bot, ExternalLink, Loader2, RefreshCw, Sparkles, XCircle } from 'lucide-react'

interface InstallTabProps {
  project: Project
  projectKey: string | null
  apiKeyLastFour: string | null
  rotatingApiKey: boolean
  onRotateApiKey: () => Promise<void>
}

interface SetupTokenStatus {
  token_id: string
  expires_at: string
  revoked_at: string | null
  created_at: string
}

interface ProjectSetupStatus {
  totalFeedback: number
  newFeedback: number
}

type InstallPlatform = 'website' | 'wordpress' | 'html-block' | 'react' | 'next' | 'vue' | 'mobile'

export function InstallTab({
  project,
  projectKey,
  apiKeyLastFour,
  rotatingApiKey,
  onRotateApiKey,
}: InstallTabProps) {
  const [setupPacket, setSetupPacket] = React.useState<{ tokenId: string; packetUrl: string; expiresAt: string } | null>(null)
  const [setupPacketLoading, setSetupPacketLoading] = React.useState(false)
  const [setupTokensLoading, setSetupTokensLoading] = React.useState(false)
  const [revokingTokenId, setRevokingTokenId] = React.useState<string | null>(null)
  const [setupPacketError, setSetupPacketError] = React.useState<string | null>(null)
  const [setupTokens, setSetupTokens] = React.useState<SetupTokenStatus[]>([])
  const [projectSetupStatus, setProjectSetupStatus] = React.useState<ProjectSetupStatus | null>(null)
  const [activePlatform, setActivePlatform] = React.useState<InstallPlatform>('website')
  const appOrigin = publicEnv.NEXT_PUBLIC_APP_ORIGIN
  const savedConfig = React.useMemo(
    () => project.settings?.widget_config || {},
    [project.settings?.widget_config],
  )
  const snippets = React.useMemo<InstallSnippet[]>(
    () =>
      projectKey
        ? generateInstallSnippets({
          projectKey,
          savedConfig,
          appOrigin,
        })
        : [],
    [appOrigin, projectKey, savedConfig],
  )
  const websiteSnippet = snippets.find((snippet) => snippet.label === 'Website')?.code || ''
  const reactSnippet = snippets.find((snippet) => snippet.label === 'React')?.code || ''
  const vueSnippet = snippets.find((snippet) => snippet.label === 'Vue')?.code || ''
  const widgetScriptUrl = buildWidgetScriptUrl(appOrigin)
  const feedbackApiUrl = buildFeedbackApiUrl(appOrigin)
  const cspSnippet = `default-src 'self';\nscript-src 'self' ${new URL(widgetScriptUrl).origin};\nconnect-src 'self' ${new URL(feedbackApiUrl).origin};\nstyle-src 'self' 'unsafe-inline';\nimg-src 'self' data: blob:;`
  const sriCommand = `node -e "const fs=require('node:fs');const crypto=require('node:crypto');const file='packages/dashboard/public/widget/latest.js';const hash=crypto.createHash('sha384').update(fs.readFileSync(file)).digest('base64');console.log('integrity=\\\"sha384-'+hash+'\\\"')"`
  const runtimeConfig = React.useMemo(
    () => buildRuntimeWidgetConfig(projectKey || 'fb_install_preview', savedConfig, { appOrigin }),
    [appOrigin, projectKey, savedConfig],
  )
  const modeLabel = getWidgetModeLabel(runtimeConfig)
  const expectedResult = getWidgetExpectation(runtimeConfig)
  const verifyInstruction = runtimeConfig.embedMode === 'inline'
    ? 'After you paste the code, open the page where you placed the form. Fill it out and send one test.'
    : runtimeConfig.embedMode === 'trigger'
      ? `After you paste the code, open your site and click your own feedback button. Fill out the form and send one test.`
      : `After you paste the code, open your site and click the "${runtimeConfig.buttonText || 'Feedback'}" button. Fill out the form and send one test.`
  const agentSetupPrompt = React.useMemo(() => {
    const setupPacket = {
      project: {
        id: project.id,
        name: project.name,
        publicKey: projectKey || 'generate-a-fresh-project-key-first',
        domain: project.domain || null,
      },
      widget: {
        recommendedPath: 'Website snippet first. Use React or Vue only when the app shell clearly needs it.',
        endpoint: feedbackApiUrl,
        scriptUrl: widgetScriptUrl,
        mode: modeLabel,
        expectedResult,
        snippets: snippets.reduce<Record<string, string>>((acc, snippet) => {
          acc[snippet.label] = snippet.code
          return acc
        }, {}),
      },
      verification: {
        url: `${appOrigin}/projects/${project.id}/verify`,
        instructions: [
          'Install the recommended Website snippet in the app shell or global HTML.',
          'Run the app locally and confirm the feedback UI appears.',
          'Submit one test report from a real page.',
          'Open the project inbox and confirm the report includes URL and browser context.',
        ],
      },
      safety: [
        'Do not expose private API keys in browser code.',
        'Keep the first install minimal before changing advanced settings.',
        'If the hosted verification works but the app does not, inspect snippet placement first.',
      ],
    }

    return `Use this feedbacks.dev setup packet to add feedback collection to my app.

Goals:
1. Install the recommended Website snippet unless the app has a clearer React or Vue integration point.
2. Keep the first pass minimal.
3. Do not expose private API keys.
4. Run the app locally and confirm the feedback UI appears.
5. Submit one test report and tell me whether it appears in the feedbacks.dev inbox.

Setup packet:
${JSON.stringify(setupPacket, null, 2)}`
  }, [appOrigin, expectedResult, feedbackApiUrl, modeLabel, project.domain, project.id, project.name, projectKey, snippets, widgetScriptUrl])

  const loadSetupTokens = React.useCallback(async () => {
    setSetupTokensLoading(true)
    try {
      const response = await fetch(`/api/projects/${project.id}/setup-token`, { cache: 'no-store' })
      if (!response.ok) return
      const payload = await response.json()
      setSetupTokens(Array.isArray(payload.tokens) ? payload.tokens : [])
    } finally {
      setSetupTokensLoading(false)
    }
  }, [project.id])

  React.useEffect(() => {
    void loadSetupTokens()
  }, [loadSetupTokens])

  const loadProjectSetupStatus = React.useCallback(async () => {
    const response = await fetch(`/api/projects/${project.id}`, { cache: 'no-store' })
    if (!response.ok) return
    const payload = await response.json()
    setProjectSetupStatus(payload.stats || null)
  }, [project.id])

  React.useEffect(() => {
    void loadProjectSetupStatus()
  }, [loadProjectSetupStatus])

  const createSetupPacketLink = async () => {
    if (!projectKey) {
      setSetupPacketError('Generate a fresh project key before creating a setup packet link.')
      return
    }

    setSetupPacketLoading(true)
    setSetupPacketError(null)
    try {
      const response = await fetch(`/api/projects/${project.id}/setup-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectKey }),
      })
      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to create setup packet link')
      }
      setSetupPacket({
        tokenId: payload.tokenId,
        packetUrl: payload.packetUrl,
        expiresAt: payload.expiresAt,
      })
      await loadSetupTokens()
    } catch (error) {
      setSetupPacketError(error instanceof Error ? error.message : 'Failed to create setup packet link')
    } finally {
      setSetupPacketLoading(false)
    }
  }

  const revokeSetupToken = async (tokenId: string) => {
    setRevokingTokenId(tokenId)
    setSetupPacketError(null)
    try {
      const response = await fetch(`/api/projects/${project.id}/setup-token`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to revoke setup token')
      }
      if (setupPacket?.tokenId === tokenId) {
        setSetupPacket(null)
      }
      await loadSetupTokens()
    } catch (error) {
      setSetupPacketError(error instanceof Error ? error.message : 'Failed to revoke setup token')
    } finally {
      setRevokingTokenId(null)
    }
  }

  const activeSetupTokens = setupTokens.filter((token) => {
    return !token.revoked_at && new Date(token.expires_at).getTime() > Date.now()
  })
  const installSteps = [
    {
      title: 'Choose platform',
      body: 'Pick the environment where this widget will run.',
    },
    {
      title: 'Copy code',
      body: 'Use the code block only. Placement notes stay outside it.',
    },
    {
      title: 'Verify one message',
      body: 'Submit a test item and confirm it reaches the inbox.',
    },
  ]
  const nextSnippet = projectKey ? `"use client"

import Script from "next/script"

export function FeedbacksWidgetScript() {
  return (
    <Script
      src="${widgetScriptUrl}"
      data-project="${projectKey}"
      data-api-url="${feedbackApiUrl}"
      strategy="afterInteractive"
    />
  )
}` : ''
  const installTargets: Array<{
    id: InstallPlatform
    label: string
    title: string
    body: string
    code: string | null
    language: string
    placement: string
    expected: string
  }> = [
    {
      id: 'website',
      label: 'Website',
      title: 'Website script',
      body: 'Best for plain HTML, app shells, templates, and global custom-code fields.',
      code: websiteSnippet,
      language: 'html',
      placement: 'Paste before the closing body tag, or in a site-wide footer/custom-code field.',
      expected: expectedResult,
    },
    {
      id: 'wordpress',
      label: 'WordPress',
      title: 'WordPress script',
      body: 'Use the same Website script, installed through a footer/header code tool.',
      code: websiteSnippet,
      language: 'html',
      placement: 'Use a site-wide footer injection plugin, theme footer, or custom-code area. A page HTML block may only load on that page.',
      expected: expectedResult,
    },
    {
      id: 'html-block',
      label: 'HTML block',
      title: 'HTML block script',
      body: 'Works only when the builder allows raw scripts in the block.',
      code: websiteSnippet,
      language: 'html',
      placement: 'Prefer global custom code. If using a block, publish the live page and confirm the builder did not strip or sandbox the script.',
      expected: expectedResult,
    },
    {
      id: 'react',
      label: 'React',
      title: 'React component',
      body: 'Use when your web app has a React root where the widget should load once.',
      code: reactSnippet,
      language: 'tsx',
      placement: 'Render this once near your app root, layout, or provider tree.',
      expected: expectedResult,
    },
    {
      id: 'next',
      label: 'Next.js',
      title: 'Next.js component',
      body: 'Use a client component with next/script so the widget loads after hydration.',
      code: nextSnippet,
      language: 'tsx',
      placement: 'Render this client component from your root layout or app shell.',
      expected: expectedResult,
    },
    {
      id: 'vue',
      label: 'Vue',
      title: 'Vue component',
      body: 'Use when your web app has a Vue shell where the widget should load once.',
      code: vueSnippet,
      language: 'vue',
      placement: 'Mount once in the app shell so route changes do not create duplicate widgets.',
      expected: expectedResult,
    },
    {
      id: 'mobile',
      label: 'Mobile app',
      title: 'Native mobile guidance',
      body: 'The browser script does not run inside native iOS, Android, React Native, or Flutter screens.',
      code: null,
      language: 'text',
      placement: 'Use a WebView only for web content. For native screens, use the REST API or wait for a native SDK.',
      expected: 'No browser widget appears in native UI unless the app is rendering web content in a WebView.',
    },
  ]
  const selectedTarget = installTargets.find((target) => target.id === activePlatform) || installTargets[0]

  return (
    <div className="space-y-6" data-tour="install-workspace">
      <Card className="border-primary/25 bg-primary/[0.035]">
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-primary/90 text-primary-foreground">Step 2</Badge>
                <Badge variant="outline">{modeLabel} mode</Badge>
              </div>
              <h2 className="mt-3 text-xl font-semibold tracking-tight">
                Put the feedback form on your site.
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                Pick where your site runs. Copy the code below. Paste it into your site. Then send one test from your own site.
              </p>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="divide-y rounded-xl border bg-background/80">
              {installSteps.map((step, index) => (
                <div key={step.title} className="flex gap-3 px-4 py-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{step.title}</p>
                    <p className="mt-0.5 text-sm leading-5 text-muted-foreground">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 rounded-xl border bg-background/80 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Current install
                </p>
                <Badge variant="outline">{modeLabel}</Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">Project key</p>
                  {projectKey ? (
                    <p className="mt-1 break-all rounded-md border bg-muted/20 px-2 py-1.5 font-mono text-xs text-foreground">
                      {projectKey}
                    </p>
                  ) : (
                    <div className="mt-1 rounded-md border border-dashed bg-muted/10 p-3">
                      <p className="text-sm leading-5 text-muted-foreground">
                        Key hidden{apiKeyLastFour ? `, ending in ${apiKeyLastFour}` : ''}. Generate a fresh key to copy a new snippet.
                      </p>
                      <Button size="sm" variant="outline" className="mt-3" onClick={() => void onRotateApiKey()} disabled={rotatingApiKey}>
                        {rotatingApiKey && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Generate fresh key
                      </Button>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Saved mode</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{modeLabel}</p>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">{verifyInstruction}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card data-tour="install-snippet">
        <CardHeader data-tour="install-snippet-header">
          <div>
            <CardTitle className="text-lg">Install code</CardTitle>
            <CardDescription>
              Select the environment you are installing into. Instructions stay outside the code block so copy-paste stays clean.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div data-tour="install-platforms" className="flex flex-wrap gap-2" role="group" aria-label="Install platform">
            {installTargets.map((target) => (
              <button
                key={target.id}
                type="button"
                aria-pressed={activePlatform === target.id}
                onClick={() => setActivePlatform(target.id)}
                className={`min-h-9 rounded-full border px-3 text-sm font-medium transition-colors ${
                  activePlatform === target.id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                }`}
              >
                {target.label}
              </button>
            ))}
          </div>

          <div className="rounded-lg border bg-muted/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{selectedTarget.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{selectedTarget.body}</p>
              </div>
              {selectedTarget.code && (
                <CopyButton value={selectedTarget.code} label="Copy code" copiedLabel="Copied" size="sm" />
              )}
              {selectedTarget.id === 'mobile' && (
                <Link href={`/projects/${project.id}?tab=api`}>
                  <Button variant="outline" size="sm">Open API docs</Button>
                </Link>
              )}
            </div>
          </div>

          {projectKey ? (
            selectedTarget.code ? (
              <div data-tour="install-code">
                <CodeSnippet
                  tabs={[
                    {
                      label: selectedTarget.label,
                      code: selectedTarget.code,
                      language: selectedTarget.language,
                    },
                  ]}
                />
              </div>
            ) : (
              <div className="rounded-lg border border-dashed bg-muted/10 p-4 text-sm leading-6 text-muted-foreground">
                Native mobile apps do not use a browser script tag. Use the API from your backend, or inject the Website snippet only inside WebView content.
              </div>
            )
          ) : (
            <div className="rounded-lg border border-dashed bg-muted/10 p-4 text-sm text-muted-foreground">
              Generate a fresh key to reveal a new install snippet. Existing deployed clients keep working with the old key because only the raw database copy was removed.
            </div>
          )}

          <div className="divide-y rounded-lg border bg-muted/10">
            <div className="grid gap-1 px-4 py-3 md:grid-cols-[180px_minmax(0,1fr)]">
              <p className="text-sm font-medium text-foreground">Where this goes</p>
              <p className="text-sm leading-6 text-muted-foreground">{selectedTarget.placement}</p>
            </div>
            <div className="grid gap-1 px-4 py-3 md:grid-cols-[180px_minmax(0,1fr)]">
              <p className="text-sm font-medium text-foreground">What appears</p>
              <p className="text-sm leading-6 text-muted-foreground">{verifyInstruction}</p>
            </div>
            <div className="grid gap-1 px-4 py-3 md:grid-cols-[180px_minmax(0,1fr)]">
              <p className="text-sm font-medium text-foreground">Check it worked</p>
              <p className="text-sm leading-6 text-muted-foreground">
                Use your real site first. Send one test, then open the inbox and look for it.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-dashed bg-muted/10 p-4 text-sm text-muted-foreground">
            Need to change the button, use your own trigger, or embed the form directly on a page? Open <span className="font-medium text-foreground">Customize</span>, save changes, then return for updated code.
          </div>
        </CardContent>
      </Card>

      <details className="group rounded-xl border bg-card">
        <summary className="flex cursor-pointer list-none flex-wrap items-start justify-between gap-3 px-6 py-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Bot className="h-4 w-4" />
              </div>
              <Badge variant="secondary">Agent setup</Badge>
              <Badge variant="outline">Copyable prompt</Badge>
            </div>
            <p className="mt-3 text-lg font-semibold text-foreground">Give this to your AI builder</p>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              Optional setup packet and prompt for Cursor, Claude Code, Codex, Windsurf, or another repo-aware builder.
            </p>
          </div>
          <span className="text-sm font-medium text-primary">
            <span className="group-open:hidden">Show agent setup</span>
            <span className="hidden group-open:inline">Hide agent setup</span>
          </span>
        </summary>
        <div className="space-y-4 border-t px-6 py-5">
          {!projectKey && (
            <div className="rounded-lg border border-primary/30 bg-primary/[0.04] p-4 text-sm text-muted-foreground">
              Generate a fresh project key before using the prompt in a real codebase. The current prompt includes a placeholder so your agent does not guess credentials.
            </div>
          )}
          <div className="rounded-lg border bg-muted/20 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Short-lived setup packet link</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create a 30-minute URL your AI builder can fetch for exact snippets and verification steps.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => void createSetupPacketLink()}
                disabled={!projectKey || setupPacketLoading}
              >
                {setupPacketLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create packet link
              </Button>
            </div>
            {setupPacketError && (
              <p role="alert" className="mt-3 text-sm text-destructive">{setupPacketError}</p>
            )}
            {setupPacket && (
              <div className="mt-4 space-y-2">
                <CodeSnippet
                  tabs={[
                    {
                      label: 'Packet URL',
                      code: setupPacket.packetUrl,
                      language: 'text',
                    },
                  ]}
                  wrap
                  maxHeightClassName="max-h-36"
                />
                <p className="text-xs text-muted-foreground">
                  Expires {new Date(setupPacket.expiresAt).toLocaleString()}.
                </p>
              </div>
            )}
            <div className="mt-4 rounded-lg border bg-background/70 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Packet link status</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {activeSetupTokens.length > 0
                      ? `${activeSetupTokens.length} active setup ${activeSetupTokens.length === 1 ? 'link' : 'links'}`
                      : 'No active setup packet links.'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => void loadSetupTokens()}
                  disabled={setupTokensLoading}
                >
                  {setupTokensLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  Refresh
                </Button>
              </div>
              {setupTokens.length > 0 && (
                <div className="mt-3 space-y-2">
                  {setupTokens.slice(0, 3).map((token) => {
                    const isActive = !token.revoked_at && new Date(token.expires_at).getTime() > Date.now()
                    return (
                      <div key={token.token_id} className="flex flex-col gap-2 rounded-md border bg-muted/20 p-3 text-xs sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="font-medium text-foreground">
                            {isActive ? 'Active link' : token.revoked_at ? 'Revoked link' : 'Expired link'}
                          </p>
                          <p className="mt-0.5 text-muted-foreground">
                            Created {new Date(token.created_at).toLocaleString()} · Expires {new Date(token.expires_at).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 shrink-0 gap-1.5 text-xs text-destructive hover:text-destructive"
                          disabled={!isActive || revokingTokenId === token.token_id}
                          onClick={() => void revokeSetupToken(token.token_id)}
                        >
                          {revokingTokenId === token.token_id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          Revoke
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
          <CodeSnippet
            tabs={[
              {
                label: 'Agent Prompt',
                code: agentSetupPrompt,
                language: 'text',
              },
            ]}
            wrap
            maxHeightClassName="max-h-72"
          />
          <div className="divide-y rounded-lg border bg-muted/10">
            {[
              'Best for Cursor, Claude Code, Codex, Windsurf, or any repo-aware builder.',
              'The agent gets exact snippets instead of vague setup instructions.',
              'Verification stays explicit: one real test report must land in the inbox.',
            ].map((item) => (
              <div key={item} className="px-4 py-3 text-sm leading-6 text-muted-foreground">
                {item}
              </div>
            ))}
          </div>
        </div>
      </details>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <CardTitle className="text-lg">Verify the install</CardTitle>
          </div>
          <CardDescription>
            Use the hosted verification page to remove site-specific variables. If feedback lands in the inbox there, your project key and saved config are correct.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/20 p-4">
            <p className="text-sm font-medium text-foreground">Current setup status</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {projectSetupStatus && projectSetupStatus.totalFeedback > 0
                ? `${projectSetupStatus.totalFeedback} feedback ${projectSetupStatus.totalFeedback === 1 ? 'item has' : 'items have'} reached this project. ${projectSetupStatus.newFeedback} ${projectSetupStatus.newFeedback === 1 ? 'is' : 'are'} still new.`
                : 'No feedback has reached this project yet. Run hosted verification after installing the snippet.'}
            </p>
          </div>
          <div className="divide-y rounded-lg border bg-muted/10">
            {[
              'Open the verification page in a new tab.',
              `Submit a short test item like "Install verification for ${project.name}".`,
              'Open the inbox and confirm the item appears for this project.',
            ].map((step, index) => (
              <div key={step} className="flex gap-3 px-4 py-3 text-sm">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                  {index + 1}
                </span>
                {step}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            {projectKey ? (
              <Link href={`/projects/${project.id}/verify`}>
                <Button>
                  Open verification page
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button disabled>
                Open verification page
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            )}
            <Link href={`/feedback?projectId=${project.id}`}>
              <Button variant="outline">Open project inbox</Button>
            </Link>
          </div>
          {!projectKey && (
            <p className="text-sm text-muted-foreground">
              Generate a fresh key first. The hosted verification page needs the same key that your new snippet will use.
            </p>
          )}

          <div className="rounded-lg border border-dashed bg-muted/10 p-4 text-sm text-muted-foreground">
            If the hosted verification page works but your own site does not, keep the saved config as-is and check snippet placement first. Most first-run issues come from where the code is pasted, not from the widget settings.
          </div>
        </CardContent>
      </Card>

      <details className="group rounded-xl border bg-card">
        <summary className="flex cursor-pointer list-none flex-wrap items-start justify-between gap-3 px-6 py-5">
          <div>
            <p className="text-lg font-semibold text-foreground">After the widget is live: deployment hardening</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Keep CSP, SRI, and stronger human-verification as a second pass after the snippet is already working.
            </p>
          </div>
          <span className="text-sm font-medium text-primary">Show security guidance</span>
        </summary>
        <div className="space-y-5 border-t px-6 py-5">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border bg-muted/20 p-4">
              <p className="text-sm font-medium text-foreground">Recommended CSP baseline</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Allow the widget script origin and the feedback API origin explicitly. If you self-host or pin a version, adjust the origins to match your deployment.
              </p>
            </div>
            <div className="rounded-lg border bg-muted/20 p-4">
              <p className="text-sm font-medium text-foreground">Anti-spam baseline</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Public board submissions already use rate limiting. For the widget install, save captcha settings in <span className="font-medium text-foreground">Customize</span> if you need stronger protection on public forms.
              </p>
            </div>
          </div>

          <CodeSnippet
            tabs={[
              { label: 'CSP', code: cspSnippet, language: 'bash' },
              { label: 'SRI Hash', code: sriCommand, language: 'bash' },
            ]}
          />

          <div className="rounded-lg border border-dashed bg-muted/10 p-4 text-sm text-muted-foreground">
            Captcha keys stay secondary to install. Verify the widget first, then enable human-verification if your site is public-facing or you expect abuse risk.
          </div>
        </div>
      </details>
    </div>
  )
}
