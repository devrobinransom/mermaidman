import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TreeNode {
  id: string
  label: string
  icon?: React.ReactNode
  children?: TreeNode[]
  disabled?: boolean
  isLeaf?: boolean
  data?: any
}

export interface TreeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  data: TreeNode[]
  value?: string | string[]
  onChange?: (value: string | string[]) => void
  selectable?: 'single' | 'multiple' | 'none'
  defaultExpanded?: string[]
  onExpand?: (expandedIds: string[]) => void
  onLoadChildren?: (node: TreeNode) => Promise<TreeNode[]>
  showLines?: boolean
  showCheckbox?: boolean
}

const Tree = React.forwardRef<HTMLDivElement, TreeProps>(
  (
    {
      className,
      data,
      value,
      onChange,
      selectable = 'single',
      defaultExpanded = [],
      onExpand,
      onLoadChildren,
      showLines = false,
      showCheckbox = false,
      ...props
    },
    ref
  ) => {
    const [expandedIds, setExpandedIds] = React.useState<Set<string>>(
      new Set(defaultExpanded)
    )
    const [loadingIds, setLoadingIds] = React.useState<Set<string>>(new Set())
    const [loadedChildren, setLoadedChildren] = React.useState<
      Record<string, TreeNode[]>
    >({})

    const selectedIds = React.useMemo(() => {
      if (!value) return new Set<string>()
      return new Set(Array.isArray(value) ? value : [value])
    }, [value])

    const toggleExpanded = async (node: TreeNode) => {
      const newExpanded = new Set(expandedIds)
      const isExpanding = !expandedIds.has(node.id)

      if (isExpanding) {
        newExpanded.add(node.id)

        // Load children if needed
        if (onLoadChildren && !loadedChildren[node.id] && !node.children) {
          setLoadingIds((prev) => new Set(prev).add(node.id))
          try {
            const children = await onLoadChildren(node)
            setLoadedChildren((prev) => ({ ...prev, [node.id]: children }))
          } catch (error) {
            console.error('Failed to load children:', error)
          } finally {
            setLoadingIds((prev) => {
              const next = new Set(prev)
              next.delete(node.id)
              return next
            })
          }
        }
      } else {
        newExpanded.delete(node.id)
      }

      setExpandedIds(newExpanded)
      onExpand?.(Array.from(newExpanded))
    }

    const handleSelect = (node: TreeNode) => {
      if (node.disabled || selectable === 'none') return

      if (selectable === 'single') {
        onChange?.(node.id)
      } else {
        const newSelected = new Set(selectedIds)
        if (newSelected.has(node.id)) {
          newSelected.delete(node.id)
        } else {
          newSelected.add(node.id)
        }
        onChange?.(Array.from(newSelected))
      }
    }

    const renderNode = (node: TreeNode, depth = 0) => {
      const isExpanded = expandedIds.has(node.id)
      const isSelected = selectedIds.has(node.id)
      const isLoading = loadingIds.has(node.id)
      const children = loadedChildren[node.id] || node.children || []
      const hasChildren = children.length > 0 || (!node.isLeaf && onLoadChildren)

      return (
        <div key={node.id} className="select-none">
          <div
            className={cn(
              'flex items-center gap-2 px-2 py-1.5 hover:bg-muted cursor-pointer transition-colors border-l-3',
              isSelected
                ? 'bg-primary text-primary-foreground border-border'
                : 'bg-card text-foreground border-transparent hover:border-border',
              node.disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
            )}
            style={{ paddingLeft: `${0.5 + depth * 1.5}rem` }}
          >
            {hasChildren && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleExpanded(node)
                }}
                className="flex-shrink-0 p-0.5 hover:bg-muted rounded"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-border border-t-transparent animate-spin" />
                ) : (
                  <svg
                    className={cn(
                      'h-4 w-4 transition-transform',
                      isExpanded && 'rotate-90'
                    )}
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
            )}

            {!hasChildren && <span className="w-5" />}

            {showCheckbox && selectable === 'multiple' && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleSelect(node)}
                className="h-4 w-4 border-2 border-border cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              />
            )}

            <div
              className="flex items-center gap-2 flex-1 min-w-0"
              onClick={() => handleSelect(node)}
            >
              {node.icon && (
                <span className="flex-shrink-0 h-5 w-5">{node.icon}</span>
              )}
              <span className="font-medium truncate">{node.label}</span>
            </div>
          </div>

          {isExpanded && hasChildren && (
            <div className={cn(showLines && 'border-l-2 border-border ml-4')}>
              {children.map((child) =>
                renderNode(child, depth + 1)
              )}
            </div>
          )}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          'border-3 border-border bg-card shadow-brutal overflow-auto',
          className
        )}
        {...props}
      >
        {data.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p className="font-medium">No data available</p>
          </div>
        ) : (
          <div className="py-1">
            {data.map((node) =>
              renderNode(node, 0)
            )}
          </div>
        )}
      </div>
    )
  }
)

Tree.displayName = 'Tree'

export { Tree }
