import * as React from 'react'
import { cn } from '@/lib/utils'

export interface AxisChartDatum {
  label: string
  value: number
}

export interface AxisChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: AxisChartDatum[]
  type?: 'bar' | 'line'
  height?: number
  max?: number
  showGrid?: boolean
}

const AxisChart = React.forwardRef<HTMLDivElement, AxisChartProps>(
  (
    { className, data, type = 'bar', height = 200, max, showGrid = true, ...props },
    ref
  ) => {
    const maxValue = max ?? Math.max(1, ...data.map((item) => item.value))

    return (
      <div ref={ref} className={cn('space-y-3', className)} {...props}>
        {type === 'bar' ? (
          <div
            className={cn(
              'relative flex items-end gap-3 border-2 border-border bg-card p-4 shadow-brutal-sm'
            )}
            style={{ height }}
          >
            {showGrid && (
              <div className="absolute inset-0 grid grid-rows-4 border-t-0 pointer-events-none">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="border-t border-border" />
                ))}
              </div>
            )}
            {data.map((item) => {
              const percentage = Math.max(0, Math.min(100, (item.value / maxValue) * 100))
              return (
                <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-sm bg-primary shadow-brutal-sm transition-all"
                    style={{ height: `${percentage}%` }}
                    aria-label={`${item.label}: ${item.value}`}
                  />
                </div>
              )
            })}
          </div>
        ) : (
          <div className="border-2 border-border bg-card p-4 shadow-brutal-sm">
            <svg viewBox="0 0 100 100" height={height} width="100%">
              {showGrid && (
                <>
                  {[20, 40, 60, 80].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      x2="100"
                      y1={y}
                      y2={y}
                      className="stroke-border/40"
                      strokeWidth="0.5"
                    />
                  ))}
                </>
              )}
              <polyline
                fill="none"
                className="stroke-primary"
                strokeWidth="2"
                points={data
                  .map((item, index) => {
                    const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100
                    const y = 100 - Math.min(100, (item.value / maxValue) * 100)
                    return `${x},${y}`
                  })
                  .join(' ')}
              />
              {data.map((item, index) => {
                const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100
                const y = 100 - Math.min(100, (item.value / maxValue) * 100)
                return (
                  <circle
                    key={item.label}
                    cx={x}
                    cy={y}
                    r="2.5"
                    className="fill-primary"
                  />
                )
              })}
            </svg>
          </div>
        )}
        <div className="flex gap-3 text-xs text-muted-foreground">
          {data.map((item) => (
            <div key={item.label} className="flex-1 text-center truncate">
              {item.label}
            </div>
          ))}
        </div>
      </div>
    )
  }
)

AxisChart.displayName = 'AxisChart'

export { AxisChart }
