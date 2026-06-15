#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  submitFeedbackParams,
  listFeedbackParams,
  updateFeedbackStatusParams,
  searchFeedbackParams,
  setupPacketParams,
  submitTestFeedbackParams,
  verifyWidgetInstallParams,
} from './tools.js'

function readCliOption(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`)
  if (index === -1) return undefined
  const value = process.argv[index + 1]
  return value && !value.startsWith('--') ? value : undefined
}

const API_KEY = readCliOption('api-key') ?? process.env.FEEDBACKS_API_KEY
const API_URL = (readCliOption('api-url') ?? process.env.FEEDBACKS_API_URL ?? 'https://app.feedbacks.dev').replace(/\/$/, '')

if (!API_KEY) {
  console.error('FEEDBACKS_API_KEY environment variable or --api-key is required')
  process.exit(1)
}

async function apiRequest(
  path: string,
  options: RequestInit = {}
): Promise<unknown> {
  const url = `${API_URL}/api/v1${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY!,
      ...options.headers,
    },
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error ?? `API error: ${res.status}`)
  }
  return data
}

const server = new McpServer({
  name: 'feedbacks',
  version: '1.0.0',
})

// Cache project ID to avoid redundant API calls
let cachedProjectId: string | null = null

async function getProjectId(): Promise<string> {
  if (cachedProjectId) return cachedProjectId
  const projectRes = await apiRequest('/projects') as { data: { id: string }[] }
  const projectId = projectRes.data?.[0]?.id
  if (!projectId) throw new Error('No project found for this API key')
  cachedProjectId = projectId
  return projectId
}

server.tool(
  'list_projects',
  'List projects available to this API key',
  {},
  async () => {
    const result = await apiRequest('/projects')
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
    }
  }
)

server.tool(
  'get_project_setup_packet',
  'Get exact widget install snippets, endpoints, and verification steps for the project',
  setupPacketParams.shape,
  async (params) => {
    const projectId = params.project_id || await getProjectId()
    const result = await apiRequest(`/projects/${projectId}/setup-packet`)
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
    }
  }
)

server.tool(
  'verify_widget_install',
  'Check whether a page appears to include the feedbacks.dev widget and whether the project has received feedback',
  verifyWidgetInstallParams.shape,
  async (params) => {
    const projectId = params.project_id || await getProjectId()
    const [packet, stats] = await Promise.all([
      apiRequest(`/projects/${projectId}/setup-packet`) as Promise<{
        project: { publicKey: string }
        widget: { scriptUrl: string; endpoint: string; expectedResult: string }
        verification: { url: string }
      }>,
      apiRequest(`/projects/${projectId}`) as Promise<{
        stats?: { totalFeedback?: number; newFeedback?: number }
      }>,
    ])

    let pageCheck: Record<string, unknown> | null = null
    if (params.page_url) {
      try {
        const response = await fetch(params.page_url)
        const html = await response.text()
        pageCheck = {
          url: params.page_url,
          reachable: response.ok,
          status: response.status,
          containsWidgetScript:
            html.includes(packet.widget.scriptUrl) ||
            html.includes('/widget/latest.js') ||
            html.includes('/widget/v2.js'),
          containsProjectKey: html.includes(packet.project.publicKey),
          containsFeedbackEndpoint: html.includes(packet.widget.endpoint),
        }
      } catch (error) {
        pageCheck = {
          url: params.page_url,
          reachable: false,
          error: error instanceof Error ? error.message : 'Failed to fetch page',
        }
      }
    }

    const result = {
      projectId,
      expectedWidgetResult: packet.widget.expectedResult,
      hostedVerificationUrl: packet.verification.url,
      inbox: {
        totalFeedback: stats.stats?.totalFeedback ?? 0,
        newFeedback: stats.stats?.newFeedback ?? 0,
        hasReceivedFeedback: (stats.stats?.totalFeedback ?? 0) > 0,
      },
      pageCheck,
      nextStep: pageCheck
        ? 'If the page check passes, submit_test_feedback or submit from the widget, then confirm the item appears in the inbox.'
        : 'Provide page_url to inspect the installed page, or open the hosted verification URL and submit one test item.',
    }

    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
    }
  }
)

server.tool(
  'submit_test_feedback',
  'Submit a test feedback item to verify the project inbox receives agent/API submissions',
  submitTestFeedbackParams.shape,
  async (params) => {
    const result = await apiRequest('/feedback', {
      method: 'POST',
      body: JSON.stringify({
        message: params.message,
        type: 'question',
        priority: 'low',
        url: params.url,
        agent_name: 'feedbacks-mcp',
        structured_data: {
          verification: true,
          source: 'submit_test_feedback',
        },
      }),
    })
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
    }
  }
)

server.tool(
  'submit_feedback',
  'Submit a bug report, feature request, or other feedback',
  submitFeedbackParams.shape,
  async (params) => {
    const result = await apiRequest('/feedback', {
      method: 'POST',
      body: JSON.stringify(params),
    })
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
    }
  }
)

server.tool(
  'list_feedback',
  'List recent feedback for the project',
  listFeedbackParams.shape,
  async (params) => {
    const qs = new URLSearchParams()
    if (params.status) qs.set('status', params.status)
    if (params.type) qs.set('type', params.type)
    if (params.search) qs.set('search', params.search)
    qs.set('limit', String(params.limit))
    qs.set('page', String(params.page))

    const result = await apiRequest(`/feedback?${qs.toString()}`)
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
    }
  }
)

server.tool(
  'update_feedback_status',
  'Update the status, priority, or tags of a feedback item',
  updateFeedbackStatusParams.shape,
  async (params) => {
    const projectId = await getProjectId()

    const qs = new URLSearchParams({ feedback_id: params.feedback_id })
    const body: Record<string, unknown> = { status: params.status }
    if (params.priority) body.priority = params.priority
    if (params.tags) body.tags = params.tags

    const result = await apiRequest(`/projects/${projectId}/feedback?${qs.toString()}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
    }
  }
)

server.tool(
  'get_project_stats',
  'Get project overview with feedback statistics',
  {},
  async () => {
    const projectId = await getProjectId()

    const result = await apiRequest(`/projects/${projectId}`)
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
    }
  }
)

server.tool(
  'search_feedback',
  'Search feedback by keyword with optional filters',
  searchFeedbackParams.shape,
  async (params) => {
    const qs = new URLSearchParams({
      search: params.query,
      limit: String(params.limit),
    })
    if (params.type) qs.set('type', params.type)
    if (params.status) qs.set('status', params.status)

    const result = await apiRequest(`/feedback?${qs.toString()}`)
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
    }
  }
)

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch((err) => {
  console.error('MCP server error:', err)
  process.exit(1)
})
