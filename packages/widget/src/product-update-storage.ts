export interface ProductUpdateSeenState { seen: Record<string, string>; dismissed: Record<string, string> }
const empty = (): ProductUpdateSeenState => ({ seen: {}, dismissed: {} })
export function createProductUpdateStorage(projectKey: string) {
  const key = `feedbacks:product-updates:v1:${projectKey.replace(/[^a-z0-9]/gi, '').slice(-12)}`
  let memory = empty()
  const read = () => { try { const parsed = JSON.parse(localStorage.getItem(key) || 'null'); if (parsed?.seen && parsed?.dismissed) memory = parsed; } catch {} return memory }
  const write = () => { const trim = (items: Record<string, string>) => Object.fromEntries(Object.entries(items).sort((a, b) => b[1].localeCompare(a[1])).slice(0, 100)); memory = { seen: trim(memory.seen), dismissed: trim(memory.dismissed) }; try { localStorage.setItem(key, JSON.stringify(memory)) } catch {} }
  return { read, markSeen(id: string) { read().seen[id] = new Date().toISOString(); write() }, markDismissed(id: string) { read().dismissed[id] = new Date().toISOString(); read().seen[id] = new Date().toISOString(); write() } }
}
