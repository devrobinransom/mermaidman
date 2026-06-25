import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const progressVariants = cva(
  'relative h-4 w-full overflow-hidden border-3 border-border bg-card shadow-brutal-sm',
  {
    variants: {
      size: {
        sm: 'h-2',
        md: 'h-4',
        lg: 'h-6',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

export interface ProgressProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof progressVariants> {
  value?: number
  max?: number
  color?: 'black' | 'red' | 'purple' | 'blue' | 'yellow'
  showLabel?: boolean
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value = 0,
      max = 100,
      size,
      color = 'blue',
      showLabel = false,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100))

    const colorClasses = {
      black: 'bg-primary',
      red: 'bg-red-500',
      purple: 'bg-purple-500',
      blue: 'bg-blue-500',
      yellow: 'bg-yellow-500',
    }

    return (
      <div className="w-full space-y-2">
        <div
          ref={ref}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          className={cn(progressVariants({ size, className }))}
          {...props}
        >
          <div
            className={cn(
              'h-full transition-all duration-300 ease-in-out',
              colorClasses[color]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <div className="text-sm font-bold text-muted-foreground">
            {Math.round(percentage)}%
          </div>
        )}
      </div>
    )
  }
)

Progress.displayName = 'Progress'

const CircularProgress = React.forwardRef<
  SVGSVGElement,
  {
    value?: number
    max?: number
    size?: number
    strokeWidth?: number
    color?: 'black' | 'red' | 'purple' | 'blue' | 'yellow'
    showLabel?: boolean
    className?: string
  }
>(
  (
    {
      value = 0,
      max = 100,
      size = 120,
      strokeWidth = 8,
      color = 'blue',
      showLabel = false,
      className,
    },
    ref
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100))
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (percentage / 100) * circumference

    const colorClasses = {
      black: 'stroke-primary',
      red: 'stroke-red-500',
      purple: 'stroke-purple-500',
      blue: 'stroke-blue-500',
      yellow: 'stroke-yellow-500',
    }

    return (
      <div className={cn('relative inline-flex items-center justify-center', className)}>
        <svg
          ref={ref}
          width={size}
          height={size}
          className="transform -rotate-90"
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            className="stroke-muted"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            className={cn(colorClasses[color], 'transition-all duration-300')}
            strokeWidth={strokeWidth}
            strokeLinecap="square"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        {showLabel && (
          <span className="absolute text-2xl font-black">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    )
  }
)

CircularProgress.displayName = 'CircularProgress'

export { Progress, CircularProgress, progressVariants }
