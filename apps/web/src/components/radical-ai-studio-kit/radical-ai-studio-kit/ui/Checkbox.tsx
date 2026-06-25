import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { cn } from '@/lib/utils'

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: string
  description?: string
  color?: 'black' | 'red' | 'purple' | 'blue' | 'yellow'
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, label, description, color = 'black', ...props }, ref) => {
  const checkboxId = React.useId()

  const colorClasses = {
    black: 'data-[state=checked]:bg-primary data-[state=checked]:border-primary',
    red: 'data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500',
    purple: 'data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500',
    blue: 'data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500',
    yellow: 'data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500',
  }

  const checkbox = (
    <CheckboxPrimitive.Root
      ref={ref}
      id={checkboxId}
      className={cn(
        'peer h-5 w-5 shrink-0 border-3 border-border bg-card shadow-none transition-all',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:text-white data-[state=checked]:shadow-brutal-sm',
        colorClasses[color],
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className={cn('flex items-center justify-center text-current')}>
        <svg
          className="h-4 w-4 stroke-current stroke-[3]"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )

  if (label || description) {
    return (
      <div className="flex items-start gap-3">
        {checkbox}
        <div className="grid gap-1 leading-none">
          {label && (
            <label
              htmlFor={checkboxId}
              className="text-sm font-bold text-foreground cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    )
  }

  return checkbox
})

Checkbox.displayName = 'Checkbox'

export { Checkbox }
