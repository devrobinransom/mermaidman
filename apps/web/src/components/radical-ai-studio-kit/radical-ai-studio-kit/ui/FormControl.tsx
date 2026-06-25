import * as React from 'react'
import { cn } from '@/lib/utils'

export interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  label?: string
  error?: string
  hint?: string
  required?: boolean
  disabled?: boolean
}

const FormControl = React.forwardRef<HTMLDivElement, FormControlProps>(
  ({ className, label, error, hint, required, disabled, children, ...props }, ref) => {
    const controlId = React.useId()

    return (
      <div ref={ref} className={cn('w-full space-y-2', className)} {...props}>
        {label && (
          <label
            htmlFor={controlId}
            className={cn(
              'block text-sm font-bold text-foreground',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                id: controlId,
                disabled: disabled || (child.props as any).disabled,
                'aria-invalid': error ? true : undefined,
                'aria-describedby': error
                  ? `${controlId}-error`
                  : hint
                    ? `${controlId}-hint`
                    : undefined,
              } as any)
            }
            return child
          })}
        </div>

        {error && (
          <p
            id={`${controlId}-error`}
            className="text-sm font-semibold text-red-500 flex items-center gap-1"
          >
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
          <p id={`${controlId}-hint`} className="text-sm text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

FormControl.displayName = 'FormControl'

export { FormControl }
