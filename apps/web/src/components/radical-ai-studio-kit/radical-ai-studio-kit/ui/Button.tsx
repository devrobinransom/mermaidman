import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold border-3 border-border transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 active:translate-x-1 active:translate-y-1 active:shadow-brutal-sm',
  {
    variants: {
      variant: {
        solid: 'shadow-none hover:shadow-brutal-md',
        outline: 'bg-card shadow-none hover:shadow-brutal-md',
        ghost: 'border-0 shadow-none hover:bg-muted',
        gradient: 'shadow-none hover:shadow-brutal-md border-border',
      },
      color: {
        black: '',
        red: '',
        purple: '',
        blue: '',
        yellow: '',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-base',
        lg: 'h-13 px-8 text-lg',
        xl: 'h-15 px-10 text-xl',
        icon: 'h-11 w-11',
      },
    },
    compoundVariants: [
      // Solid variants
      {
        variant: 'solid',
        color: 'black',
        class: 'bg-primary text-primary-foreground hover:opacity-90',
      },
      {
        variant: 'solid',
        color: 'red',
        class: 'bg-red-500 text-white hover:bg-red-600',
      },
      {
        variant: 'solid',
        color: 'purple',
        class: 'bg-purple-500 text-white hover:bg-purple-600',
      },
      {
        variant: 'solid',
        color: 'blue',
        class: 'bg-blue-500 text-white hover:bg-blue-600',
      },
      {
        variant: 'solid',
        color: 'yellow',
        class: 'bg-yellow-500 text-black hover:bg-yellow-600',
      },
      // Outline variants
      {
        variant: 'outline',
        color: 'black',
        class: 'text-foreground border-border hover:bg-muted',
      },
      {
        variant: 'outline',
        color: 'red',
        class: 'text-red-500 border-red-500 hover:bg-red-50',
      },
      {
        variant: 'outline',
        color: 'purple',
        class: 'text-purple-500 border-purple-500 hover:bg-purple-50',
      },
      {
        variant: 'outline',
        color: 'blue',
        class: 'text-blue-500 border-blue-500 hover:bg-blue-50',
      },
      {
        variant: 'outline',
        color: 'yellow',
        class: 'text-black border-yellow-500 hover:bg-yellow-50',
      },
      // Gradient variants
      {
        variant: 'gradient',
        color: 'red',
        class: 'brutal-gradient-red text-white',
      },
      {
        variant: 'gradient',
        color: 'purple',
        class: 'brutal-gradient-purple text-white',
      },
      {
        variant: 'gradient',
        color: 'blue',
        class: 'brutal-gradient-blue text-white',
      },
      {
        variant: 'gradient',
        color: 'yellow',
        class: 'brutal-gradient-yellow text-black',
      },
      // Ghost variants
      {
        variant: 'ghost',
        color: 'black',
        class: 'text-foreground hover:bg-muted',
      },
      {
        variant: 'ghost',
        color: 'red',
        class: 'text-red-500 hover:bg-red-50',
      },
      {
        variant: 'ghost',
        color: 'purple',
        class: 'text-purple-500 hover:bg-purple-50',
      },
      {
        variant: 'ghost',
        color: 'blue',
        class: 'text-blue-500 hover:bg-blue-50',
      },
      {
        variant: 'ghost',
        color: 'yellow',
        class: 'text-yellow-600 hover:bg-yellow-50',
      },
    ],
    defaultVariants: {
      variant: 'solid',
      color: 'black',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, color, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    const content = asChild ? (
      children
    ) : (
      <>
        {loading && (
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </>
    )

    return (
      <Comp
        className={cn(buttonVariants({ variant, color, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {content}
      </Comp>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }

