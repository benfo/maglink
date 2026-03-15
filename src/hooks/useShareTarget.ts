import * as React from 'react'
import { extractFromText } from '@/lib/magnet'

export interface ShareTargetData {
  hash: string
  name: string
}

/**
 * Reads Web Share Target params from the URL on mount.
 * The manifest routes shared content to /?title=...&text=...&url=...
 * We scan all three fields for a hash/magnet link, use title as the name fallback.
 * Cleans up the URL after reading so it doesn't persist on refresh.
 */
export function useShareTarget(): ShareTargetData | null {
  const [data, setData] = React.useState<ShareTargetData | null>(null)

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const title = params.get('title') ?? ''
    const text  = params.get('text')  ?? ''
    const url   = params.get('url')   ?? ''

    if (!title && !text && !url) return

    // Clean the URL immediately so a refresh doesn't re-trigger
    window.history.replaceState({}, '', window.location.pathname)

    // Scan each field in priority order: text first (most likely to contain the hash), then url, then title
    for (const candidate of [text, url, title]) {
      if (!candidate) continue
      const extracted = extractFromText(candidate)
      if (extracted) {
        // Use page title as name if the magnet link didn't carry one
        setData({ hash: extracted.hash, name: extracted.name || title })
        return
      }
    }
  }, [])

  return data
}
