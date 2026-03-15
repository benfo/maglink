import * as React from 'react'
import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = React.useState(() => sessionStorage.getItem('pwa-dismissed') === '1')

  React.useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setDeferredPrompt(null)
  }

  const dismiss = () => {
    sessionStorage.setItem('pwa-dismissed', '1')
    setDismissed(true)
  }

  if (!deferredPrompt || dismissed) return null

  return (
    <div className="glass border border-primary/20 rounded-xl p-4 flex items-center gap-3">
      <div className="flex-1">
        <p className="text-sm font-semibold">Install App</p>
        <p className="text-xs text-muted-foreground">Add to home screen for quick access offline</p>
      </div>
      <Button onClick={install} size="sm" className="shrink-0">
        <Download size={13} />
        Install
      </Button>
      <button onClick={dismiss} className="shrink-0 text-muted-foreground hover:text-foreground">
        <X size={16} />
      </button>
    </div>
  )
}
