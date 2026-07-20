import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
  type StyleValue,
} from 'vue'
import {
  buildRuntimeWidgetConfig,
  buildWidgetScriptUrl,
  type CaptchaProvider,
  type EmbedMode,
  type SavedWidgetConfig,
  type WidgetConfig,
  type WidgetPosition,
} from '@feedbacks/shared'

export interface FeedbacksWidgetProps extends SavedWidgetConfig {
  appOrigin?: string
  projectKey: string
  className?: string
  style?: StyleValue
  id?: string
}

type WidgetInstance = {
  destroy?: () => void
}

type WidgetRuntimeModule = {
  FeedbacksWidget?: new (config: WidgetConfig) => WidgetInstance
  default?: new (config: WidgetConfig) => WidgetInstance
}

type WidgetRuntimeWindow = Window & {
  FeedbacksWidget?: (new (config: WidgetConfig) => WidgetInstance) | WidgetRuntimeModule
}

const runtimeLoaders = new Map<string, Promise<void>>()

function resolveRuntimeCtor(runtime: WidgetRuntimeWindow['FeedbacksWidget']) {
  if (typeof runtime === 'function') return runtime
  if (runtime && typeof runtime === 'object') {
    if (typeof runtime.FeedbacksWidget === 'function') return runtime.FeedbacksWidget
    if (typeof runtime.default === 'function') return runtime.default
  }

  return null
}

function loadWidgetRuntime(appOrigin?: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()

  const runtimeWindow = window as WidgetRuntimeWindow
  if (resolveRuntimeCtor(runtimeWindow.FeedbacksWidget)) return Promise.resolve()

  const src = buildWidgetScriptUrl(appOrigin)
  const cached = runtimeLoaders.get(src)
  if (cached) return cached

  const promise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`)
    if (existingScript) {
      if (existingScript.dataset.feedbacksLoaded === 'true') {
        resolve()
        return
      }

      const handleLoad = () => {
        existingScript.dataset.feedbacksLoaded = 'true'
        resolve()
      }
      const handleError = () => reject(new Error(`Failed to load widget runtime from ${src}`))

      existingScript.addEventListener('load', handleLoad, { once: true })
      existingScript.addEventListener('error', handleError, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.defer = true
    script.dataset.feedbacksWidgetRuntime = 'true'
    script.onload = () => {
      script.dataset.feedbacksLoaded = 'true'
      resolve()
    }
    script.onerror = () => reject(new Error(`Failed to load widget runtime from ${src}`))
    document.head.appendChild(script)
  }).finally(() => {
    runtimeLoaders.delete(src)
  })

  runtimeLoaders.set(src, promise)
  return promise
}

function sanitizeTargetSelector(target?: string): string | undefined {
  if (!target) return undefined
  const trimmed = target.trim()
  if (!trimmed) return undefined
  return ['#', '.', '['].some((prefix) => trimmed.startsWith(prefix)) ? trimmed : `#${trimmed}`
}

