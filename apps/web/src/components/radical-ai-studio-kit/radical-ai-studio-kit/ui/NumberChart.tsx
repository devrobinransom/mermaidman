import * as React from 'react'
import { cn } from '@/lib/utils'

export interface NumberChartProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
}

const NumberChart = React.forwardRef<HTMLDivElement, NumberChartProps>(
  ({ className, label, value, change, trend = 'neutral', ...props }, ref) => {
    const trendStyles = {
      up: 'text-green-600',
      down: 'text-red-500',
      neutral: 'text-muted-foreground',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'border-3 border-border bg-card p-6 shadow-brutal-sm',
          className
        )}
        {...props}
      >
        <div className="text-sm font-bold text-muted-foreground">{label}</div>
        <div className="mt-2 text-3xl font-black">{value}</div>
        {change && (
          <div className={cn('mt-2 text-sm font-semibold', trendStyles[trend])}>
            {change}
          </div>
        )}
      </div>
    )
  }
)

NumberChart.displayName = 'NumberChart'

export { NumberChart }
