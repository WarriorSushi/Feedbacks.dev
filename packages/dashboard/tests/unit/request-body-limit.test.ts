import assert from 'node:assert/strict'
import test from 'node:test'

async function loadRequestBodyLimit() {
  return import(new URL('../../src/lib/request-body-limit.ts', import.meta.url).href)
}

test('request body limit accepts bounded streamed input', async () => {
  const { readRequestBodyWithLimit } = await loadRequestBodyLimit()
  const request = new Request('https://app.feedbacks.dev/api/feedback', {
    method: 'POST',
    body: new TextEncoder().encode('bounded'),
  })

  const body = await readRequestBodyWithLimit(request, 32)
  assert.equal(new TextDecoder().decode(body), 'bounded')
})

test('request body limit rejects declared and chunked oversized input', async () => {
  const { readRequestBodyWithLimit, RequestBodyTooLargeError } = await loadRequestBodyLimit()
  const declared = new Request('https://app.feedbacks.dev/api/feedback', {
    method: 'POST',
    headers: { 'content-length': '100' },
    body: new Uint8Array([1]),
  })
  await assert.rejects(readRequestBodyWithLimit(declared, 10), RequestBodyTooLargeError)

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array(8))
      controller.enqueue(new Uint8Array(8))
      controller.close()
    },
  })
  const chunked = new Request('https://app.feedbacks.dev/api/feedback', {
    method: 'POST',
    body: stream,
    duplex: 'half',
  } as RequestInit & { duplex: 'half' })
  await assert.rejects(readRequestBodyWithLimit(chunked, 10), RequestBodyTooLargeError)
})

