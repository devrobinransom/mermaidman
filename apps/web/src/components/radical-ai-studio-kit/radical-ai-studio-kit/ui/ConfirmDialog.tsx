import * as React from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './Dialog'
import { Button } from './Button'

export interface ConfirmDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
  destructive?: boolean
  loading?: boolean
  trigger?: React.ReactNode
}

const ConfirmDialog = ({
  open,
  onOpenChange,
  title = 'Are you sure?',
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  destructive = false,
  loading = false,
  trigger,
}: ConfirmDialogProps) => {
  const handleCancel = () => {
    onCancel?.()
    onOpenChange?.(false)
  }

  const handleConfirm = async () => {
    await onConfirm?.()
    onOpenChange?.(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            color={destructive ? 'red' : 'black'}
            onClick={handleConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

ConfirmDialog.displayName = 'ConfirmDialog'

export { ConfirmDialog }
