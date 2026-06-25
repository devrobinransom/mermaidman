import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '@/lib/utils'

export interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  disabled?: boolean
  placeholder?: string
  minDate?: Date
  maxDate?: Date
  className?: string
}

const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      disabled = false,
      placeholder = 'Pick a date',
      minDate,
      maxDate,
      className,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false)
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value)
    const [currentMonth, setCurrentMonth] = React.useState(
      value || new Date()
    )

    React.useEffect(() => {
      setSelectedDate(value)
    }, [value])

    const daysInMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    }

    const firstDayOfMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    }

    const formatDate = (date: Date | undefined) => {
      if (!date) return placeholder
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    }

    const handleDateSelect = (day: number) => {
      const newDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      )

      if (minDate && newDate < minDate) return
      if (maxDate && newDate > maxDate) return

      setSelectedDate(newDate)
      onChange?.(newDate)
      setOpen(false)
    }

    const handlePreviousMonth = () => {
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
      )
    }

    const handleNextMonth = () => {
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
      )
    }

    const isDateDisabled = (day: number) => {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      )
      if (minDate && date < minDate) return true
      if (maxDate && date > maxDate) return true
      return false
    }

    const isToday = (day: number) => {
      const today = new Date()
      return (
        day === today.getDate() &&
        currentMonth.getMonth() === today.getMonth() &&
        currentMonth.getFullYear() === today.getFullYear()
      )
    }

    const isSelected = (day: number) => {
      if (!selectedDate) return false
      return (
        day === selectedDate.getDate() &&
        currentMonth.getMonth() === selectedDate.getMonth() &&
        currentMonth.getFullYear() === selectedDate.getFullYear()
      )
    }

    const days = []
    const totalDays = daysInMonth(currentMonth)
    const startDay = firstDayOfMonth(currentMonth)

    // Empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} />)
    }

    // Actual days
    for (let day = 1; day <= totalDays; day++) {
      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateSelect(day)}
          disabled={isDateDisabled(day)}
          className={cn(
            'h-10 w-10 text-sm font-bold border-2 border-border transition-all',
            'hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed',
            isSelected(day) && 'bg-primary text-primary-foreground shadow-brutal-sm',
            isToday(day) && !isSelected(day) && 'border-blue-500 text-blue-500',
            !isSelected(day) && 'bg-card'
          )}
        >
          {day}
        </button>
      )
    }

    return (
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger asChild>
          <button
            ref={ref}
            type="button"
            disabled={disabled}
            className={cn(
              'flex h-11 w-full items-center justify-between border-3 border-border bg-card px-4 py-2 text-base font-medium shadow-brutal transition-all',
              'placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-4 focus:ring-ring focus:ring-offset-4',
              'disabled:cursor-not-allowed disabled:opacity-50',
              className
            )}
          >
            <span className={cn(!selectedDate && 'text-muted-foreground')}>
              {formatDate(selectedDate)}
            </span>
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </button>
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            className="z-50 w-auto border-3 border-border bg-popover text-popover-foreground p-4 shadow-brutal-lg"
          >
            <div className="space-y-4">
              {/* Month navigation */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePreviousMonth}
                  className="h-8 w-8 border-2 border-border bg-card hover:bg-muted transition-colors"
                >
                  <svg
                    className="h-4 w-4 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <div className="text-base font-black">
                  {currentMonth.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="h-8 w-8 border-2 border-border bg-card hover:bg-muted transition-colors"
                >
                  <svg
                    className="h-4 w-4 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <div
                    key={day}
                    className="h-10 w-10 flex items-center justify-center text-xs font-bold text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">{days}</div>
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    )
  }
)

DatePicker.displayName = 'DatePicker'

export { DatePicker }
