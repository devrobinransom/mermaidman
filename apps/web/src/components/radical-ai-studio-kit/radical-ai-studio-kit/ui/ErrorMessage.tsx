import * as React from 'react'
import { Alert, AlertDescription, AlertTitle } from './Alert'
import { cn } from '@/lib/utils'

export interface ErrorMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  message?: string
  action?: React.ReactNode
}

const ErrorMessage = React.forwardRef<HTMLDivElement, ErrorMessageProps>(
  ({ className, title = 'Something went wrong', message, action, ...props }, ref) => {
    return (
      <Alert ref={ref} variant="error" className={cn(className)} {...props}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <AlertTitle>{title}</AlertTitle>
            {message && <AlertDescription>{message}</AlertDescription>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      </Alert>
    )
  }
)

ErrorMessage.displayName = 'ErrorMessage'

export { ErrorMessage }
