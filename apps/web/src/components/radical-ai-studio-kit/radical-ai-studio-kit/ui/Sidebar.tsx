import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SidebarItem {
  label: string
  value: string
  icon?: React.ReactNode
  children?: SidebarItem[]
  disabled?: boolean
}

export interface SidebarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: SidebarItem[]
  value?: string
  onChange?: (value: string) => void
  collapsible?: boolean
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  width?: string
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      className,
      items,
      value,
      onChange,
      collapsible = true,
      collapsed = false,
      onCollapsedChange,
      width = '16rem',
      ...props
    },
    ref
  ) => {
    const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set())

    const toggleExpanded = (itemValue: string) => {
      setExpandedItems((prev) => {
        const next = new Set(prev)
        if (next.has(itemValue)) {
          next.delete(itemValue)
        } else {
          next.add(itemValue)
        }
        return next
      })
    }

    const renderItem = (item: SidebarItem, depth = 0) => {
      const isActive = value === item.value
      const isExpanded = expandedItems.has(item.value)
      const hasChildren = item.children && item.children.length > 0

      return (
        <div key={item.value}>
          <button
            type="button"
            onClick={() => {
              if (hasChildren) {
                toggleExpanded(item.value)
              } else {
                onChange?.(item.value)
              }
            }}
            disabled={item.disabled}
            className={cn(
              'w-full flex items-center gap-2 rounded-md border-2 border-transparent px-3 py-2 text-left font-bold transition-all',
              'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isActive
                ? 'bg-primary text-primary-foreground border-border shadow-brutal-sm'
                : 'bg-card text-foreground hover:border-border',
              collapsed && 'justify-center px-2'
            )}
            style={{ paddingLeft: collapsed ? undefined : `${0.75 + depth * 1}rem` }}
          >
            {item.icon && <span className="flex-shrink-0 h-5 w-5">{item.icon}</span>}
            {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
            {!collapsed && hasChildren && (
              <svg
                className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-90')}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </button>

          {!collapsed && hasChildren && isExpanded && (
            <div className="border-l-2 border-border ml-4">
              {item.children!.map((child) => renderItem(child, depth + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col h-full rounded-lg border-3 border-border bg-card shadow-brutal transition-all overflow-hidden',
          className
        )}
        style={{ width: collapsed ? '4rem' : width }}
        {...props}
      >
        {collapsible && (
          <div className="flex items-center justify-between p-3 border-b-3 border-border">
            {!collapsed && <h2 className="text-lg font-black">Menu</h2>}
            <button
              type="button"
              onClick={() => onCollapsedChange?.(!collapsed)}
              className="rounded-md p-1.5 border-2 border-border bg-card hover:bg-muted transition-colors"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg
                className={cn('h-5 w-5 transition-transform', collapsed && 'rotate-180')}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
            </button>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto">
          {items.map((item) => renderItem(item))}
        </nav>
      </div>
    )
  }
)

Sidebar.displayName = 'Sidebar'

export { Sidebar }
