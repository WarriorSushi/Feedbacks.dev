type LogValue = string | number | boolean | null | undefined

export function getRequestId(request: Request): string {
  return request.headers.get('x-request-id') || crypto.randomUUID()
}

export function logOperationalEvent(
  level: 'info' | 'warn' | 'error',
  event: string,
  requestId: string,
  details: Record<string, LogValue> = {},
) {
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    requestId,
    ...details,
  })

  if (level === 'error') console.error(entry)
  else if (level === 'warn') console.warn(entry)
  else console.info(entry)
}

