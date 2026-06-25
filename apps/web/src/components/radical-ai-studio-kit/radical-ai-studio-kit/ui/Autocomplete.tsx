import * as React from 'react'
import { cn } from '@/lib/utils'

export interface AutocompleteOption {
  value: string
  label: string
  description?: string
}

export interface AutocompleteProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onSelect'> {
  options: AutocompleteOption[]
  value?: string
  onChange?: (value: string) => void
  onSelect?: (option: AutocompleteOption) => void
  loading?: boolean
  minChars?: number
}

const Autocomplete = React.forwardRef<HTMLInputElement, AutocompleteProps>(
  (
    {
      className,
      options,
      value = '',
      onChange,
      onSelect,
      loading = false,
      minChars = 1,
      placeholder = 'Type to search...',
      ...props
    },
    ref
  ) => {
    const [inputValue, setInputValue] = React.useState(value)
    const [showOptions, setShowOptions] = React.useState(false)
    const [highlightedIndex, setHighlightedIndex] = React.useState(0)
    const wrapperRef = React.useRef<HTMLDivElement>(null)

    const filteredOptions = React.useMemo(() => {
      if (inputValue.length < minChars) return []
      return options.filter((option) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      )
    }, [options, inputValue, minChars])

    React.useEffect(() => {
      setInputValue(value)
    }, [value])

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
          setShowOptions(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInputValue(newValue)
      onChange?.(newValue)
      setShowOptions(true)
      setHighlightedIndex(0)
    }

    const handleSelect = (option: AutocompleteOption) => {
      setInputValue(option.label)
      onChange?.(option.value)
      onSelect?.(option)
      setShowOptions(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showOptions || filteredOptions.length === 0) return

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
          setShowOptions(false)
          break
      }
    }

    return (
      <div ref={wrapperRef} className="relative w-full">
        <input
          ref={ref}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue.length >= minChars && setShowOptions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'flex h-11 w-full border-3 border-border bg-card px-4 py-2 text-base font-medium shadow-brutal transition-all',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-4 focus:ring-ring focus:ring-offset-4',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          {...props}
        />

        {showOptions && inputValue.length >= minChars && (
          <div className="absolute z-50 w-full mt-2 border-3 border-border bg-popover text-popover-foreground shadow-brutal-lg max-h-80 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin h-5 w-5 border-3 border-border border-t-transparent" />
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground text-center">
                No results found
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={cn(
                    'w-full text-left px-4 py-3 text-base font-medium transition-colors border-b-2 border-border last:border-b-0',
                    'hover:bg-muted',
                    index === highlightedIndex && 'bg-muted'
                  )}
                >
                  <div className="font-bold">{option.label}</div>
                  {option.description && (
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {option.description}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    )
  }
)

Autocomplete.displayName = 'Autocomplete'

export { Autocomplete }
