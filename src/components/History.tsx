import * as React from 'react'
import { Drawer } from 'vaul'
import { useLongPress } from 'use-long-press'
import { Trash2, ExternalLink, Copy, Clock, Search, Eraser, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import type { HistoryEntry } from '@/lib/history'
import { formatBytes } from '@/lib/magnet'

interface HistoryProps {
  entries: HistoryEntry[]
  onDelete: (id: string) => void
  onClear: () => void
  onSelect: (entry: HistoryEntry) => void
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  return `${d}d ago`
}

const canShare = typeof navigator !== 'undefined' && !!navigator.share

export function History({ entries, onDelete, onClear, onSelect }: HistoryProps) {
  const { toast } = useToast()
  const [search, setSearch] = React.useState('')
  const [menuEntry, setMenuEntry] = React.useState<HistoryEntry | null>(null)
  const suppressNextClick = React.useRef(false)

  const bind = useLongPress((_, { context: entry }) => {
    navigator.vibrate?.(30)
    suppressNextClick.current = true
    setMenuEntry(entry as HistoryEntry)
  }, {
    threshold: 500,
    cancelOnMovement: 10,
  })

  const filtered = entries.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.hash.toLowerCase().includes(search.toLowerCase())
  )

  const copyLink = async (magnetLink: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    try {
      await navigator.clipboard.writeText(magnetLink)
      toast('Copied!')
    } catch {
      toast('Failed to copy', 'error')
    }
  }

  const shareLink = async (entry: HistoryEntry) => {
    if (canShare) {
      try {
        await navigator.share({ title: entry.name, text: entry.magnetLink })
      } catch { /* user cancelled */ }
    } else {
      await copyLink(entry.magnetLink)
    }
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <Clock size={40} className="text-muted-foreground/40" />
        <p className="text-sm font-medium text-muted-foreground">No history yet</p>
        <p className="text-xs text-muted-foreground/60">Generated links will appear here</p>
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock size={16} className="text-muted-foreground" />
              History
              <Badge variant="secondary">{entries.length}</Badge>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 text-xs"
            >
              <Eraser size={13} />
              Clear all
            </Button>
          </div>

          {entries.length > 3 && (
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search history…"
                className="pl-8 h-9 text-xs"
              />
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex flex-col gap-2">
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No results</p>
            )}
            {filtered.map(entry => (
              <div
                key={entry.id}
                {...bind(entry)}
                onClick={() => {
                  if (suppressNextClick.current) {
                    suppressNextClick.current = false
                    return
                  }
                  onSelect(entry)
                }}
                className="group flex items-start justify-between gap-3 rounded-lg border border-border p-3.5 cursor-pointer hover:border-primary/40 hover:bg-secondary/50 transition-all duration-200 select-none"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{entry.name || 'Unnamed'}</p>
                  <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">
                    {entry.hash.slice(0, 16)}…
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-[10px] text-muted-foreground">{timeAgo(entry.createdAt)}</span>
                    {entry.sizeBytes && (
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5">{formatBytes(entry.sizeBytes)}</Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={e => copyLink(entry.magnetLink, e)}
                    className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-secondary active:bg-secondary opacity-40 group-hover:opacity-100 active:opacity-100 transition-all"
                    title="Copy link"
                  >
                    <Copy size={14} />
                  </button>
                  <a
                    href={entry.magnetLink}
                    onClick={e => e.stopPropagation()}
                    className="rounded-md p-2 text-muted-foreground hover:text-primary hover:bg-secondary active:bg-secondary opacity-40 group-hover:opacity-100 active:opacity-100 transition-all"
                    title="Open magnet link"
                  >
                    <ExternalLink size={14} />
                  </a>
                  <button
                    onClick={e => { e.stopPropagation(); onDelete(entry.id) }}
                    className="rounded-md p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:bg-destructive/10 active:text-destructive opacity-40 group-hover:opacity-100 active:opacity-100 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Drawer.Root open={menuEntry !== null} onOpenChange={open => { if (!open) setMenuEntry(null) }}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl bg-background border-t border-border outline-none">
            <Drawer.Handle className="mx-auto mt-3 mb-1 h-1.5 w-10 rounded-full bg-border" />

            {menuEntry && (
              <div className="px-4 pt-3 pb-8">
                <Drawer.Title className="text-sm font-semibold truncate mb-0.5">
                  {menuEntry.name || 'Unnamed'}
                </Drawer.Title>
                <p className="text-xs text-muted-foreground font-mono truncate mb-5">
                  {menuEntry.hash.slice(0, 20)}…
                </p>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => { copyLink(menuEntry.magnetLink); setMenuEntry(null) }}
                    className="flex items-center gap-3 w-full rounded-xl px-4 py-3.5 text-sm font-medium hover:bg-secondary active:bg-secondary transition-colors text-left"
                  >
                    <Copy size={18} className="text-muted-foreground shrink-0" />
                    Copy magnet link
                  </button>

                  <button
                    onClick={() => { shareLink(menuEntry); setMenuEntry(null) }}
                    className="flex items-center gap-3 w-full rounded-xl px-4 py-3.5 text-sm font-medium hover:bg-secondary active:bg-secondary transition-colors text-left"
                  >
                    <Share2 size={18} className="text-muted-foreground shrink-0" />
                    {canShare ? 'Share' : 'Share (copy)'}
                  </button>

                  <a
                    href={menuEntry.magnetLink}
                    onClick={() => setMenuEntry(null)}
                    className="flex items-center gap-3 w-full rounded-xl px-4 py-3.5 text-sm font-medium hover:bg-secondary active:bg-secondary transition-colors"
                  >
                    <ExternalLink size={18} className="text-muted-foreground shrink-0" />
                    Open magnet link
                  </a>

                  <button
                    onClick={() => { onDelete(menuEntry.id); setMenuEntry(null) }}
                    className="flex items-center gap-3 w-full rounded-xl px-4 py-3.5 text-sm font-medium text-destructive hover:bg-destructive/10 active:bg-destructive/10 transition-colors text-left"
                  >
                    <Trash2 size={18} className="shrink-0" />
                    Delete
                  </button>

                  <button
                    onClick={() => setMenuEntry(null)}
                    className="flex items-center justify-center w-full rounded-xl px-4 py-3.5 text-sm font-medium text-muted-foreground hover:bg-secondary active:bg-secondary transition-colors mt-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  )
}
