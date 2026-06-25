import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextEditorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  showToolbar?: boolean
  minHeight?: string
  maxHeight?: string
}

const TextEditor = React.forwardRef<HTMLDivElement, TextEditorProps>(
  (
    {
      className,
      value = '',
      onChange,
      placeholder = 'Start typing...',
      disabled = false,
      showToolbar = true,
      minHeight = '200px',
      maxHeight = '400px',
      ...props
    },
    ref
  ) => {
    const editorRef = React.useRef<HTMLDivElement>(null)
    const [isFocused, setIsFocused] = React.useState(false)
    const [activeFormats, setActiveFormats] = React.useState<Set<string>>(new Set())

    // Initialize content
    React.useEffect(() => {
      if (editorRef.current && editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value
      }
    }, [value])

    const handleInput = () => {
      if (editorRef.current) {
        const html = editorRef.current.innerHTML
        onChange?.(html)
      }
    }

    const handleFocus = () => {
      setIsFocused(true)
      updateActiveFormats()
    }

    const handleBlur = () => {
      setIsFocused(false)
    }

    const updateActiveFormats = () => {
      const formats = new Set<string>()

      if (document.queryCommandState('bold')) formats.add('bold')
      if (document.queryCommandState('italic')) formats.add('italic')
      if (document.queryCommandState('underline')) formats.add('underline')
      if (document.queryCommandState('insertOrderedList')) formats.add('ol')
      if (document.queryCommandState('insertUnorderedList')) formats.add('ul')

      setActiveFormats(formats)
    }

    const execCommand = (command: string, value?: string) => {
      if (disabled) return

      document.execCommand(command, false, value)
      editorRef.current?.focus()
      updateActiveFormats()
      handleInput()
    }

    const toolbarButtons = [
      {
        command: 'bold',
        icon: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"
            />
          </svg>
        ),
        label: 'Bold',
      },
      {
        command: 'italic',
        icon: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 4h4m-4 16h4M14 4L10 20"
            />
          </svg>
        ),
        label: 'Italic',
      },
      {
        command: 'underline',
        icon: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 4v8a6 6 0 0012 0V4M6 20h12"
            />
          </svg>
        ),
        label: 'Underline',
      },
      {
        command: 'insertUnorderedList',
        icon: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        ),
        label: 'Bullet List',
      },
      {
        command: 'insertOrderedList',
        icon: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6h9m-9 6h9m-9 6h9M3 6h.01M3 12h.01M3 18h.01"
            />
          </svg>
        ),
        label: 'Numbered List',
      },
      {
        command: 'formatBlock',
        value: 'h1',
        icon: <span className="text-sm font-black">H1</span>,
        label: 'Heading 1',
      },
      {
        command: 'formatBlock',
        value: 'h2',
        icon: <span className="text-sm font-black">H2</span>,
        label: 'Heading 2',
      },
      {
        command: 'formatBlock',
        value: 'p',
        icon: <span className="text-sm font-black">P</span>,
        label: 'Paragraph',
      },
    ]

    return (
      <div
        ref={ref}
        className={cn('border-3 border-border bg-card shadow-brutal', className)}
        {...props}
      >
        {showToolbar && (
          <div className="flex items-center gap-1 p-2 border-b-3 border-border bg-muted flex-wrap">
            {toolbarButtons.map((button, index) => {
              const isActive =
                activeFormats.has(button.command) ||
                activeFormats.has(button.command.replace('insert', '').toLowerCase())

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => execCommand(button.command, button.value)}
                  disabled={disabled}
                  title={button.label}
                  className={cn(
                    'p-2 border-2 border-border transition-all',
                    'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    isActive
                      ? 'bg-primary text-primary-foreground translate-x-0.5 translate-y-0.5'
                      : 'bg-card text-foreground hover:translate-x-0.5 hover:translate-y-0.5'
                  )}
                >
                  {button.icon}
                </button>
              )
            })}

            <div className="flex-1" />

            <button
              type="button"
              onClick={() => {
                if (editorRef.current) {
                  editorRef.current.innerHTML = ''
                  onChange?.('')
                }
              }}
              disabled={disabled}
              title="Clear"
              className={cn(
                'px-3 py-2 border-2 border-border bg-card text-foreground transition-all font-medium text-sm',
                'hover:bg-muted hover:translate-x-0.5 hover:translate-y-0.5',
                'focus:outline-none focus:ring-2 focus:ring-ring',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              Clear
            </button>
          </div>
        )}

        <div className="relative">
          <div
            ref={editorRef}
            contentEditable={!disabled}
            onInput={handleInput}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseUp={updateActiveFormats}
            onKeyUp={updateActiveFormats}
            className={cn(
              'p-4 outline-none overflow-auto',
              'prose prose-sm max-w-none',
              'focus:ring-4 focus:ring-ring focus:ring-inset',
              disabled && 'cursor-not-allowed opacity-50 bg-muted',
              !value && !isFocused && 'empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground'
            )}
            style={{
              minHeight,
              maxHeight,
            }}
            data-placeholder={placeholder}
          />
        </div>
      </div>
    )
  }
)

TextEditor.displayName = 'TextEditor'

export { TextEditor }
