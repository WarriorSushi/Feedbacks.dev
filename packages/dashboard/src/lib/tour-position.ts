export interface TourRect {
  top: number
  left: number
  width: number
  height: number
}

interface TourSize {
  width: number
  height: number
}

const VIEWPORT_MARGIN = 16
const PANEL_GAP = 14
const MOBILE_BREAKPOINT = 768

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function fits(position: { top: number; left: number }, panel: TourSize, viewport: TourSize) {
  return position.left >= VIEWPORT_MARGIN &&
    position.top >= VIEWPORT_MARGIN &&
    position.left + panel.width <= viewport.width - VIEWPORT_MARGIN &&
    position.top + panel.height <= viewport.height - VIEWPORT_MARGIN
}

export function getTourPanelPosition({
  spotlight,
  panel,
  viewport,
  sidebarStep = false,
}: {
  spotlight: TourRect | null
  panel: TourSize
  viewport: TourSize
  sidebarStep?: boolean
}) {
  const width = Math.min(panel.width, viewport.width - VIEWPORT_MARGIN * 2)
  const height = Math.min(panel.height, viewport.height - VIEWPORT_MARGIN * 2)
  const measuredPanel = { width, height }

  if (!spotlight) {
    return viewport.width < MOBILE_BREAKPOINT
      ? { top: viewport.height - height - VIEWPORT_MARGIN, left: VIEWPORT_MARGIN }
      : { top: VIEWPORT_MARGIN, left: viewport.width - width - VIEWPORT_MARGIN }
  }

  const right = {
    top: clamp(spotlight.top, VIEWPORT_MARGIN, viewport.height - height - VIEWPORT_MARGIN),
    left: spotlight.left + spotlight.width + PANEL_GAP,
  }
  const left = {
    top: clamp(spotlight.top, VIEWPORT_MARGIN, viewport.height - height - VIEWPORT_MARGIN),
    left: spotlight.left - width - PANEL_GAP,
  }
  const below = {
    top: spotlight.top + spotlight.height + PANEL_GAP,
    left: clamp(spotlight.left, VIEWPORT_MARGIN, viewport.width - width - VIEWPORT_MARGIN),
  }
  const above = {
    top: spotlight.top - height - PANEL_GAP,
    left: clamp(spotlight.left, VIEWPORT_MARGIN, viewport.width - width - VIEWPORT_MARGIN),
  }

  const candidates = viewport.width < MOBILE_BREAKPOINT
    ? [below, above]
    : sidebarStep
      ? [right, below, above, left]
      : [right, left, below, above]
  const available = candidates.find((candidate) => fits(candidate, measuredPanel, viewport))
  if (available) return available

  const placeAtTop = spotlight.top + spotlight.height / 2 >= viewport.height / 2
  const placeAtLeft = spotlight.left + spotlight.width / 2 >= viewport.width / 2
  return {
    top: placeAtTop ? VIEWPORT_MARGIN : viewport.height - height - VIEWPORT_MARGIN,
    left: placeAtLeft ? VIEWPORT_MARGIN : viewport.width - width - VIEWPORT_MARGIN,
  }
}
