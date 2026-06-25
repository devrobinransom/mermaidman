import * as React from 'react'
import { cn } from '@/lib/utils'

// Context for managing selection state
interface ListViewContextValue {
  selectedIds: Set<string>
  toggleSelection: (id: string) => void
  toggleSelectAll: () => void
  allSelected: boolean
  someSelected: boolean
}

const ListViewContext = React.createContext<ListViewContextValue | null>(null)

// Main ListView Component
export interface ListViewProps extends React.HTMLAttributes<HTMLDivElement> {
  selectable?: boolean
  selectedIds?: string[]
  onSelectedChange?: (ids: string[]) => void
  allIds?: string[]
}

const ListView = React.forwardRef<HTMLDivElement, ListViewProps>(
  (
    {
      className,
      children,
      selectable = false,
      selectedIds: controlledSelectedIds,
      onSelectedChange,
      allIds = [],
      ...props
    },
    ref
  ) => {
    const [internalSelectedIds, setInternalSelectedIds] = React.useState<Set<string>>(
      new Set()
    )

    const selectedIds = React.useMemo(() => {
      return controlledSelectedIds
        ? new Set(controlledSelectedIds)
        : internalSelectedIds
    }, [controlledSelectedIds, internalSelectedIds])

    const toggleSelection = React.useCallback(
      (id: string) => {
        const newSelected = new Set(selectedIds)
        if (newSelected.has(id)) {
          newSelected.delete(id)
        } else {
          newSelected.add(id)
        }

        if (onSelectedChange) {
          onSelectedChange(Array.from(newSelected))
        } else {
          setInternalSelectedIds(newSelected)
        }
      },
      [selectedIds, onSelectedChange]
    )

    const toggleSelectAll = React.useCallback(() => {
      const newSelected =
        selectedIds.size === allIds.length ? new Set<string>() : new Set(allIds)

      if (onSelectedChange) {
        onSelectedChange(Array.from(newSelected))
      } else {
        setInternalSelectedIds(newSelected)
      }
    }, [selectedIds.size, allIds, onSelectedChange])

    const allSelected = allIds.length > 0 && selectedIds.size === allIds.length
    const someSelected = selectedIds.size > 0 && selectedIds.size < allIds.length

    const contextValue: ListViewContextValue = {
      selectedIds,
      toggleSelection,
      toggleSelectAll,
      allSelected,
      someSelected,
    }

    return (
      <ListViewContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn(
            'border-3 border-border bg-card shadow-none overflow-auto',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </ListViewContext.Provider>
    )
  }
)

ListView.displayName = 'ListView'

// ListHeader Component
export interface ListHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const ListHeader = React.forwardRef<HTMLDivElement, ListHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center bg-muted border-b-3 border-border font-black text-sm',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ListHeader.displayName = 'ListHeader'

// ListHeaderItem Component
export interface ListHeaderItemProps extends React.HTMLAttributes<HTMLDivElement> {
  sortable?: boolean
  sorted?: 'asc' | 'desc' | false
  onSort?: () => void
}

const ListHeaderItem = React.forwardRef<HTMLDivElement, ListHeaderItemProps>(
  ({ className, children, sortable, sorted, onSort, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-2 px-4 py-3 flex-1',
          sortable && 'cursor-pointer hover:bg-muted',
          className
        )}
        onClick={sortable ? onSort : undefined}
        {...props}
      >
        <span className="flex-1">{children}</span>
        {sortable && (
          <svg
            className={cn(
              'h-4 w-4 transition-transform',
              sorted === 'desc' && 'rotate-180',
              !sorted && 'opacity-30'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        )}
      </div>
    )
  }
)

ListHeaderItem.displayName = 'ListHeaderItem'

// ListRows Component
export interface ListRowsProps extends React.HTMLAttributes<HTMLDivElement> {}

const ListRows = React.forwardRef<HTMLDivElement, ListRowsProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('divide-y-2 divide-border/60', className)} {...props}>
        {children}
      </div>
    )
  }
)

ListRows.displayName = 'ListRows'

// ListRow Component
export interface ListRowProps extends React.HTMLAttributes<HTMLDivElement> {
  id?: string
  selectable?: boolean
  selected?: boolean
  onSelectedChange?: (selected: boolean) => void
}

