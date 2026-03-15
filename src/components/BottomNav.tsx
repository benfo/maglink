import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'
import { Wand2, Clock } from 'lucide-react'

export type AppTab = 'generate' | 'history'

interface NavItem {
  value: AppTab
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  badge?: number
}

const NAV_ITEMS: NavItem[] = [
  { value: 'generate', label: 'Generate', icon: Wand2 },
  { value: 'history', label: 'History',  icon: Clock },
]

interface BottomNavProps {
  historyCount: number
}

export function BottomNav({ historyCount }: BottomNavProps) {
  const items: NavItem[] = NAV_ITEMS.map(item =>
    item.value === 'history' ? { ...item, badge: historyCount } : item
  )

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-border">
      {/* Safe area padding for iOS home indicator */}
      <TabsPrimitive.List className="max-w-lg mx-auto px-4 flex w-full" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {items.map(({ value, label, icon: Icon, badge }) => (
          <TabsPrimitive.Trigger
            key={value}
            value={value}
            className={cn(
              'group relative flex flex-1 flex-col items-center justify-center gap-1 h-16 text-muted-foreground',
              'transition-colors duration-200',
              'data-[state=active]:text-primary',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg',
            )}
          >
            {/* Active indicator pill */}
            <span className="absolute top-2 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-primary scale-x-0 transition-transform duration-200 group-data-[state=active]:scale-x-100" />

            <div className="relative">
              <Icon
                size={22}
                className="transition-transform duration-200 group-data-[state=active]:scale-110"
              />
              {badge != null && badge > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1 leading-none">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </div>

            <span className="text-[11px] font-medium leading-none">{label}</span>
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
    </div>
  )
}
