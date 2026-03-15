import * as React from 'react'
import { Magnet } from 'lucide-react'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { MagnetForm } from '@/components/MagnetForm'
import { MagnetResult } from '@/components/MagnetResult'
import { History } from '@/components/History'
import { InstallPrompt } from '@/components/InstallPrompt'
import { ThemeToggle } from '@/components/ThemeToggle'
import { BottomNav, type AppTab } from '@/components/BottomNav'
import { useToast } from '@/components/ui/toast'
import { useTheme } from '@/hooks/useTheme'
import { buildMagnetLink } from '@/lib/magnet'
import { saveEntry, getHistory, deleteEntry, clearHistory, type HistoryEntry } from '@/lib/history'

export default function App() {
  const { toast } = useToast()
  const { theme, toggle } = useTheme()
  const [activeTab, setActiveTab] = React.useState<AppTab>('generate')
  const [history, setHistory] = React.useState<HistoryEntry[]>([])
  const [currentEntry, setCurrentEntry] = React.useState<HistoryEntry | null>(null)

  React.useEffect(() => {
    getHistory().then(setHistory)
  }, [])

  const handleGenerate = async (params: {
    name: string
    hash: string
    trackers: string[]
    sizeBytes?: number
  }) => {
    const magnetLink = buildMagnetLink(params)
    try {
      const entry = await saveEntry({ ...params, magnetLink })
      setCurrentEntry(entry)
      setHistory(prev => [entry, ...prev])
    } catch {
      toast('Failed to save to history', 'error')
      setCurrentEntry({
        id: 'temp',
        ...params,
        magnetLink,
        createdAt: Date.now(),
        trackers: params.trackers,
      })
    }
  }

  const handleDelete = async (id: string) => {
    await deleteEntry(id)
    setHistory(prev => prev.filter(e => e.id !== id))
    if (currentEntry?.id === id) setCurrentEntry(null)
  }

  const handleClear = async () => {
    await clearHistory()
    setHistory([])
    setCurrentEntry(null)
  }

  const handleSelectFromHistory = (entry: HistoryEntry) => {
    setCurrentEntry(entry)
    setActiveTab('generate')
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={v => setActiveTab(v as AppTab)}
      className="flex flex-col min-h-screen bg-background"
    >
      {/* Header */}
      <header className="glass sticky top-0 z-40 border-b border-border shrink-0">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
            <Magnet size={16} className="text-primary" />
          </div>
          <span className="font-semibold text-sm tracking-tight">MagLinkGen</span>
          <div className="ml-auto">
            <ThemeToggle theme={theme} onToggle={toggle} />
          </div>
        </div>
      </header>

      {/* Generate tab */}
      <TabsContent
        value="generate"
        className="flex-1 overflow-y-auto focus-visible:outline-none"
      >
        <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-5 pb-28">
          <InstallPrompt />
          <MagnetForm onGenerate={handleGenerate} />
          {currentEntry && (
            <MagnetResult
              entry={currentEntry}
              onClose={() => setCurrentEntry(null)}
            />
          )}
        </div>
      </TabsContent>

      {/* History tab */}
      <TabsContent
        value="history"
        className="flex-1 overflow-y-auto focus-visible:outline-none"
      >
        <div className="max-w-lg mx-auto px-4 py-6 pb-28">
          <History
            entries={history}
            onDelete={handleDelete}
            onClear={handleClear}
            onSelect={handleSelectFromHistory}
          />
        </div>
      </TabsContent>

      {/* Bottom navigation */}
      <BottomNav historyCount={history.length} />
    </Tabs>
  )
}
