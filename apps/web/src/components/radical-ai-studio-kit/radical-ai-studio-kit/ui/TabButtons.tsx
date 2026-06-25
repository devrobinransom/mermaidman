import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TabButton {
  value: string
  label: React.ReactNode
  icon?: React.ReactNode
  disabled?: boolean
}

export interface TabButtonsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  tabs: TabButton[]
  value?: string
  onChange?: (value: string) => void
  color?: 'black' | 'red' | 'purple' | 'blue' | 'yellow'
  size?: 'sm' | 'md' | 'lg'
}

const TabButtons = React.forwardRef<HTMLDivElement, TabButtonsProps>(
  ({ className, tabs, value, onChange, color = 'black', size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-base gap-2',
      lg: 'px-6 py-3 text-lg gap-2.5',
    }

    const colorClasses = {
      black: {
        active: 'bg-primary text-primary-foreground shadow-brutal',
        inactive: 'bg-card text-foreground hover:bg-muted',
      },
      red: {
        active: 'bg-red-500 text-white shadow-brutal-red',
        inactive: 'bg-card text-red-500 hover:bg-red-50',
      },
      purple: {
        active: 'bg-purple-500 text-white shadow-brutal-purple',
        inactive: 'bg-card text-purple-500 hover:bg-purple-50',
      },
      blue: {
        active: 'bg-blue-500 text-white shadow-brutal-blue',
        inactive: 'bg-card text-blue-500 hover:bg-blue-50',
      },
      yellow: {
        active: 'bg-yellow-500 text-black shadow-brutal-yellow',
        inactive: 'bg-card text-yellow-600 hover:bg-yellow-50',
      },
    }

    return (
      <div
        ref={ref}
        className={cn('inline-flex gap-2 p-1', className)}
        role="tablist"
        {...props}
      >
        {tabs.map((tab) => {
          const isActive = value === tab.value

          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && onChange?.(tab.value)}
              className={cn(
                'inline-flex items-center justify-center font-bold border-3 border-border transition-all',
                'focus:outline-none focus:ring-4 focus:ring-ring focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                sizeClasses[size],
                isActive ? colorClasses[color].active : colorClasses[color].inactive,
                isActive && 'translate-x-0.5 translate-y-0.5'
              )}
            >
              {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
    )
  }
)

TabButtons.displayName = 'TabButtons'

export { TabButtons }
