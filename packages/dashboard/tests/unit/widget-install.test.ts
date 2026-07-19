import test from 'node:test'
import assert from 'node:assert/strict'

async function loadWidgetInstall() {
  return import(new URL('../../../shared/src/widget-install.ts', import.meta.url).href)
}

test('widget editor config applies canonical defaults used by runtime and snippets', async () => {
  const {
    buildRuntimeWidgetConfig,
    buildWidgetEditorConfig,
    generateInstallSnippets,
    getWidgetExpectation,
    getWidgetModeLabel,
  } = await loadWidgetInstall()

  const editorConfig = buildWidgetEditorConfig('fb_live_demo', {}, { appOrigin: 'https://feedbacks.dev' })

  assert.equal(editorConfig.embedMode, 'modal')
  assert.equal(editorConfig.position, 'bottom-right')
  assert.equal(editorConfig.buttonText, 'Feedback')
  assert.equal(editorConfig.enableType, true)
  assert.equal(editorConfig.enableRating, true)
  assert.equal(editorConfig.enableScreenshot, false)
  assert.equal(editorConfig.requireEmail, false)
  assert.equal(editorConfig.formTitle, 'Send Feedback')
  assert.equal(editorConfig.messagePlaceholder, "What's on your mind?")

  const runtimeConfig = buildRuntimeWidgetConfig('fb_live_demo', editorConfig, {
    appOrigin: 'https://feedbacks.dev',
  })
  assert.equal(getWidgetModeLabel(runtimeConfig), 'Modal')
  assert.equal(
    getWidgetExpectation(runtimeConfig),
    'Look for the floating "Feedback" launcher near the lower-right corner.',
  )

  const websiteSnippet = generateInstallSnippets({
    projectKey: 'fb_live_demo',
    savedConfig: editorConfig,
    appOrigin: 'https://feedbacks.dev',
  }).find((snippet: { label: string }) => snippet.label === 'Website')?.code

  assert.ok(websiteSnippet)
  assert.match(websiteSnippet, /src="https:\/\/feedbacks\.dev\/widget\/latest\.js"/)
  assert.match(websiteSnippet, /data-project="fb_live_demo"/)
  assert.match(websiteSnippet, /data-api-url="https:\/\/feedbacks\.dev\/api\/feedback"/)
  assert.doesNotMatch(websiteSnippet, /data-button-text=/)
})

test('widget expectation reflects non-default trigger and modal positioning', async () => {
  const {
    buildRuntimeWidgetConfig,
    getWidgetExpectation,
    getWidgetModeLabel,
  } = await loadWidgetInstall()

  const triggerConfig = buildRuntimeWidgetConfig(
    'fb_live_demo',
    {
      embedMode: 'trigger',
      buttonText: 'Report issue',
    },
    { appOrigin: 'https://feedbacks.dev' },
  )
  assert.equal(getWidgetModeLabel(triggerConfig), 'Trigger')
  assert.equal(
    getWidgetExpectation(triggerConfig),
    'Click "Report issue" to open the feedback form from your trigger element.',
  )

  const modalConfig = buildRuntimeWidgetConfig(
    'fb_live_demo',
    {
      position: 'top-left',
      buttonText: 'Share feedback',
    },
    { appOrigin: 'https://feedbacks.dev' },
  )
  assert.equal(
    getWidgetExpectation(modalConfig),
    'Look for the floating "Share feedback" launcher near the upper-left corner.',
  )
})

test('updates installation is opt-in and includes canonical endpoints when enabled', async () => {
  const { buildRuntimeWidgetConfig, generateInstallSnippets } = await loadWidgetInstall()
  const config = buildRuntimeWidgetConfig('fb_live_demo', { enableUpdates: true }, { appOrigin: 'https://feedbacks.dev' })
  assert.equal(config.updatesApiUrl, 'https://feedbacks.dev/api/widget/updates')
  const websiteSnippet = generateInstallSnippets({ projectKey: 'fb_live_demo', savedConfig: config, appOrigin: 'https://feedbacks.dev' })
    .find((snippet: { label: string }) => snippet.label === 'Website')?.code
  assert.match(websiteSnippet || '', /data-enable-updates="true"/)
  assert.match(websiteSnippet || '', /data-updates-api-url="https:\/\/feedbacks\.dev\/api\/widget\/updates"/)
})

test('server module preference survives customization without leaking into install markup', async () => {
  const { sanitizeSavedWidgetConfig, generateInstallSnippets } = await loadWidgetInstall()
  const saved = sanitizeSavedWidgetConfig({ feedbackEnabled: false, buttonText: 'Contact us' })
  assert.equal(saved.feedbackEnabled, false)

  const websiteSnippet = generateInstallSnippets({
    projectKey: 'fb_live_demo',
    savedConfig: saved,
    appOrigin: 'https://feedbacks.dev',
  }).find((snippet: { label: string }) => snippet.label === 'Website')?.code

  assert.ok(websiteSnippet)
  assert.doesNotMatch(websiteSnippet, /feedback-enabled/i)
})
