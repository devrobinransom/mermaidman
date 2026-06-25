import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
  onClick?: () => void
}

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
}

const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(
  ({ className, items, separator, ...props }, ref) => {
    const defaultSeparator = (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    )

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn('flex items-center space-x-2', className)}
        {...props}
      >
        <ol className="flex items-center space-x-2">
          {items.map((item, index) => {
            const isLast = index === items.length - 1

            return (
              <li key={index} className="flex items-center space-x-2">
                {item.href ? (
                  <a
                    href={item.href}
                    onClick={item.onClick}
                    className={cn(
                      'text-base font-bold transition-colors hover:text-muted-foreground',
                      isLast ? 'text-foreground pointer-events-none' : 'text-muted-foreground'
                    )}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </a>
                ) : (
                  <button
                    onClick={item.onClick}
                    className={cn(
                      'text-base font-bold transition-colors hover:text-muted-foreground',
                      isLast ? 'text-foreground pointer-events-none' : 'text-muted-foreground'
                    )}
                    aria-current={isLast ? 'page' : undefined}
                    disabled={isLast}
                  >
                    {item.label}
                  </button>
                )}
                {!isLast && (
                  <span className="text-muted-foreground" aria-hidden="true">
                    {separator || defaultSeparator}
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    )
  }
)

Breadcrumbs.displayName = 'Breadcrumbs'

export { Breadcrumbs }
