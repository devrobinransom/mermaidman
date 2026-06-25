import { useQuery, UseQueryOptions, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'

export interface ListOptions {
    doctype: string
    fields?: string[]
    filters?: Record<string, any>
    orderBy?: string
    start?: number
    pageLength?: number
    /**
     * @deprecated use enabled option in useQuery
     */
    auto?: boolean
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

export function useFrappeList<T = any>(
    options: ListOptions,
    queryOptions?: Omit<UseQueryOptions<T[], Error, T[], any[]>, 'queryKey' | 'queryFn'>
) {
    const {
        doctype,
        fields = ['*'],
        filters = {},
        orderBy = 'modified desc',
        start = 0,
        pageLength = 20,
        auto = true
    } = options

    // Pagination state
    const [currentStart, setCurrentStart] = useState(start)

    // Reset pagination when filters change (optional but recommended)
    // useEffect(() => {
    //     setCurrentStart(0)
    // }, [JSON.stringify(filters)])

    const queryKey = [doctype, 'list', JSON.stringify(filters), JSON.stringify(fields), orderBy, currentStart, pageLength]

    const fetchList = async () => {
        const params: Record<string, any> = {
            doctype,
            fields: JSON.stringify(fields),
            filters: JSON.stringify(filters),
            order_by: orderBy,
            start: currentStart,
            page_length: pageLength,
        }

        const queryString = new URLSearchParams(params).toString()

        const response = await fetch(
            `/api/frappe/resource/${encodeURIComponent(doctype)}?${queryString}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Frappe-CSRF-Token': getCsrfToken(),
                },
            }
        )

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const responseData = await response.json()
        return responseData.data || responseData.message || []
    }

    const query = useQuery({
        queryKey,
        queryFn: fetchList,
        enabled: auto && !!doctype,
        ...queryOptions
    })

    const next = useCallback(() => {
        setCurrentStart(prev => prev + pageLength)
    }, [pageLength])

    const previous = useCallback(() => {
        setCurrentStart(prev => Math.max(0, prev - pageLength))
    }, [pageLength])

    const hasNextPage = (query.data || []).length >= pageLength
    const hasPreviousPage = currentStart > 0

    // Compatibility layer for useList signature
    return {
        data: query.data || [],
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error,
        refetch: query.refetch,
        next,
        previous,
        hasNextPage,
        hasPreviousPage,
    }
}
