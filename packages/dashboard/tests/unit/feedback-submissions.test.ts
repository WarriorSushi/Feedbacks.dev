import test from 'node:test'
import assert from 'node:assert/strict'

async function loadFeedbackSubmissions() {
  return import(new URL('../../src/lib/feedback-submissions.ts', import.meta.url).href)
}

test('feedback metadata defaults to an empty object when omitted or null', async () => {
  const { normalizeFeedbackMetadata } = await loadFeedbackSubmissions()

  assert.deepEqual(normalizeFeedbackMetadata(undefined), {})
  assert.deepEqual(normalizeFeedbackMetadata(null), {})
})

test('feedback metadata preserves provided object values', async () => {
  const { normalizeFeedbackMetadata } = await loadFeedbackSubmissions()

  assert.deepEqual(normalizeFeedbackMetadata({ url: '/pricing', source: 'mcp' }), {
    url: '/pricing',
    source: 'mcp',
  })
})
