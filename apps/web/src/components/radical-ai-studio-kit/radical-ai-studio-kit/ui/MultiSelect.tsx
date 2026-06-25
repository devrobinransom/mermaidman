import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '@/lib/utils'

export interface MultiSelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface MultiSelectProps {
  options: MultiSelectOption[]
  value?: string[]
  onChange?: (value: string[]) => void
  placeholder?: string
  disabled?: boolean
  searchable?: boolean
  className?: string
}

const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    {
      options,
      value = [],
      onChange,
      placeholder = 'Select items...',
      disabled = false,
      searchable = true,
      className,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState('')

    const selectedOptions = options.filter((opt) => value.includes(opt.value))

    const filteredOptions = searchable
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(search.toLowerCase())
        )
      : options

    const handleToggle = (optionValue: string) => {
      const newValue = value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue]
      onChange?.(newValue)
    }

    const handleRemove = (optionValue: string, e: React.MouseEvent) => {
      e.stopPropagation()
      onChange?.(value.filter((v) => v !== optionValue))
    }

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation()
      onChange?.([])
    }

    return (
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger asChild>
          <button
            ref={ref}
            type="button"
            disabled={disabled}
            className={cn(
              'flex min-h-[44px] w-full items-center justify-between border-3 border-border bg-card px-3 py-2 text-base font-medium shadow-brutal transition-all',
              'focus:outline-none focus:ring-4 focus:ring-ring focus:ring-offset-4',
              'disabled:cursor-not-allowed disabled:opacity-50',
              className
            )}
          >
            <div className="flex flex-wrap gap-1.5 flex-1">
              {selectedOptions.length > 0 ? (
                selectedOptions.map((option) => (
                  <span
                    key={option.value}
                    className="inline-flex items-center gap-1 px-2 py-0.5 border-2 border-border bg-muted text-sm font-bold shadow-brutal-sm"
                  >
                    {option.label}
                    <button
                      type="button"
                      onClick={(e) => handleRemove(option.value, e)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <svg
                        className="h-3 w-3 stroke-[3]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>

            <div className="flex items-center gap-2 ml-2">
              {value.length > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="hover:text-red-500 transition-colors"
                >
                  <svg
                    className="h-4 w-4 stroke-[3]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
              <svg
                className="h-5 w-5"
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
            </div>
          </button>
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            className="z-50 w-[var(--radix-popover-trigger-width)] border-3 border-border bg-popover text-popover-foreground shadow-brutal-lg"
          >
            <div className="max-h-80 overflow-auto">
              {searchable && (
                <div className="p-2 border-b-3 border-border">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border-2 border-border bg-card px-3 py-2 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}

              <div className="p-1">
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                    No options found
                  </div>
                ) : (
                  filteredOptions.map((option) => {
                    const isSelected = value.includes(option.value)

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => !option.disabled && handleToggle(option.value)}
                        disabled={option.disabled}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 text-left text-base font-medium transition-colors',
                          'hover:bg-muted',
                          'disabled:opacity-50 disabled:cursor-not-allowed',
                          isSelected && 'bg-muted'
                        )}
                      >
                        <div
                          className={cn(
                            'h-5 w-5 border-3 border-border flex items-center justify-center transition-all',
                            isSelected && 'bg-primary'
                          )}
                        >
                          {isSelected && (
                            <svg
                              className="h-4 w-4 stroke-primary-foreground stroke-[3]"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="flex-1">{option.label}</span>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    )
  }
)

MultiSelect.displayName = 'MultiSelect'

export { MultiSelect }
