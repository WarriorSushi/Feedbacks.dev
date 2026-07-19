import assert from 'node:assert/strict'
import test from 'node:test'

test('widget bootstrap public contract keeps modules independent', async () => {
  const { isWidgetBootstrapResponse } = await import(new URL('../../../shared/src/product-updates.ts', import.meta.url).href)
  const feedbackOnly = { configVersion: 2, modules: { feedback: true, updates: false } }
  const updatesOnly = { configVersion: 2, modules: { feedback: false, updates: true }, updates: { settings: { autoShow: true, displayDelayMs: 1500, theme: 'auto', accentColor: '#6366f1', includePaths: [], excludePaths: [], showPoweredBy: true }, updates: [] } }
  assert.equal(isWidgetBootstrapResponse(feedbackOnly), true)
  assert.equal(isWidgetBootstrapResponse(updatesOnly), true)
  assert.equal(isWidgetBootstrapResponse({ configVersion: 2, modules: { feedback: false, updates: true } }), false)
  assert.equal(isWidgetBootstrapResponse({ configVersion: 2, modules: { feedback: true, updates: false }, updates: updatesOnly.updates }), false)
  assert.equal(isWidgetBootstrapResponse({ configVersion: 2, modules: { feedback: false, updates: true }, updates: { settings: {}, updates: [] } }), false)
  assert.equal(isWidgetBootstrapResponse({ ...updatesOnly, updates: { ...updatesOnly.updates, settings: { ...updatesOnly.updates.settings, displayDelayMs: 31_000 } } }), false)
  assert.equal(isWidgetBootstrapResponse({ configVersion: 1, modules: { feedback: true, updates: false } }), false)
})
