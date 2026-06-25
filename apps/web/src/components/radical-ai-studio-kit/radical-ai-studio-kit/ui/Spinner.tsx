import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const spinnerVariants = cva('animate-spin border-border border-t-transparent', {
  variants: {
    size: {
      xs: 'h-3 w-3 border-2',
      sm: 'h-4 w-4 border-2',
      md: 'h-6 w-6 border-3',
      lg: 'h-8 w-8 border-3',
      xl: 'h-12 w-12 border-4',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export interface SpinnerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof spinnerVariants> {
  label?: string
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, label, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('inline-flex items-center justify-center', className)}
        {...props}
      >
        <div
          className={cn(spinnerVariants({ size }))}
          role="status"
          aria-label={label || 'Loading'}
        >
          <span className="sr-only">{label || 'Loading...'}</span>
        </div>
      </div>
    )
  }
)

Spinner.displayName = 'Spinner'

const LoadingIndicator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    text?: string
  }
>(({ className, text = 'Loading...', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex items-center justify-center gap-2', className)}
      {...props}
    >
      <Spinner size="sm" />
      {text && <span className="text-sm font-medium text-muted-foreground">{text}</span>}
    </div>
  )
})

LoadingIndicator.displayName = 'LoadingIndicator'

export { Spinner, LoadingIndicator, spinnerVariants }
