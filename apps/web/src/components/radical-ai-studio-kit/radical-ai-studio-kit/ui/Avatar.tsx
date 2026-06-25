import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const avatarVariants = cva(
  'inline-flex items-center justify-center font-bold border-3 border-border shadow-brutal-sm bg-card overflow-hidden',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-sm',
        md: 'h-10 w-10 text-base',
        lg: 'h-12 w-12 text-lg',
        xl: 'h-16 w-16 text-xl',
        '2xl': 'h-20 w-20 text-2xl',
      },
      shape: {
        square: '',
        circle: 'rounded-full',
      },
    },
    defaultVariants: {
      size: 'md',
      shape: 'square',
    },
  }
)

export interface AvatarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof avatarVariants> {
  src?: string
  alt?: string
  fallback?: string
  label?: string
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, shape, src, alt, fallback, label, ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false)

    // Generate initials from label or fallback
    const getInitials = (text?: string) => {
      if (!text) return '?'
      return text
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }

    const displayText = getInitials(label || fallback || alt)

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size, shape, className }))}
        {...props}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt || label || 'Avatar'}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span>{displayText}</span>
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'

const AvatarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    max?: number
  }
>(({ className, max = 5, children, ...props }, ref) => {
  const childrenArray = React.Children.toArray(children)
  const visibleChildren = max ? childrenArray.slice(0, max) : childrenArray
  const extraCount = childrenArray.length - visibleChildren.length

  return (
    <div
      ref={ref}
      className={cn('flex -space-x-2', className)}
      {...props}
    >
      {visibleChildren}
      {extraCount > 0 && (
        <div className="inline-flex items-center justify-center h-10 w-10 border-3 border-border bg-muted text-sm font-bold text-foreground shadow-brutal-sm">
          +{extraCount}
        </div>
      )}
    </div>
  )
})

AvatarGroup.displayName = 'AvatarGroup'

export { Avatar, AvatarGroup, avatarVariants }
