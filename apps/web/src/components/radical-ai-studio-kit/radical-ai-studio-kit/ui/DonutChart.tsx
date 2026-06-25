import * as React from 'react'
import { cn } from '@/lib/utils'

export interface DonutChartSegment {
  label: string
  value: number
  color?: string
}

export interface DonutChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: DonutChartSegment[]
  size?: number
  strokeWidth?: number
  showLegend?: boolean
  centerLabel?: string
}

const fallbackColors = ['#38BDF8', '#A855F7', '#F97316', '#22C55E', '#FACC15']

const DonutChart = React.forwardRef<HTMLDivElement, DonutChartProps>(
  (
    {
      className,
      data,
      size = 180,
      strokeWidth = 18,
      showLegend = true,
      centerLabel,
      ...props
    },
    ref
  ) => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius

    let offset = 0

    return (
      <div ref={ref} className={cn('space-y-4', className)} {...props}>
        <div className="relative inline-flex items-center justify-center">
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              className="stroke-muted"
              strokeWidth={strokeWidth}
            />
            {data.map((segment, index) => {
              const value = total === 0 ? 0 : (segment.value / total) * circumference
              const dashArray = `${value} ${circumference - value}`
              const dashOffset = -offset
              offset += value

              return (
                <circle
                  key={segment.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={segment.color || fallbackColors[index % fallbackColors.length]}
                  strokeWidth={strokeWidth}
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                />
              )
            })}
          </svg>
          <div className="absolute text-center">
            <div className="text-2xl font-black">{total}</div>
            {centerLabel && <div className="text-xs text-muted-foreground">{centerLabel}</div>}
          </div>
        </div>

        {showLegend && (
          <div className="grid gap-2 text-sm">
            {data.map((segment, index) => (
              <div key={segment.label} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: segment.color || fallbackColors[index % fallbackColors.length] }}
                />
                <span className="flex-1 text-foreground">{segment.label}</span>
                <span className="font-bold text-muted-foreground">{segment.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
)

DonutChart.displayName = 'DonutChart'

export { DonutChart }
