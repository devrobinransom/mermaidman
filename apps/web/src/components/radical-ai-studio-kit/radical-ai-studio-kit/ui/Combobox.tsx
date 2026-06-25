import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ComboboxOption {
  value: string
  label: string
  group?: string
}

export interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  emptyMessage?: string
}

const Combobox = React.forwardRef<HTMLDivElement, ComboboxProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = 'Select option...',
      disabled = false,
      className,
      emptyMessage = 'No options found',
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState('')
    const [highlightedIndex, setHighlightedIndex] = React.useState(0)
    const wrapperRef = React.useRef<HTMLDivElement>(null)
    const inputRef = React.useRef<HTMLInputElement>(null)

    const selectedOption = options.find((opt) => opt.value === value)

    const filteredOptions = React.useMemo(() => {
      return options.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase())
      )
    }, [options, search])

    const groupedOptions = React.useMemo(() => {
      const groups: Record<string, ComboboxOption[]> = {}
      filteredOptions.forEach((option) => {
        const group = option.group || 'default'
        if (!groups[group]) groups[group] = []
        groups[group].push(option)
      })
      return groups
    }, [filteredOptions])

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
          setOpen(false)
          setSearch('')
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = (option: ComboboxOption) => {
      onChange?.(option.value)
      setOpen(false)
      setSearch('')
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setOpen(true)
        }
        return
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev))
          break
        case 'Enter':
          e.preventDefault()
          if (filteredOptions[highlightedIndex]) {
            handleSelect(filteredOptions[highlightedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          setOpen(false)
          setSearch('')
          break
      }
    }

    return (
      <div ref={wrapperRef} className={cn('relative w-full', className)}>
        <button
          ref={ref as any}
          type="button"
          onClick={() => !disabled && setOpen(!open)}
          disabled={disabled}
          className={cn(
            'flex h-11 w-full items-center justify-between border-3 border-border bg-card px-4 py-2 text-base font-medium shadow-brutal transition-all',
            'focus:outline-none focus:ring-4 focus:ring-ring focus:ring-offset-4',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          <span className={cn(!selectedOption && 'text-muted-foreground')}>
            {selectedOption?.label || placeholder}
          </span>
          <svg
            className={cn('h-5 w-5 transition-transform', open && 'rotate-180')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {open && (
          <div className="absolute z-50 w-full mt-2 border-3 border-border bg-popover text-popover-foreground shadow-brutal-lg">
            <div className="p-2 border-b-3 border-border">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setHighlightedIndex(0)
                }}
                onKeyDown={handleKeyDown}
                className="w-full border-2 border-border bg-card px-3 py-2 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
            </div>

            <div className="max-h-80 overflow-auto p-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                  {emptyMessage}
                </div>
              ) : (
                Object.entries(groupedOptions).map(([group, groupOptions]) => (
                  <div key={group}>
                    {group !== 'default' && (
                      <div className="px-3 py-2 text-xs font-black text-muted-foreground uppercase">
                        {group}
                      </div>
                    )}
                    {groupOptions.map((option) => {
                      const globalIndex = filteredOptions.indexOf(option)
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleSelect(option)}
                          onMouseEnter={() => setHighlightedIndex(globalIndex)}
                          className={cn(
                            'w-full text-left px-3 py-2 text-base font-medium transition-colors',
                            'hover:bg-muted',
                            globalIndex === highlightedIndex && 'bg-muted',
                            option.value === value && 'font-bold'
                          )}
                        >
                          {option.label}
                          {option.value === value && (
                            <svg
                              className="inline-block ml-2 h-4 w-4 stroke-[3]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>
                      )
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
)

Combobox.displayName = 'Combobox'

export { Combobox }
