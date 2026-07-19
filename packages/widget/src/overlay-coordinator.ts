type OverlayKind = 'feedback' | 'updates'

interface OverlayRegistration {
  owner: object
  kind: OverlayKind
  close: () => void
}

interface OverlayCoordinatorState {
  active: OverlayRegistration | null
  updateOwners: Map<string, object>
  availableListeners: Set<() => void>
}

const coordinatorKey = Symbol.for('feedbacks.overlay-coordinator.v1')

function state(): OverlayCoordinatorState {
  const root = globalThis as Record<PropertyKey, unknown>
  const existing = root[coordinatorKey] as OverlayCoordinatorState | undefined
  if (existing) return existing
  const created: OverlayCoordinatorState = { active: null, updateOwners: new Map(), availableListeners: new Set() }
  root[coordinatorKey] = created
  return created
}

export function hasActiveOverlay(): boolean {
  return state().active !== null
}

export function acquireOverlay(owner: object, kind: OverlayKind, close: () => void): void {
  const coordinator = state()
  const previous = coordinator.active
  if (previous && previous.owner !== owner) {
    coordinator.active = null
    previous.close()
  }
  coordinator.active = { owner, kind, close }
}

export function releaseOverlay(owner: object): void {
  const coordinator = state()
  if (coordinator.active?.owner !== owner) return
  coordinator.active = null
  queueMicrotask(() => coordinator.availableListeners.forEach((listener) => listener()))
}

export function onOverlayAvailable(listener: () => void): () => void {
  const listeners = state().availableListeners
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function claimUpdatesOwner(projectKey: string, owner: object): boolean {
  const coordinator = state()
  const current = coordinator.updateOwners.get(projectKey)
  if (current && current !== owner) return false
  coordinator.updateOwners.set(projectKey, owner)
  return true
}

export function releaseUpdatesOwner(projectKey: string, owner: object): void {
  const coordinator = state()
  if (coordinator.updateOwners.get(projectKey) === owner) coordinator.updateOwners.delete(projectKey)
}
