import * as React from 'react'
import { cn } from '@/lib/utils'

export interface CalendarEvent {
  id: string
  title: string
  date: Date
  color?: 'red' | 'purple' | 'blue' | 'yellow' | 'black'
  allDay?: boolean
}

export interface CalendarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: Date
  onChange?: (date: Date) => void
  mode?: 'single' | 'range'
  rangeValue?: { start?: Date; end?: Date }
  onRangeChange?: (range: { start?: Date; end?: Date }) => void
  events?: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
  minDate?: Date
  maxDate?: Date
  disabledDates?: Date[]
  showWeekNumbers?: boolean
}

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  (
    {
      className,
      value,
      onChange,
      mode = 'single',
      rangeValue = {},
      onRangeChange,
      events = [],
      onEventClick,
      minDate,
      maxDate,
      disabledDates = [],
      showWeekNumbers = false,
      ...props
    },
    ref
  ) => {
    const [currentMonth, setCurrentMonth] = React.useState(value || new Date())
    const [hoveredDate, setHoveredDate] = React.useState<Date | null>(null)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    const daysInMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    }

    const firstDayOfMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    }

    const isSameDay = (date1: Date, date2: Date): boolean => {
      return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
      )
    }

    const isDateDisabled = (date: Date): boolean => {
      if (minDate && date < minDate) return true
      if (maxDate && date > maxDate) return true
      return disabledDates.some((d) => isSameDay(d, date))
    }

    const isInRange = (date: Date): boolean => {
      if (mode !== 'range' || !rangeValue.start) return false
      const end = rangeValue.end || hoveredDate
      if (!end) return false

      const start = rangeValue.start
      return date >= start && date <= end
    }

    const handleDateClick = (date: Date) => {
      if (isDateDisabled(date)) return

      if (mode === 'single') {
        onChange?.(date)
      } else {
        // Range mode
        if (!rangeValue.start || (rangeValue.start && rangeValue.end)) {
          onRangeChange?.({ start: date, end: undefined })
        } else {
          if (date < rangeValue.start) {
            onRangeChange?.({ start: date, end: rangeValue.start })
          } else {
            onRangeChange?.({ start: rangeValue.start, end: date })
          }
        }
      }
    }

    const goToPreviousMonth = () => {
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
      )
    }

    const goToNextMonth = () => {
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
      )
    }

    const getEventsForDate = (date: Date): CalendarEvent[] => {
      return events.filter((event) => isSameDay(event.date, date))
    }

    const renderCalendar = () => {
      const days = []
      const totalDays = daysInMonth(currentMonth)
      const startDay = firstDayOfMonth(currentMonth)

      // Previous month's trailing days
      const prevMonthDays = daysInMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
      )
      for (let i = startDay - 1; i >= 0; i--) {
        days.push(
          <div
            key={`prev-${i}`}
            className="p-2 text-muted-foreground text-center text-sm font-medium"
          >
            {prevMonthDays - i}
          </div>
        )
      }

      // Current month's days
      for (let day = 1; day <= totalDays; day++) {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
        const isToday = isSameDay(date, today)
        const isSelected = value && isSameDay(date, value)
        const isRangeStart = rangeValue.start && isSameDay(date, rangeValue.start)
        const isRangeEnd = rangeValue.end && isSameDay(date, rangeValue.end)
        const inRange = isInRange(date)
        const disabled = isDateDisabled(date)
        const dayEvents = getEventsForDate(date)

        days.push(
          <div
            key={day}
            onMouseEnter={() => mode === 'range' && setHoveredDate(date)}
            onMouseLeave={() => mode === 'range' && setHoveredDate(null)}
            className={cn(
              'relative p-2 text-center text-sm font-medium cursor-pointer transition-all border-2',
              'hover:border-border',
              disabled
                ? 'cursor-not-allowed opacity-40 border-transparent'
                : 'border-transparent',
              isToday && 'border-border font-black',
              isSelected && 'bg-primary text-primary-foreground',
              (isRangeStart || isRangeEnd) && 'bg-primary text-primary-foreground',
              inRange && !isRangeStart && !isRangeEnd && 'bg-muted',
              !disabled && !isSelected && 'hover:bg-muted'
            )}
            onClick={() => !disabled && handleDateClick(date)}
          >
            <div>{day}</div>
            {dayEvents.length > 0 && (
              <div className="flex gap-0.5 mt-1 justify-center flex-wrap">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick?.(event)
                    }}
                    className={cn(
                      'h-1.5 w-1.5 rounded-full cursor-pointer',
                      event.color === 'red' && 'bg-red',
                      event.color === 'purple' && 'bg-purple',
                      event.color === 'blue' && 'bg-blue',
                      event.color === 'yellow' && 'bg-yellow',
                      (!event.color || event.color === 'black') && 'bg-primary'
                    )}
                    title={event.title}
                  />
                ))}
                {dayEvents.length > 3 && (
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" title={`+${dayEvents.length - 3} more`} />
                )}
              </div>
            )}
          </div>
        )
      }

      // Next month's leading days
      const remainingDays = 42 - days.length // 6 rows × 7 days
      for (let i = 1; i <= remainingDays; i++) {
        days.push(
          <div
            key={`next-${i}`}
            className="p-2 text-muted-foreground text-center text-sm font-medium"
          >
            {i}
          </div>
        )
      }

      return days
    }

    return (
      <div
        ref={ref}
        className={cn(
          'border-3 border-border bg-card shadow-brutal p-4',
          className
        )}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="p-2 border-2 border-border bg-card hover:bg-muted transition-all hover:translate-x-0.5 hover:translate-y-0.5"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <h2 className="text-lg font-black">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>

          <button
            type="button"
            onClick={goToNextMonth}
            className="p-2 border-2 border-border bg-card hover:bg-muted transition-all hover:translate-x-0.5 hover:translate-y-0.5"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {showWeekNumbers && <div className="p-2 text-center text-xs font-black text-muted-foreground">W</div>}
          {dayNames.map((day) => (
            <div key={day} className="p-2 text-center text-xs font-black text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
      </div>
    )
  }
)

Calendar.displayName = 'Calendar'

export { Calendar }
