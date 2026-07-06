import { lookup as dnsLookup } from 'node:dns/promises'
import { request as httpsRequest } from 'node:https'
import { BlockList, isIP } from 'node:net'

export const WEBHOOK_REQUEST_TIMEOUT_MS = 8_000
export const WEBHOOK_RESPONSE_BODY_LIMIT_BYTES = 64 * 1024

interface ResolvedWebhookTarget {
  url: URL
  address: string
  family: 4 | 6
}

interface WebhookHttpResponse {
  ok: boolean
  status: number
  body: string
}

type LookupResult = { address: string; family: number }
type LookupAll = (hostname: string) => Promise<LookupResult[]>

const blockedIpv4Addresses = new BlockList()
const blockedIpv6Addresses = new BlockList()

for (const [network, prefix] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.88.99.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
] as const) {
  blockedIpv4Addresses.addSubnet(network, prefix, 'ipv4')
}

for (const [network, prefix] of [
  ['::', 128],
  ['::1', 128],
  ['::ffff:0:0', 96],
  ['64:ff9b::', 96],
  ['100::', 64],
  ['2001:db8::', 32],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8],
] as const) {
  blockedIpv6Addresses.addSubnet(network, prefix, 'ipv6')
}

function normalizeHostname(hostname: string): string {
  return hostname.startsWith('[') && hostname.endsWith(']')
    ? hostname.slice(1, -1)
    : hostname
}

export function isPublicWebhookAddress(address: string): boolean {
  const family = isIP(address)
  if (family === 4) return !blockedIpv4Addresses.check(address, 'ipv4')
  if (family === 6) return !blockedIpv6Addresses.check(address, 'ipv6')
  return false
}

export function formatWebhookResponseBody(status: number, body: string, truncated = false): string {
  if (status >= 300 && status < 400) {
    return 'Redirect responses are not followed for webhook delivery'
  }
  return `${body}${truncated ? '\n[response truncated]' : ''}`
}

export function parseWebhookTarget(value: string): URL {
  const url = new URL(value)
  if (url.protocol !== 'https:') throw new Error('Webhook URL must use HTTPS')
  if (url.username || url.password) throw new Error('Webhook URL must not include credentials')
  if (!url.hostname) throw new Error('Webhook URL must include a hostname')
  return url
}

async function defaultLookup(hostname: string): Promise<LookupResult[]> {
  return dnsLookup(hostname, { all: true, verbatim: true })
}

export async function resolvePublicWebhookTarget(
  value: string,
  lookupAll: LookupAll = defaultLookup,
): Promise<ResolvedWebhookTarget> {
  const url = parseWebhookTarget(value)
  const hostname = normalizeHostname(url.hostname)
  const literalFamily = isIP(hostname)
  const results = literalFamily
    ? [{ address: hostname, family: literalFamily }]
    : await lookupAll(hostname)

  if (results.length === 0) throw new Error('Webhook hostname did not resolve')
  if (results.some((result) => !isPublicWebhookAddress(result.address))) {
    throw new Error('Webhook hostname resolves to a private or reserved address')
  }

  const selected = results[0]
  if (selected.family !== 4 && selected.family !== 6) {
    throw new Error('Webhook hostname resolved to an unsupported address family')
  }

  return { url, address: selected.address, family: selected.family }
}

export async function postPublicWebhookJson({
  url,
  body,
  headers,
  timeoutMs = WEBHOOK_REQUEST_TIMEOUT_MS,
}: {
  url: string
  body: string
  headers?: Record<string, string>
  timeoutMs?: number
}): Promise<WebhookHttpResponse> {
  const target = await resolvePublicWebhookTarget(url)

  return new Promise<WebhookHttpResponse>((resolve, reject) => {
    let settled = false
    const settle = (callback: () => void) => {
      if (settled) return
      settled = true
      callback()
    }

    const request = httpsRequest(
      target.url,
      {
        method: 'POST',
        servername: normalizeHostname(target.url.hostname),
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': String(Buffer.byteLength(body)),
          ...headers,
        },
        lookup: (_hostname, _options, callback) => {
          callback(null, target.address, target.family)
        },
      },
      (response) => {
        const chunks: Buffer[] = []
        let receivedBytes = 0
        let truncated = false

        response.on('data', (chunk: Buffer | string) => {
          if (truncated) return
          const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
          const available = WEBHOOK_RESPONSE_BODY_LIMIT_BYTES - receivedBytes
          if (buffer.length > available) {
            if (available > 0) chunks.push(buffer.subarray(0, available))
            receivedBytes = WEBHOOK_RESPONSE_BODY_LIMIT_BYTES
            truncated = true
            return
          }
          chunks.push(buffer)
          receivedBytes += buffer.length
        })

        response.on('end', () => {
          const status = response.statusCode || 0
          const responseBody = Buffer.concat(chunks).toString('utf8')
          settle(() => resolve({
            ok: status >= 200 && status < 300,
            status,
            body: formatWebhookResponseBody(status, responseBody, truncated),
          }))
        })
      },
    )

    request.setTimeout(timeoutMs, () => {
      request.destroy(new Error(`Webhook request timed out after ${timeoutMs}ms`))
    })
    request.on('error', (error) => settle(() => reject(error)))
    request.end(body)
  })
}
