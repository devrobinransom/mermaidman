import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './Dialog'
import { Input } from './Input'
import { cn } from '@/lib/utils'

export interface CommandItem {
  id: string
  label: string
  keywords?: string[]
  shortcut?: string
  onSelect?: () => void
}

export interface CommandPaletteProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  items: CommandItem[]
  placeholder?: string
  emptyText?: string
  title?: string
}

const CommandPalette = ({
  open,
  onOpenChange,
  items,
  placeholder = 'Type a command or search...',
  emptyText = 'No commands found.',
  title = 'Command Palette',
}: CommandPaletteProps) => {
  const [query, setQuery] = React.useState('')
  const [highlightedIndex, setHighlightedIndex] = React.useState(0)

  React.useEffect(() => {
    if (!open) {
      setQuery('')
      setHighlightedIndex(0)
    }
  }, [open])

  const filteredItems = React.useMemo(() => {
    if (!query) return items
    const q = query.toLowerCase()
    return items.filter((item) => {
      if (item.label.toLowerCase().includes(q)) return true
      return item.keywords?.some((kw) => kw.toLowerCase().includes(q))
    })
  }, [items, query])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!filteredItems.length) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setHighlightedIndex((prev) =>
          prev < filteredItems.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        event.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev))
        break
      case 'Enter':
        event.preventDefault()
        if (filteredItems[highlightedIndex]) {
          const item = filteredItems[highlightedIndex]
          item.onSelect?.()
          onOpenChange?.(false)
        }
        break
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-4">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setHighlightedIndex(0)
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="h-11"
          />
          <div className="max-h-72 overflow-auto border-2 border-border bg-card shadow-brutal-sm">
            {filteredItems.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground text-center">
                {emptyText}
              </div>
            ) : (
              filteredItems.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    item.onSelect?.()
                    onOpenChange?.(false)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium transition-colors',
                    'border-b border-border last:border-b-0',
                    index === highlightedIndex ? 'bg-muted' : 'bg-card'
                  )}
                >
                  <span className="truncate">{item.label}</span>
                  {item.shortcut && (
                    <span className="text-xs text-muted-foreground">{item.shortcut}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

CommandPalette.displayName = 'CommandPalette'

export { CommandPalette }
