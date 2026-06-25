import { useCallback } from 'react'

interface ToastOptions {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

export function useToast() {
  const showToast = useCallback((options: ToastOptions) => {
    // For now, using console and window.alert as fallback
    // You can replace this with your preferred toast library (react-hot-toast, sonner, etc.)

    const { type, message, duration = 3000 } = options

    // Console log for debugging
    console.log(`[${type.toUpperCase()}]:`, message)

    // Simple implementation using browser notifications
    // TODO: Replace with a proper toast library
    if (typeof window !== 'undefined') {
      // You can integrate with react-hot-toast, sonner, or any other toast library here
      // For now, using a simple alert for critical errors
      if (type === 'error') {
        alert(message)
      } else {
        // Create a simple toast element (temporary solution)
        const toast = document.createElement('div')
        toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg border-3 border-border shadow-brutal z-50 ${
          type === 'success'
            ? 'bg-green-100 text-green-800 border-green-500'
            : type === 'error'
            ? 'bg-red-100 text-red-800 border-red-500'
            : type === 'warning'
            ? 'bg-yellow-100 text-yellow-800 border-yellow-500'
            : 'bg-blue-100 text-blue-800 border-blue-500'
        }`
        toast.textContent = message
        document.body.appendChild(toast)

        setTimeout(() => {
          toast.remove()
        }, duration)
      }
    }
  }, [])

  return { showToast }
}