export const FeedbacksWidget = defineComponent({
  name: 'FeedbacksWidget',
  props: {
    appOrigin: { type: String, default: undefined },
    projectKey: { type: String, required: true },
    embedMode: { type: String as PropType<EmbedMode>, default: 'modal' },
    position: { type: String as PropType<WidgetPosition>, default: undefined },
    target: { type: String, default: undefined },
    buttonText: { type: String, default: undefined },
    primaryColor: { type: String, default: undefined },
    backgroundColor: { type: String, default: undefined },
    scale: { type: Number, default: undefined },
    modalWidth: { type: Number, default: undefined },
    apiUrl: { type: String, default: undefined },
    enableUpdates: { type: Boolean, default: undefined },
    updatesApiUrl: { type: String, default: undefined },
    updatesEventsApiUrl: { type: String, default: undefined },
    debug: { type: Boolean, default: undefined },
    requireEmail: { type: Boolean, default: undefined },
    enableType: { type: Boolean, default: undefined },
    enableRating: { type: Boolean, default: undefined },
    enableScreenshot: { type: Boolean, default: undefined },
    screenshotRequired: { type: Boolean, default: undefined },
    enableAttachment: { type: Boolean, default: undefined },
    attachmentMaxMB: { type: Number, default: undefined },
    allowedAttachmentMimes: { type: Array as PropType<string[]>, default: undefined },
    requireCaptcha: { type: Boolean, default: undefined },
    captchaProvider: { type: String as PropType<CaptchaProvider>, default: undefined },
    turnstileSiteKey: { type: String, default: undefined },
    hcaptchaSiteKey: { type: String, default: undefined },
    formTitle: { type: String, default: undefined },
    formSubtitle: { type: String, default: undefined },
    messageLabel: { type: String, default: undefined },
    messagePlaceholder: { type: String, default: undefined },
    emailLabel: { type: String, default: undefined },
    submitButtonText: { type: String, default: undefined },
    cancelButtonText: { type: String, default: undefined },
    successTitle: { type: String, default: undefined },
    successDescription: { type: String, default: undefined },
    openOnKey: { type: String, default: undefined },
    openAfterMs: { type: Number, default: undefined },
    className: { type: String, default: undefined },
    style: { type: [String, Object, Array] as PropType<StyleValue>, default: undefined },
    id: { type: String, default: undefined },
  },
  setup(props: FeedbacksWidgetProps, { slots }: { slots: { default?: () => unknown } }) {
    const instanceRef = { current: null as WidgetInstance | null }
    const isMounted = ref(false)
    const runtimeConfig = computed(() => {
      const savedConfig: SavedWidgetConfig = {
        apiUrl: props.apiUrl,
        enableUpdates: props.enableUpdates,
        updatesApiUrl: props.updatesApiUrl,
        updatesEventsApiUrl: props.updatesEventsApiUrl,
        embedMode: props.embedMode,
        position: props.position,
        target: sanitizeTargetSelector(props.target),
        buttonText: props.buttonText,
        primaryColor: props.primaryColor,
        backgroundColor: props.backgroundColor,
        scale: props.scale,
        modalWidth: props.modalWidth,
        debug: props.debug,
        requireEmail: props.requireEmail,
        enableType: props.enableType,
        enableRating: props.enableRating,
        enableScreenshot: props.enableScreenshot,
        screenshotRequired: props.screenshotRequired,
        enableAttachment: props.enableAttachment,
        attachmentMaxMB: props.attachmentMaxMB,
        allowedAttachmentMimes: props.allowedAttachmentMimes,
        requireCaptcha: props.requireCaptcha,
        captchaProvider: props.captchaProvider as CaptchaProvider | undefined,
        turnstileSiteKey: props.turnstileSiteKey,
        hcaptchaSiteKey: props.hcaptchaSiteKey,
        formTitle: props.formTitle,
        formSubtitle: props.formSubtitle,
        messageLabel: props.messageLabel,
        messagePlaceholder: props.messagePlaceholder,
        emailLabel: props.emailLabel,
        submitButtonText: props.submitButtonText,
        cancelButtonText: props.cancelButtonText,
        successTitle: props.successTitle,
        successDescription: props.successDescription,
        openOnKey: props.openOnKey,
        openAfterMs: props.openAfterMs,
      }

      return buildRuntimeWidgetConfig(props.projectKey, savedConfig, {
        appOrigin: props.appOrigin,
        apiUrl: props.apiUrl,
      })
    })
    const configKey = computed(() => JSON.stringify(runtimeConfig.value))

    const mountRuntime = async () => {
      instanceRef.current?.destroy?.()
      instanceRef.current = null

      await loadWidgetRuntime(props.appOrigin)
      if (!isMounted.value) return

      const runtimeWindow = window as WidgetRuntimeWindow
      const RuntimeCtor = resolveRuntimeCtor(runtimeWindow.FeedbacksWidget)
      if (!RuntimeCtor) throw new Error('Feedbacks widget runtime did not initialize correctly')
      instanceRef.current = new RuntimeCtor(runtimeConfig.value)
    }

    watch(
      () => [props.appOrigin, configKey.value],
      () => {
        if (!isMounted.value) return
        void mountRuntime().catch((error) => {
          console.error('[FeedbacksWidget] Unable to load runtime', error)
        })
      },
      { flush: 'post' }
    )

    onMounted(() => {
      isMounted.value = true
      void mountRuntime().catch((error) => {
        console.error('[FeedbacksWidget] Unable to load runtime', error)
      })
    })

    onBeforeUnmount(() => {
      isMounted.value = false
      instanceRef.current?.destroy?.()
      instanceRef.current = null
    })

    return () => {
      return h('div', {
        id: props.id,
        class: props.className,
        style: props.style,
        'data-feedbacks-host': props.projectKey,
      }, slots.default?.())
    }
  },
})

export default FeedbacksWidget
