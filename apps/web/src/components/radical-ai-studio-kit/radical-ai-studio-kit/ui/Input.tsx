import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const inputVariants = cva(
  'flex w-full rounded-md border-3 border-border bg-card px-4 py-2 text-foreground font-medium shadow-none transition-all file:border-0 file:bg-transparent file:text-sm file:font-bold placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-9 text-sm px-3',
        md: 'h-11 text-base px-4',
        lg: 'h-13 text-lg px-5',
      },
      variant: {
        default: 'focus:shadow-brutal-md',
        error: 'border-red-500 focus:shadow-brutal-red',
        success: 'border-blue-500 focus:shadow-brutal-blue',
        warning: 'border-yellow-500 focus:shadow-brutal-yellow',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string
  error?: string
  hint?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, variant, label, error, hint, type, ...props }, ref) => {
    const inputId = React.useId()

    return (
      <div className="w-full space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-bold text-foreground"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(inputVariants({ size, variant: error ? 'error' : variant, className }))}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm font-semibold text-red-500 flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-sm text-muted-foreground">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input, inputVariants }
