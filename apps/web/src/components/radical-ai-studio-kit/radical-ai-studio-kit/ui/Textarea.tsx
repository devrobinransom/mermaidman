import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const textareaVariants = cva(
  'flex min-h-[80px] w-full border-3 border-border bg-card px-4 py-3 font-medium shadow-brutal transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-4 disabled:cursor-not-allowed disabled:opacity-50 resize-y',
  {
    variants: {
      variant: {
        default: 'shadow-brutal focus:shadow-brutal-md',
        error: 'border-red-500 shadow-brutal-red focus:shadow-brutal-red',
        success: 'border-blue-500 shadow-brutal-blue focus:shadow-brutal-blue',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  label?: string
  error?: string
  hint?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, label, error, hint, ...props }, ref) => {
    const textareaId = React.useId()

    return (
      <div className="w-full space-y-2">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-bold text-foreground"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(textareaVariants({ variant: error ? 'error' : variant, className }))}
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

Textarea.displayName = 'Textarea'

export { Textarea, textareaVariants }
