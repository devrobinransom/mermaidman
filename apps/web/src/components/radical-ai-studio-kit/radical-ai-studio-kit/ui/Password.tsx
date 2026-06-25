import * as React from 'react'
import { Input, type InputProps } from './Input'
import { cn } from '@/lib/utils'

export interface PasswordProps extends Omit<InputProps, 'type'> {
  showStrength?: boolean
}

const Password = React.forwardRef<HTMLInputElement, PasswordProps>(
  ({ className, showStrength = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [strength, setStrength] = React.useState<'weak' | 'medium' | 'strong'>('weak')

    const calculateStrength = (password: string): 'weak' | 'medium' | 'strong' => {
      let score = 0
      if (!password) return 'weak'

      // Length
      if (password.length >= 8) score++
      if (password.length >= 12) score++

      // Has lowercase and uppercase
      if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++

      // Has numbers
      if (/\d/.test(password)) score++

      // Has special chars
      if (/[^a-zA-Z\d]/.test(password)) score++

      if (score <= 2) return 'weak'
      if (score <= 4) return 'medium'
      return 'strong'
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (showStrength) {
        setStrength(calculateStrength(e.target.value))
      }
      props.onChange?.(e)
    }

    const strengthColors = {
      weak: 'bg-red-500',
      medium: 'bg-yellow-500',
      strong: 'bg-blue-500',
    }

    const strengthWidth = {
      weak: 'w-1/3',
      medium: 'w-2/3',
      strong: 'w-full',
    }

    return (
      <div className="w-full space-y-2">
        <div className="relative">
          <Input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={cn('pr-12', className)}
            onChange={handleChange}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>

        {showStrength && props.value && (
          <div className="space-y-1">
            <div className="h-2 w-full border-2 border-border bg-card overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-300',
                  strengthColors[strength],
                  strengthWidth[strength]
                )}
              />
            </div>
            <p className="text-xs font-bold capitalize">
              Password strength: {strength}
            </p>
          </div>
        )}
      </div>
    )
  }
)

Password.displayName = 'Password'

export { Password }
