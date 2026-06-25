import { useQuery, useMutation, UseMutationOptions } from '@tanstack/react-query'

interface FrappeResponse<T> {
    message: T
}

// Helper to get CSRF token
function getCsrfToken(): string {
    if (typeof document === 'undefined') return ''
    const cookieName = 'csrf_token'
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=')
        if (name === cookieName) {
            return decodeURIComponent(value)
        }
    }
    return ''
}


// READ-ONLY calls (idempotent)
export function useFrappeGet<T = any>(
    method: string,
    params?: Record<string, any>,
    enabled = true
) {
    return useQuery({
        queryKey: [method, JSON.stringify(params)],
        queryFn: async () => {
            const response = await fetch(`/api/method/${method}`, {
                method: 'POST', // Frappe often uses POST for everything, but strictly GET calls can use GET
                headers: {
                    'Content-Type': 'application/json',
                    'X-Frappe-CSRF-Token': getCsrfToken(),
                },
                body: JSON.stringify(params || {})
            })
            if (!response.ok) throw new Error('Network response was not ok')
            const data = await response.json()
            return (data.message ?? data) as T
        },
        enabled
    })
}

// WRITE calls (mutations)
export function useFrappePost<T = any, V = any>(
    method: string,
    options?: UseMutationOptions<T, Error, V>
) {
    return useMutation({
        mutationFn: async (variables: V) => {
            const response = await fetch(`/api/method/${method}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Frappe-CSRF-Token': getCsrfToken(),
                },
                body: JSON.stringify(variables || {})
            })
            if (!response.ok) throw new Error('Network response was not ok')
            const data = await response.json()
            return (data.message ?? data) as T
        },
        ...options
    })
}
