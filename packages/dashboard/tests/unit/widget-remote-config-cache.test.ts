import assert from 'node:assert/strict'
import test from 'node:test'

test('remote widget config cache restores only validated public configuration', async () => {
  const {
    buildPublicWidgetConfig,
    readCachedFeedbackEnabled,
    readCachedRemoteWidgetConfig,
    writeCachedFeedbackEnabled,
    writeCachedRemoteWidgetConfig,
  } = await import(new URL('../../../shared/src/widget-install.ts', import.meta.url).href)
  const values = new Map<string, string>()
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value) },
  }
  const config = buildPublicWidgetConfig('fb_live_demo', { buttonText: 'Report issue' }, { appOrigin: 'https://feedbacks.dev' })

  writeCachedRemoteWidgetConfig(storage, 'fb_live_demo', config)
  assert.deepEqual(readCachedRemoteWidgetConfig(storage, 'fb_live_demo'), config)
  assert.equal(readCachedRemoteWidgetConfig(storage, 'another_project'), null)

  values.set('feedbacks:widget-config:fb_live_demo', JSON.stringify({ ...config, serviceRoleKey: 'forbidden' }))
  assert.equal(readCachedRemoteWidgetConfig(storage, 'fb_live_demo'), null)
  values.set('feedbacks:widget-config:fb_live_demo', '{bad json')
  assert.equal(readCachedRemoteWidgetConfig(storage, 'fb_live_demo'), null)

  writeCachedFeedbackEnabled(storage, 'fb_live_demo', false)
  assert.equal(readCachedFeedbackEnabled(storage, 'fb_live_demo'), false)
  assert.equal(readCachedFeedbackEnabled(storage, 'another_project'), undefined)
  values.set('feedbacks:feedback-enabled:fb_live_demo', '"false"')
  assert.equal(readCachedFeedbackEnabled(storage, 'fb_live_demo'), undefined)
})
