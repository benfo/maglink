import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ThemeToggleProps {
  theme: 'light' | 'dark'
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="rounded-xl"
    >
      {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
    </Button>
  )
}
