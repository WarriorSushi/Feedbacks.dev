import test from 'node:test'
import assert from 'node:assert/strict'

async function loadFeedbackReadState() {
  return import(new URL('../../src/lib/feedback-read-state.ts', import.meta.url).href)
}

test('feedback is unread until read_at is set', async () => {
  const { isFeedbackUnread } = await loadFeedbackReadState()

  assert.equal(isFeedbackUnread({ read_at: null }), true)
  assert.equal(isFeedbackUnread({}), true)
  assert.equal(isFeedbackUnread({ read_at: '2026-06-21T10:00:00.000Z' }), false)
})

test('mark-read payload only sets read_at and never workflow status', async () => {
  const { getFeedbackReadAtUpdate } = await loadFeedbackReadState()
  const update = getFeedbackReadAtUpdate(
    { read_at: null },
    new Date('2026-06-21T10:00:00.000Z'),
  )

  assert.deepEqual(update, { read_at: '2026-06-21T10:00:00.000Z' })
  assert.equal('status' in update!, false)
})

test('already-read feedback does not get a new read_at value', async () => {
  const { getFeedbackReadAtUpdate } = await loadFeedbackReadState()

  assert.equal(
    getFeedbackReadAtUpdate(
      { read_at: '2026-06-21T09:00:00.000Z' },
      new Date('2026-06-21T10:00:00.000Z'),
    ),
    null,
  )
})

test('only unread read-state filter is accepted', async () => {
  const { parseFeedbackReadStateFilter } = await loadFeedbackReadState()

  assert.equal(parseFeedbackReadStateFilter('unread'), 'unread')
  assert.equal(parseFeedbackReadStateFilter('read'), 'all')
  assert.equal(parseFeedbackReadStateFilter(null), 'all')
})
