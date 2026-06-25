import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const dividerVariants = cva('border-border', {
  variants: {
    orientation: {
      horizontal: 'w-full border-t-3',
      vertical: 'h-full border-l-3',
    },
    variant: {
      solid: '',
      dashed: 'border-dashed',
      dotted: 'border-dotted',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
    variant: 'solid',
  },
})

export interface DividerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dividerVariants> {
  label?: React.ReactNode
}

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ className, orientation, variant, label, ...props }, ref) => {
    if (label && orientation === 'horizontal') {
      return (
        <div
          ref={ref}
          className={cn('flex items-center gap-4 w-full', className)}
          role="separator"
          {...props}
        >
          <div className={cn(dividerVariants({ orientation, variant }), 'flex-1')} />
          <span className="text-sm font-bold text-muted-foreground">{label}</span>
          <div className={cn(dividerVariants({ orientation, variant }), 'flex-1')} />
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(dividerVariants({ orientation, variant, className }))}
        role="separator"
        {...props}
      />
    )
  }
)

Divider.displayName = 'Divider'

export { Divider, dividerVariants }
