import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './Select'
import { MultiSelect, type MultiSelectOption } from './MultiSelect'

export interface ListFilterOption {
  label: string
  value: string
}

export interface ListFilterField {
  id: string
  label: string
  options: ListFilterOption[]
  value?: string | string[]
  onChange?: (value: string | string[]) => void
  placeholder?: string
  multi?: boolean
}

export interface ListFilterProps extends React.HTMLAttributes<HTMLDivElement> {
  fields: ListFilterField[]
}

const ListFilter = React.forwardRef<HTMLDivElement, ListFilterProps>(
  ({ className, fields, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-wrap items-end gap-4', className)}
        {...props}
      >
        {fields.map((field) => (
          <div key={field.id} className="min-w-[180px] space-y-1">
            <label className="text-sm font-bold text-foreground">{field.label}</label>
            {field.multi ? (
              <MultiSelect
                options={field.options as MultiSelectOption[]}
                value={Array.isArray(field.value) ? field.value : []}
                onChange={(value) => field.onChange?.(value)}
                placeholder={field.placeholder}
              />
            ) : (
              <Select
                value={typeof field.value === 'string' ? field.value : undefined}
                onValueChange={(value) => field.onChange?.(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={field.placeholder || 'Select'} />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ))}
      </div>
    )
  }
)

ListFilter.displayName = 'ListFilter'

export { ListFilter }
