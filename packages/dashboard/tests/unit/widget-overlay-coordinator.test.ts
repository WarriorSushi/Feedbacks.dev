import assert from 'node:assert/strict'
import test from 'node:test'
import {
  acquireOverlay,
  claimUpdatesOwner,
  hasActiveOverlay,
  onOverlayAvailable,
  releaseOverlay,
  releaseUpdatesOwner,
} from '../../../widget/src/overlay-coordinator.ts'

test('widget overlays are globally exclusive and notify waiting controllers', async () => {
  const feedbackOwner = {}
  const updatesOwner = {}
  let feedbackClosed = 0
  let available = 0
  const unsubscribe = onOverlayAvailable(() => { available += 1 })

  acquireOverlay(feedbackOwner, 'feedback', () => { feedbackClosed += 1 })
  assert.equal(hasActiveOverlay(), true)

  acquireOverlay(updatesOwner, 'updates', () => undefined)
  assert.equal(feedbackClosed, 1)
  assert.equal(hasActiveOverlay(), true)

  releaseOverlay(updatesOwner)
  await Promise.resolve()
  assert.equal(hasActiveOverlay(), false)
  assert.equal(available, 1)
  unsubscribe()
})

test('only one Product Updates controller owns a project at a time', () => {
  const projectKey = `test-${Date.now()}`
  const first = {}
  const duplicate = {}

  assert.equal(claimUpdatesOwner(projectKey, first), true)
  assert.equal(claimUpdatesOwner(projectKey, duplicate), false)
  releaseUpdatesOwner(projectKey, first)
  assert.equal(claimUpdatesOwner(projectKey, duplicate), true)
  releaseUpdatesOwner(projectKey, duplicate)
})
