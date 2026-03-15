export const DEFAULT_TRACKERS = [
  'udp://tracker.opentrackr.org:1337/announce',
  'udp://open.demonii.com:1337/announce',
  'udp://tracker.openbittorrent.com:6969/announce',
  'udp://open.stealth.si:80/announce',
  'udp://tracker.torrent.eu.org:451/announce',
  'udp://exodus.desync.com:6969/announce',
  'udp://tracker.moeking.me:6969/announce',
  'https://tracker.tamersunion.org:443/announce',
]

export interface MagnetParams {
  hash: string
  name: string
  trackers?: string[]
  sizeBytes?: number
}

export function buildMagnetLink({ hash, name, trackers = DEFAULT_TRACKERS, sizeBytes }: MagnetParams): string {
  const cleanHash = hash.trim().replace(/^magnet:\?.*xt=urn:btih:/i, '').split('&')[0]
  const params = new URLSearchParams()
  params.set('xt', `urn:btih:${cleanHash}`)
  if (name.trim()) params.set('dn', name.trim())
  if (sizeBytes && sizeBytes > 0) params.set('xl', String(sizeBytes))
  trackers.forEach(t => params.append('tr', t))
  return `magnet:?${params.toString()}`
}

export function parseMagnetLink(magnet: string): Partial<MagnetParams> | null {
  if (!magnet.startsWith('magnet:?')) return null
  const query = magnet.slice(8)
  const params = new URLSearchParams(query)
  const xt = params.get('xt') ?? ''
  const hash = xt.replace('urn:btih:', '')
  const name = params.get('dn') ?? ''
  const xl = params.get('xl')
  const sizeBytes = xl ? Number(xl) : undefined
  const trackers = params.getAll('tr')
  return { hash, name, sizeBytes, trackers }
}

export function isValidHash(hash: string): boolean {
  const clean = hash.trim()
  // BTIHv1 (SHA-1 hex 40 chars or base32 32 chars) or BTIHv2 (SHA-256 hex 64 chars)
  return /^[0-9a-fA-F]{40}$/.test(clean) || /^[A-Z2-7]{32}$/i.test(clean) || /^[0-9a-fA-F]{64}$/.test(clean)
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}
