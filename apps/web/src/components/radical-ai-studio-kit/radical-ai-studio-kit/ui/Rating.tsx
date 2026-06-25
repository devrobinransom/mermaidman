import * as React from 'react'
import { cn } from '@/lib/utils'

export interface RatingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: number
  onChange?: (value: number) => void
  max?: number
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'black' | 'red' | 'purple' | 'blue' | 'yellow'
}

const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      className,
      value = 0,
      onChange,
      max = 5,
      readonly = false,
      size = 'md',
      color = 'yellow',
      ...props
    },
    ref
  ) => {
    const [hoverValue, setHoverValue] = React.useState<number | null>(null)

    const sizeClasses = {
      sm: 'h-5 w-5',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
    }

    const colorClasses = {
      black: 'fill-black stroke-black',
      red: 'fill-red-500 stroke-red-500',
      purple: 'fill-purple-500 stroke-purple-500',
      blue: 'fill-blue-500 stroke-blue-500',
      yellow: 'fill-yellow-500 stroke-yellow-500',
    }

    const handleClick = (rating: number) => {
      if (!readonly) {
        onChange?.(rating)
      }
    }

    const handleMouseEnter = (rating: number) => {
      if (!readonly) {
        setHoverValue(rating)
      }
    }

    const handleMouseLeave = () => {
      setHoverValue(null)
    }

    const displayValue = hoverValue ?? value

    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-1', className)}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {Array.from({ length: max }, (_, i) => i + 1).map((rating) => {
          const isFilled = rating <= displayValue

          return (
            <button
              key={rating}
              type="button"
              onClick={() => handleClick(rating)}
              onMouseEnter={() => handleMouseEnter(rating)}
              disabled={readonly}
              className={cn(
                'transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
                !readonly && 'cursor-pointer hover:scale-110',
                readonly && 'cursor-default'
              )}
              aria-label={`Rate ${rating} out of ${max}`}
            >
              <svg
                className={cn(
                  sizeClasses[size],
                  'stroke-[2] transition-colors',
                  isFilled ? colorClasses[color] : 'fill-none stroke-black'
                )}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>
          )
        })}

        {!readonly && (
          <span className="ml-2 text-sm font-bold text-muted-foreground">
            {displayValue} / {max}
          </span>
        )}
      </div>
    )
  }
)

Rating.displayName = 'Rating'

export { Rating }
