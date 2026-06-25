import * as React from 'react'
import { cn } from '@/lib/utils'

export interface FunnelChartStep {
  label: string
  value: number
  color?: string
}

export interface FunnelChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: FunnelChartStep[]
}

const FunnelChart = React.forwardRef<HTMLDivElement, FunnelChartProps>(
  ({ className, data, ...props }, ref) => {
    const maxValue = Math.max(1, ...data.map((step) => step.value))

    return (
      <div ref={ref} className={cn('space-y-3', className)} {...props}>
        {data.map((step, index) => {
          const width = Math.max(10, (step.value / maxValue) * 100)
          return (
            <div key={step.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{step.label}</span>
                <span className="text-muted-foreground">{step.value}</span>
              </div>
              <div className="h-8 w-full rounded-sm border-2 border-border bg-card shadow-brutal-sm">
                <div
                  className="h-full rounded-sm bg-primary transition-all"
                  style={{ width: `${width}%`, background: step.color || undefined }}
                />
              </div>
              {index < data.length - 1 && (
                <div className="h-3 w-px bg-border/60 mx-auto" />
              )}
            </div>
          )
        })}
      </div>
    )
  }
)

FunnelChart.displayName = 'FunnelChart'

export { FunnelChart }
