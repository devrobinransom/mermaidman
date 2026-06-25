import * as React from 'react'
import * as SwitchPrimitives from '@radix-ui/react-switch'
import { cn } from '@/lib/utils'

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  label?: string
  description?: string
  color?: 'black' | 'red' | 'purple' | 'blue' | 'yellow'
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, label, description, color = 'black', ...props }, ref) => {
  const switchId = React.useId()

  const colorClasses = {
    black: 'data-[state=checked]:bg-primary',
    red: 'data-[state=checked]:bg-red-500',
    purple: 'data-[state=checked]:bg-purple-500',
    blue: 'data-[state=checked]:bg-blue-500',
    yellow: 'data-[state=checked]:bg-yellow-500',
  }

  const switchComponent = (
    <SwitchPrimitives.Root
      id={switchId}
      className={cn(
        'peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center border-3 border-border bg-muted shadow-brutal-sm transition-all',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        colorClasses[color],
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          'pointer-events-none block h-5 w-5 border-2 border-border bg-card shadow-brutal-sm transition-transform',
          'data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5'
        )}
      />
    </SwitchPrimitives.Root>
  )

  if (label || description) {
    return (
      <div className="flex items-start gap-3">
        {switchComponent}
        <div className="grid gap-1 leading-none">
          {label && (
            <label
              htmlFor={switchId}
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

  return switchComponent
})

Switch.displayName = 'Switch'

export { Switch }
