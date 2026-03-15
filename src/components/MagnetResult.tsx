import * as React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, ExternalLink, Share2, QrCode, X, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { formatBytes } from '@/lib/magnet'
import type { HistoryEntry } from '@/lib/history'

interface MagnetResultProps {
  entry: HistoryEntry
  onClose: () => void
}

export function MagnetResult({ entry, onClose }: MagnetResultProps) {
  const { toast } = useToast()
  const [showQR, setShowQR] = React.useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(entry.magnetLink)
      toast('Copied to clipboard!')
    } catch {
      toast('Failed to copy', 'error')
    }
  }

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: entry.name, text: entry.magnetLink })
      } catch { /* user cancelled */ }
    } else {
      await copyToClipboard()
    }
  }

  const downloadQR = () => {
    const svg = document.getElementById('qr-code')
    if (!svg) return
    const data = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([data], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${entry.name || 'magnet'}-qr.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="border-primary/30 glow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">{entry.name || 'Unnamed'}</CardTitle>
          <button
            onClick={onClose}
            className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-1">
          <Badge variant="secondary" className="font-mono text-[10px]">
            {entry.hash.slice(0, 8)}…{entry.hash.slice(-4)}
          </Badge>
          {entry.sizeBytes && (
            <Badge variant="outline">{formatBytes(entry.sizeBytes)}</Badge>
          )}
          <Badge variant="secondary">{entry.trackers.length} trackers</Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="rounded-lg bg-background border border-border p-3">
          <p className="text-xs font-mono text-muted-foreground break-all leading-relaxed select-all">
            {entry.magnetLink}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={copyToClipboard} variant="secondary" size="sm">
            <Copy size={14} />
            Copy
          </Button>
          <Button asChild size="sm">
            <a href={entry.magnetLink}>
              <ExternalLink size={14} />
              Open
            </a>
          </Button>
          <Button onClick={share} variant="outline" size="sm">
            <Share2 size={14} />
            Share
          </Button>
          <Button
            onClick={() => setShowQR(v => !v)}
            variant={showQR ? 'default' : 'outline'}
            size="sm"
          >
            <QrCode size={14} />
            QR Code
          </Button>
        </div>

        {showQR && (
          <div className="flex flex-col items-center gap-3 rounded-lg bg-white p-5">
            <QRCodeSVG
              id="qr-code"
              value={entry.magnetLink}
              size={200}
              level="M"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="#0f172a"
            />
            <Button onClick={downloadQR} variant="ghost" size="sm" className="text-slate-700 hover:text-slate-900 hover:bg-slate-100">
              <Download size={14} />
              Save QR
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
