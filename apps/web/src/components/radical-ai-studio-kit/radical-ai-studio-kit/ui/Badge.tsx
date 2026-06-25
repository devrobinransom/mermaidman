import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 border-2 border-border font-bold shadow-none transition-all',
  {
    variants: {
      variant: {
        solid: '',
        outline: 'bg-card',
      },
      color: {
        black: '',
        red: '',
        purple: '',
        blue: '',
        yellow: '',
        gray: '',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
      },
    },
    compoundVariants: [
      // Solid variants
      {
        variant: 'solid',
        color: 'black',
        class: 'bg-primary text-primary-foreground',
      },
      {
        variant: 'solid',
        color: 'red',
        class: 'bg-red-500 text-white border-red-500',
      },
      {
        variant: 'solid',
        color: 'purple',
        class: 'bg-purple-500 text-white border-purple-500',
      },
      {
        variant: 'solid',
        color: 'blue',
        class: 'bg-blue-500 text-white border-blue-500',
      },
      {
        variant: 'solid',
        color: 'yellow',
        class: 'bg-yellow-500 text-black border-yellow-500',
      },
      {
        variant: 'solid',
        color: 'gray',
        class: 'bg-muted text-foreground border-border',
      },
      // Outline variants
      {
        variant: 'outline',
        color: 'black',
        class: 'text-foreground border-border',
      },
      {
        variant: 'outline',
        color: 'red',
        class: 'text-red-500 border-red-500',
      },
      {
        variant: 'outline',
        color: 'purple',
        class: 'text-purple-500 border-purple-500',
      },
      {
        variant: 'outline',
        color: 'blue',
        class: 'text-blue-500 border-blue-500',
      },
      {
        variant: 'outline',
        color: 'yellow',
        class: 'text-yellow-600 border-yellow-500',
      },
      {
        variant: 'outline',
        color: 'gray',
        class: 'text-muted-foreground border-border',
      },
    ],
    defaultVariants: {
      variant: 'solid',
      color: 'black',
      size: 'md',
    },
  }
)

export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, color, size, dot, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, color, size, className }))}
        {...props}
      >
        {dot && (
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
        )}
        {children}
      </div>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge, badgeVariants }
