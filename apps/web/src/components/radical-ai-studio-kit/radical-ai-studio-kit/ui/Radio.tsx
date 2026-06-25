import * as React from 'react'
import { cn } from '@/lib/utils'

export interface RadioOption {
  label: string
  value: string
  description?: string
  disabled?: boolean
}

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: RadioOption[]
  value?: string
  onChange?: (value: string) => void
  name: string
  orientation?: 'horizontal' | 'vertical'
  color?: 'black' | 'red' | 'purple' | 'blue' | 'yellow'
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      className,
      options,
      value,
      onChange,
      name,
      orientation = 'vertical',
      color = 'black',
      ...props
    },
    ref
  ) => {
    const colorClasses = {
    black: 'checked:bg-primary border-border',
      red: 'checked:bg-red-500 checked:border-red-500 border-border',
      purple: 'checked:bg-purple-500 checked:border-purple-500 border-border',
      blue: 'checked:bg-blue-500 checked:border-blue-500 border-border',
      yellow: 'checked:bg-yellow-500 checked:border-yellow-500 border-border',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex gap-4',
          orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
          className
        )}
        role="radiogroup"
        {...props}
      >
        {options.map((option) => {
          const radioId = `${name}-${option.value}`

          return (
            <label
              key={option.value}
              htmlFor={radioId}
              className={cn(
                'flex items-start gap-3 cursor-pointer',
                option.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className="relative flex items-center">
                <input
                  type="radio"
                  id={radioId}
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange?.(e.target.value)}
                  disabled={option.disabled}
                  className={cn(
                    'peer h-5 w-5 cursor-pointer appearance-none rounded-full border-3 shadow-brutal-sm transition-all',
                    'focus:outline-none focus:ring-4 focus:ring-ring focus:ring-offset-2',
                    'checked:border-6',
                    'disabled:cursor-not-allowed',
                    colorClasses[color]
                  )}
                />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full bg-card opacity-0 peer-checked:opacity-100'
                    )}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-foreground">{option.label}</span>
                {option.description && (
                  <span className="text-sm text-muted-foreground">{option.description}</span>
                )}
              </div>
            </label>
          )
        })}
      </div>
    )
  }
)

RadioGroup.displayName = 'RadioGroup'

export { RadioGroup }
