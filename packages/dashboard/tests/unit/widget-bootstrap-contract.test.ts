import assert from 'node:assert/strict'
import test from 'node:test'

test('widget bootstrap public contract keeps modules independent', async () => {
  const feedbackOnly = { configVersion: 2, modules: { feedback: true, updates: false } }
  const updatesOnly = { configVersion: 2, modules: { feedback: false, updates: true }, updates: { settings: { autoShow: true, displayDelayMs: 1500, theme: 'auto', accentColor: '#6366f1', includePaths: [], excludePaths: [], showPoweredBy: true }, updates: [] } }
  assert.equal(feedbackOnly.modules.feedback, true)
  assert.equal(updatesOnly.modules.feedback, false)
  assert.equal(updatesOnly.modules.updates, true)
})
