'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Project } from '@/lib/types'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      variant="outline"
      size="sm"
      aria-label="Copy to clipboard"
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
    >
      {copied ? 'Copied' : 'Copy'}
    </Button>
  )
}

function CodeBlock({ code, language = 'bash' }: { code: string; language?: string }) {
  return (
    <div className="relative" aria-label={`${language} code sample`}>
      <div className="absolute right-2 top-2 z-10">
        <CopyButton text={code} />
      </div>
      <pre className="max-h-96 overflow-auto rounded-lg bg-muted p-4 pr-20 text-sm">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function MethodBadge({ method }: { method: 'GET' | 'POST' | 'PATCH' }) {
  const className =
    method === 'POST'
      ? 'bg-emerald-600 text-white hover:bg-emerald-600'
      : method === 'PATCH'
        ? 'bg-amber-600 text-white hover:bg-amber-600'
        : 'bg-blue-600 text-white hover:bg-blue-600'

  return <Badge className={className}>{method}</Badge>
}

function EndpointExample({
  method,
  path,
  description,
  code,
  defaultOpen = false,
}: {
  method: 'GET' | 'POST' | 'PATCH'
  path: string
  description: string
  code: string
  defaultOpen?: boolean
}) {
  return (
    <details open={defaultOpen} className="group border-b last:border-b-0">
      <summary className="flex cursor-pointer list-none flex-col gap-3 px-4 py-4 transition-colors hover:bg-accent/40 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <MethodBadge method={method} />
            <code className="break-all font-mono text-sm">{path}</code>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        <span className="shrink-0 text-sm font-medium text-primary">
          <span className="group-open:hidden">Show curl</span>
          <span className="hidden group-open:inline">Hide curl</span>
        </span>
      </summary>
      <div className="border-t bg-muted/10 px-4 py-4">
        <CodeBlock code={code} />
      </div>
    </details>
  )
}

export function ApiDocs({
  project,
  projectKey,
  apiKeyLastFour,
  rotatingApiKey,
  onRotateApiKey,
}: {
  project: Project
  projectKey: string | null
  apiKeyLastFour: string | null
  rotatingApiKey: boolean
  onRotateApiKey: () => Promise<void>
}) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://app.feedbacks.dev'
  const endpoints = projectKey
    ? [
        {
          method: 'POST' as const,
          path: '/api/v1/feedback',
          description: 'Submit feedback with optional structured data from an app, script, or agent.',
          code: `curl -X POST ${baseUrl}/api/v1/feedback \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${projectKey}" \\
  -d '{
    "message": "Button click throws TypeError",
    "type": "bug",
    "priority": "high",
    "agent_name": "claude-code",
    "structured_data": {
      "stack_trace": "TypeError: Cannot read property...",
      "error_code": "ERR_NULL_REF",
      "component": "LoginForm"
    }
  }'`,
        },
        {
          method: 'GET' as const,
          path: '/api/v1/feedback',
          description: 'List feedback with pagination and filters for status, type, agent, search, page, and limit.',
          code: `curl ${baseUrl}/api/v1/feedback?status=new&limit=10 \\
  -H "X-API-Key: ${projectKey}"`,
        },
        {
          method: 'GET' as const,
          path: '/api/v1/projects/{id}',
          description: 'Get project details and stats for the project attached to this API key.',
          code: `curl ${baseUrl}/api/v1/projects/${project.id} \\
  -H "X-API-Key: ${projectKey}"`,
        },
        {
          method: 'PATCH' as const,
          path: '/api/v1/projects/{id}/feedback',
          description: 'Update feedback status, priority, or tags after triage.',
          code: `curl -X PATCH "${baseUrl}/api/v1/projects/${project.id}/feedback?feedback_id=FEEDBACK_ID" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${projectKey}" \\
  -d '{"status": "in_progress", "priority": "high"}'`,
        },
      ]
    : []

  return (
    <div className="space-y-6">
      <Card className="border-primary/30 bg-primary/[0.04]">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Pro feature</Badge>
            <Badge variant="outline">REST + MCP</Badge>
          </div>
          <CardTitle className="mt-3 text-base">API and MCP access are part of Pro</CardTitle>
          <CardDescription>
            The widget, dashboard, and optional public board work on Free. Upgrade to Pro when you want programmatic feedback access, agent tooling, and the rest of the paid routing surface.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/billing">
            <Button variant="outline" size="sm">Open Billing</Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Connection details</CardTitle>
          <CardDescription>
            Use the project key as the `X-API-Key` header. Keep server-side secrets out of browser code.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y rounded-b-lg border-t p-0">
          <div className="grid gap-2 px-4 py-3 md:grid-cols-[160px_minmax(0,1fr)_auto] md:items-center">
            <p className="text-sm font-medium">API key</p>
            {projectKey ? (
              <code className="break-all rounded bg-muted px-2 py-1.5 font-mono text-sm">
                {projectKey}
              </code>
            ) : (
              <p className="text-sm text-muted-foreground">
                Hidden{apiKeyLastFour ? `, ending in ${apiKeyLastFour}` : ''}. Generate a fresh key to copy REST or MCP credentials.
              </p>
            )}
            {projectKey ? (
              <CopyButton text={projectKey} />
            ) : (
              <Button variant="outline" size="sm" onClick={() => void onRotateApiKey()} disabled={rotatingApiKey}>
                {rotatingApiKey ? 'Generating' : 'Generate key'}
              </Button>
            )}
          </div>
          <div className="grid gap-2 px-4 py-3 md:grid-cols-[160px_minmax(0,1fr)_auto] md:items-center">
            <p className="text-sm font-medium">Base URL</p>
            <code className="break-all rounded bg-muted px-2 py-1.5 font-mono text-sm">{baseUrl}/api/v1</code>
            <CopyButton text={`${baseUrl}/api/v1`} />
          </div>
        </CardContent>
      </Card>

      {projectKey ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">REST endpoints</CardTitle>
              <CardDescription>Start with submit feedback. Open the other examples only when you need them.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-hidden rounded-b-lg border-t">
                {endpoints.map((endpoint, index) => (
                  <EndpointExample key={endpoint.path + endpoint.method} {...endpoint} defaultOpen={index === 0} />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">MCP server</CardTitle>
              <CardDescription>
                Connect repo-aware agents to submit feedback, verify installs, and read project setup packets.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Add this to your <code className="bg-muted px-1 rounded">.mcp.json</code> or Claude Code settings:
          </p>
          <CodeBlock language="json" code={`{
  "feedbacks": {
    "command": "npx",
    "args": ["@feedbacks/mcp-server"],
    "env": {
      "FEEDBACKS_API_KEY": "${projectKey}",
      "FEEDBACKS_API_URL": "${baseUrl}"
    }
  }
}`} />

          <div className="divide-y rounded-lg border bg-muted/10">
            {[
              ['submit_feedback', 'Submit a bug report or feature request.'],
              ['submit_test_feedback', 'Send a verification item to the inbox.'],
              ['list_projects', 'List the project attached to this API key.'],
              ['get_project_setup_packet', 'Fetch exact install snippets and verification steps.'],
              ['verify_widget_install', 'Inspect a reachable page and report inbox status.'],
              ['list_feedback', 'List recent feedback with filters.'],
              ['update_feedback_status', 'Change feedback status or priority.'],
              ['get_project_stats', 'Get project overview stats.'],
              ['search_feedback', 'Search feedback by keyword.'],
            ].map(([tool, description]) => (
              <div key={tool} className="grid gap-1 px-4 py-2.5 md:grid-cols-[220px_minmax(0,1fr)]">
                <code className="rounded bg-background px-1.5 py-0.5 font-mono text-xs">{tool}</code>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>

          <details className="rounded-lg border bg-muted/10">
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium">Show example agent prompts</summary>
            <div className="border-t p-4">
            <CodeBlock code={`// In an AI agent conversation:
// "Submit a bug report about the login form crashing"
// → Agent calls submit_feedback with structured_data

// "Show me all open bugs"
// → Agent calls list_feedback with status=new, type=bug

// "Mark feedback abc-123 as in progress"
// → Agent calls update_feedback_status`} />
            </div>
          </details>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
