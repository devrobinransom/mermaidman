import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { cn } from '@/lib/utils'

type SelectTriggerA11yProps = {
  id?: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
  disabled?: boolean
}

const SelectContext = React.createContext<SelectTriggerA11yProps | null>(null)

type SelectProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> &
  SelectTriggerA11yProps

const Select = ({ children, id, disabled, 'aria-invalid': ariaInvalid, 'aria-describedby': ariaDescribedBy, ...props }: SelectProps) => {
  return (
    <SelectContext.Provider
      value={{
        id,
        disabled,
        'aria-invalid': ariaInvalid,
        'aria-describedby': ariaDescribedBy,
      }}
    >
      <SelectPrimitive.Root disabled={disabled} {...props}>
        {children}
      </SelectPrimitive.Root>
    </SelectContext.Provider>
  )
}

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  const ariaInvalid = props['aria-invalid'] ?? context?.['aria-invalid']
  const ariaDescribedBy = props['aria-describedby'] ?? context?.['aria-describedby']
  const resolvedId = props.id ?? context?.id
  const resolvedDisabled = props.disabled ?? context?.disabled

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex h-11 w-full items-center justify-between border-3 border-border bg-card px-4 py-2 text-base font-medium shadow-none transition-all focus:shadow-brutal-md',
        'placeholder:text-muted-foreground',
        'focus:outline-none focus:ring-4 focus:ring-ring focus:ring-offset-4',
        'disabled:cursor-not-allowed disabled:opacity-50',
        '[&>span]:line-clamp-1',
        className
      )}
      id={resolvedId}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedBy}
      disabled={resolvedDisabled}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <svg
          className="h-5 w-5 opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
})
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-50 max-h-96 min-w-[8rem] overflow-hidden border-3 border-border bg-popover text-popover-foreground shadow-brutal-lg',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          'p-1',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('px-3 py-2 text-sm font-black', className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-pointer select-none items-center py-2 pl-3 pr-8 text-base font-medium outline-none',
      'focus:bg-muted',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-5 w-5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <svg className="h-5 w-5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('my-1 h-px bg-border', className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
