import * as React from 'react'
import { cn } from '@/lib/utils'

export interface FileUploaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'onError'> {
  accept?: string
  multiple?: boolean
  maxSize?: number // in bytes
  disabled?: boolean
  onChange?: (files: File[]) => void
  onError?: (error: string) => void
  value?: File[]
}

const FileUploader = React.forwardRef<HTMLDivElement, FileUploaderProps>(
  (
    {
      className,
      accept,
      multiple = false,
      maxSize = 10 * 1024 * 1024, // 10MB default
      disabled = false,
      onChange,
      onError,
      value = [],
      ...props
    },
    ref
  ) => {
    const [isDragging, setIsDragging] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)

    const validateFiles = (files: FileList | null): File[] => {
      if (!files) return []

      const validFiles: File[] = []
      Array.from(files).forEach((file) => {
        if (maxSize && file.size > maxSize) {
          onError?.(
            `File "${file.name}" is too large. Maximum size is ${(maxSize / (1024 * 1024)).toFixed(1)}MB`
          )
          return
        }
        validFiles.push(file)
      })

      return validFiles
    }

    const handleFiles = (files: FileList | null) => {
      const validFiles = validateFiles(files)
      if (validFiles.length > 0) {
        onChange?.(multiple ? [...value, ...validFiles] : validFiles)
      }
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      if (disabled) return

      handleFiles(e.dataTransfer.files)
    }

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled) {
        setIsDragging(true)
      }
    }

    const handleDragLeave = () => {
      setIsDragging(false)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files)
    }

    const handleRemove = (index: number) => {
      const newFiles = value.filter((_, i) => i !== index)
      onChange?.(newFiles)
    }

    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        <div
          className={cn(
            'relative border-3 border-dashed border-border bg-card p-8 text-center transition-all cursor-pointer shadow-brutal',
            isDragging && 'border-blue-500 bg-blue-50 shadow-brutal-blue',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            onChange={handleInputChange}
            className="hidden"
          />

          <div className="space-y-2">
            <svg
              className={cn(
                'mx-auto h-12 w-12',
                isDragging ? 'text-blue-500' : 'text-muted-foreground'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>

            <div className="space-y-1">
              <p className="text-base font-bold">
                {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-sm text-muted-foreground">
                {accept || 'Any file type'} • Max {(maxSize / (1024 * 1024)).toFixed(0)}MB
                {multiple && ' • Multiple files allowed'}
              </p>
            </div>
          </div>
        </div>

        {value.length > 0 && (
          <div className="mt-4 space-y-2">
            {value.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border-3 border-border bg-card shadow-brutal-sm"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <svg
                    className="h-5 w-5 text-muted-foreground flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove(index)
                  }}
                  className="ml-2 p-1 hover:bg-muted transition-colors"
                  disabled={disabled}
                >
                  <svg
                    className="h-4 w-4 stroke-[3]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
)

FileUploader.displayName = 'FileUploader'

export { FileUploader }