const ListRow = React.forwardRef<HTMLDivElement, ListRowProps>(
  (
    { className, children, id, selectable, selected: controlledSelected, onSelectedChange, ...props },
    ref
  ) => {
    const context = React.useContext(ListViewContext)
    const isSelected = id && context ? context.selectedIds.has(id) : controlledSelected

    const handleToggle = () => {
      if (id && context) {
        context.toggleSelection(id)
      } else if (onSelectedChange) {
        onSelectedChange?.(!controlledSelected)
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center transition-colors',
          isSelected ? 'bg-muted ring-2 ring-primary ring-inset' : 'bg-card hover:bg-muted',
          className
        )}
        {...props}
      >
        {selectable && (
          <div className="px-4">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleToggle}
              className="h-4 w-4 border-2 border-border cursor-pointer"
            />
          </div>
        )}
        {children}
      </div>
    )
  }
)

ListRow.displayName = 'ListRow'

// ListRowItem Component
export interface ListRowItemProps extends React.HTMLAttributes<HTMLDivElement> {}

const ListRowItem = React.forwardRef<HTMLDivElement, ListRowItemProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('px-4 py-3 flex-1 text-sm font-medium', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ListRowItem.displayName = 'ListRowItem'

// ListGroups Component
export interface ListGroupsProps extends React.HTMLAttributes<HTMLDivElement> {}

const ListGroups = React.forwardRef<HTMLDivElement, ListGroupsProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('', className)} {...props}>
        {children}
      </div>
    )
  }
)

ListGroups.displayName = 'ListGroups'

// ListGroupHeader Component
export interface ListGroupHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsible?: boolean
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

const ListGroupHeader = React.forwardRef<HTMLDivElement, ListGroupHeaderProps>(
  ({ className, children, collapsible, collapsed, onCollapsedChange, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-2 px-4 py-2 bg-muted border-y-2 border-border font-bold text-sm',
          collapsible && 'cursor-pointer hover:bg-muted',
          className
        )}
        onClick={collapsible ? () => onCollapsedChange?.(!collapsed) : undefined}
        {...props}
      >
        {collapsible && (
          <svg
            className={cn(
              'h-4 w-4 transition-transform flex-shrink-0',
              collapsed && '-rotate-90'
            )}
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
        )}
        {children}
      </div>
    )
  }
)

ListGroupHeader.displayName = 'ListGroupHeader'

// ListGroupRows Component
export interface ListGroupRowsProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsed?: boolean
}

const ListGroupRows = React.forwardRef<HTMLDivElement, ListGroupRowsProps>(
  ({ className, children, collapsed, ...props }, ref) => {
    if (collapsed) return null

    return (
      <div ref={ref} className={cn('divide-y-2 divide-border/60', className)} {...props}>
        {children}
      </div>
    )
  }
)

ListGroupRows.displayName = 'ListGroupRows'

// ListEmptyState Component
export interface ListEmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title?: string
  description?: string
  action?: React.ReactNode
}

const ListEmptyState = React.forwardRef<HTMLDivElement, ListEmptyStateProps>(
  (
    {
      className,
      icon,
      title = 'No data available',
      description,
      action,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col items-center justify-center p-12', className)}
        {...props}
      >
        {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
        <h3 className="text-lg font-black mb-2">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
        {action && <div className="mt-4">{action}</div>}
        {children}
      </div>
    )
  }
)

ListEmptyState.displayName = 'ListEmptyState'

// ListFooter Component
export interface ListFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const ListFooter = React.forwardRef<HTMLDivElement, ListFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between px-4 py-3 border-t-3 border-border bg-muted',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ListFooter.displayName = 'ListFooter'

// ListSelectBanner Component
export interface ListSelectBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number
  onClear?: () => void
}

const ListSelectBanner = React.forwardRef<HTMLDivElement, ListSelectBannerProps>(
  ({ className, children, count = 0, onClear, ...props }, ref) => {
    const context = React.useContext(ListViewContext)
    const selectedCount = count || (context ? context.selectedIds.size : 0)

    if (selectedCount === 0) return null

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between px-4 py-3 bg-accent text-accent-foreground border-b-3 border-border font-medium',
          className
        )}
        {...props}
      >
        <span className="font-bold">
          {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
        </span>
        <div className="flex items-center gap-2">
          {children}
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="px-3 py-1.5 text-sm font-bold border-2 border-border bg-card hover:bg-muted transition-all"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    )
  }
)

ListSelectBanner.displayName = 'ListSelectBanner'

export {
  ListView,
  ListHeader,
  ListHeaderItem,
  ListRows,
  ListRow,
  ListRowItem,
  ListGroups,
  ListGroupHeader,
  ListGroupRows,
  ListEmptyState,
  ListFooter,
  ListSelectBanner,
}
