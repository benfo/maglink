import { set, del, entries } from 'idb-keyval'

export interface HistoryEntry {
  id: string
  name: string
  hash: string
  magnetLink: string
  trackers: string[]
  sizeBytes?: number
  createdAt: number
}

const PREFIX = 'mag:'

export async function saveEntry(entry: Omit<HistoryEntry, 'id' | 'createdAt'>): Promise<HistoryEntry> {
  const id = `${PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const full: HistoryEntry = { ...entry, id, createdAt: Date.now() }
  await set(id, full)
  return full
}

export async function getHistory(): Promise<HistoryEntry[]> {
  const all = await entries<string, HistoryEntry>()
  return all
    .filter(([key]) => String(key).startsWith(PREFIX))
    .map(([, v]) => v)
    .sort((a, b) => b.createdAt - a.createdAt)
}

export async function deleteEntry(id: string): Promise<void> {
  await del(id)
}

export async function clearHistory(): Promise<void> {
  const all = await entries<string, HistoryEntry>()
  await Promise.all(
    all
      .filter(([key]) => String(key).startsWith(PREFIX))
      .map(([key]) => del(key))
  )
}
