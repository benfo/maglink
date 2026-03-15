import * as React from 'react'
import { Trash2, ExternalLink, Copy, Clock, Search, Eraser } from 'lucide-react'
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

export function History({ entries, onDelete, onClear, onSelect }: HistoryProps) {
  const { toast } = useToast()
  const [search, setSearch] = React.useState('')

  const filtered = entries.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.hash.toLowerCase().includes(search.toLowerCase())
  )

  const copyLink = async (e: React.MouseEvent, magnetLink: string) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(magnetLink)
      toast('Copied!')
    } catch {
      toast('Failed to copy', 'error')
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
              onClick={() => onSelect(entry)}
              className="group flex items-start justify-between gap-3 rounded-lg border border-border p-3.5 cursor-pointer hover:border-primary/40 hover:bg-secondary/50 transition-all duration-200"
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
                  onClick={e => copyLink(e, entry.magnetLink)}
                  className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary opacity-0 group-hover:opacity-100 transition-all"
                  title="Copy link"
                >
                  <Copy size={13} />
                </button>
                <a
                  href={entry.magnetLink}
                  onClick={e => e.stopPropagation()}
                  className="rounded-md p-1.5 text-muted-foreground hover:text-primary hover:bg-secondary opacity-0 group-hover:opacity-100 transition-all"
                  title="Open magnet link"
                >
                  <ExternalLink size={13} />
                </a>
                <button
                  onClick={e => { e.stopPropagation(); onDelete(entry.id) }}
                  className="rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
