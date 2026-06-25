'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'

/**
 * AI Studio Mock Provider (Expanded)
 * 
 * This file allows Radical UI components to work in the AI Studio preview environment
 * by mocking the Frappe context and data fetching hooks.
 * It provides high-fidelity mock data and simulates the behavior of the Frappe backend.
 */

// --- Mock Data ---

export const MOCK_LEADS = [
    {
        name: 'LEAD-001',
        lead_name: 'John Doe',
        organization: 'TechCorp Inc',
        lead_temperature: 'Hot',
        engagement_score: 85,
        sentiment: 'Positive',
        modified: new Date().toISOString(),
        status: 'Open',
        email: 'john@techcorp.com',
        days_since_last_activity: 1,
        lead_score: 80,
        decision_timeline: 'Immediate',
        budget_range: '$10k+',
    },
    {
        name: 'LEAD-002',
        lead_name: 'Jane Smith',
        organization: 'StartupXYZ',
        lead_temperature: 'Cold',
        engagement_score: 20,
        sentiment: 'Negative',
        modified: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Open',
        email: 'jane@startup.io',
        days_since_last_activity: 12,
        lead_score: 15,
        decision_timeline: '> 6 Months',
    },
    {
        name: 'LEAD-003',
        lead_name: 'Bob Johnson',
        organization: 'Global Ent',
        lead_temperature: 'Warm',
        engagement_score: 55,
        sentiment: 'Neutral',
        modified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Replied',
        days_since_last_activity: 3,
        lead_score: 50,
        decision_timeline: '1-3 Months',
    }
]

export const MOCK_DEALS = [
    {
        name: 'DEAL-001',
        deal_name: 'Enterprise License',
        organization_name: 'TechCorp Inc',
        expected_deal_value: 50000,
        status: 'Negotiation',
        modified: new Date().toISOString(),
        zoho_invoice_currency: '$',
        probability: 75,
        close_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    }
]

export const MOCK_CONTACTS = [
    {
        name: 'CONT-001',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@techcorp.com',
        phone: '+1234567890',
        organization: 'TechCorp Inc',
        modified: new Date().toISOString(),
    },
    {
        name: 'CONT-002',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@startup.io',
        phone: '+0987654321',
        organization: 'StartupXYZ',
        modified: new Date().toISOString(),
    }
]

export const MOCK_TASKS = [
    {
        name: 'TASK-001',
        title: 'Follow up on Enterprise Deal',
        status: 'Open',
        priority: 'High',
        due_date: new Date().toISOString(),
        modified: new Date().toISOString(),
    },
    {
        name: 'TASK-002',
        title: 'Prepare Demo for Jane',
        status: 'Open',
        priority: 'Medium',
        due_date: new Date(Date.now() + 86400000).toISOString(),
        modified: new Date().toISOString(),
    }
]

export const MOCK_USERS = [
    {
        name: 'Administrator',
        full_name: 'Admin User',
        user_image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
        email: 'admin@example.com',
    },
    {
        name: 'robin@radical.com',
        full_name: 'Robin Ransom',
        user_image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robin',
        email: 'robin@radical.com',
    }
]

export const MOCK_TRENDS = {
    revenue: [
        { date: '2023-01', value: 12000 },
        { date: '2023-02', value: 15000 },
        { date: '2023-03', value: 18000 },
        { date: '2023-04', value: 25000 },
    ],
    leads: [
        { date: '2023-01', count: 45 },
        { date: '2023-02', count: 52 },
        { date: '2023-03', count: 48 },
        { date: '2023-04', count: 70 },
    ]
}

// --- Mock Hooks ---

/**
 * Mock useFrappeList hook
 */
export function useFrappeList<T = any>(options: any) {
    const [data, setData] = useState<T[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isFetching, setIsFetching] = useState(false)

    const fetchData = useCallback(() => {
        setIsFetching(true)
        const timer = setTimeout(() => {
            let mockData: any[] = []
            switch (options.doctype) {
                case 'CRM Lead': mockData = MOCK_LEADS; break;
                case 'CRM Deal': mockData = MOCK_DEALS; break;
                case 'Contact': mockData = MOCK_CONTACTS; break;
                case 'CRM Task': mockData = MOCK_TASKS; break;
                case 'User': mockData = MOCK_USERS; break;
                default: mockData = [];
            }

            // Basic filtering simulation
            if (options.filters) {
                // In a real app, this would filter the data based on options.filters
            }

            setData(mockData as unknown as T[])
            setIsLoading(false)
            setIsFetching(false)
        }, 500)
        return () => clearTimeout(timer)
    }, [options.doctype, JSON.stringify(options.filters)])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return {
        data,
        isLoading,
        isFetching,
        error: null,
        refetch: fetchData,
        next: () => { },
        previous: () => { },
        hasNextPage: false,
        hasPreviousPage: false,
    }
}

/**
 * Mock useFrappeGet / useFrappeDoc hook
 */
export function useFrappeGet<T = any>(method: string, params?: any) {
    const [data, setData] = useState<T | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            if (method === 'frappe.client.get_count') {
                setData(10 as unknown as T)
            } else if (method === 'frappe.client.get_value') {
                setData('Mock Value' as unknown as T)
            } else {
                setData(null)
            }
            setIsLoading(false)
        }, 400)
        return () => clearTimeout(timer)
    }, [method, JSON.stringify(params)])

    return { data, isLoading, error: null }
}

export function useFrappeDoc<T = any>(doctype: string, name: string) {
    const [data, setData] = useState<T | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            let mockData: any = null
            if (doctype === 'CRM Lead') {
                mockData = MOCK_LEADS.find(l => l.name === name) || MOCK_LEADS[0]
            } else if (doctype === 'CRM Deal') {
                mockData = MOCK_DEALS.find(d => d.name === name) || MOCK_DEALS[0]
            }
            setData(mockData as unknown as T)
            setIsLoading(false)
        }, 300)
        return () => clearTimeout(timer)
    }, [doctype, name])

    return { data, isLoading, error: null }
}

/**
 * Mock Mutation Hooks
 */
export function useFrappePost<T = any, V = any>(method: string, options?: any) {
    const [isLoading, setIsLoading] = useState(false)

    const mutate = async (variables: V) => {
        setIsLoading(true)
        console.log(`[Mock Post] ${method}`, variables)
        return new Promise<T>((resolve) => {
            setTimeout(() => {
                setIsLoading(false)
                const result = { message: 'Success', ...variables } as unknown as T
                if (options?.onSuccess) options.onSuccess(result)
                resolve(result)
            }, 800)
        })
    }

    return { mutate, isLoading, error: null }
}

export function useFrappePut<T = any, V = any>(doctype: string, name: string, options?: any) {
    const [isLoading, setIsLoading] = useState(false)

    const mutate = async (variables: V) => {
        setIsLoading(true)
        console.log(`[Mock Put] ${doctype}/${name}`, variables)
        return new Promise<T>((resolve) => {
            setTimeout(() => {
                setIsLoading(false)
                const result = { ...variables } as unknown as T
                if (options?.onSuccess) options.onSuccess(result)
                resolve(result)
            }, 800)
        })
    }

    return { mutate, isLoading, error: null }
}

export function useFrappeDelete(doctype: string, name: string, options?: any) {
    const [isLoading, setIsLoading] = useState(false)

    const mutate = async () => {
        setIsLoading(true)
        console.log(`[Mock Delete] ${doctype}/${name}`)
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                setIsLoading(false)
                if (options?.onSuccess) options.onSuccess()
                resolve()
            }, 800)
        })
    }

    return { mutate, isLoading, error: null }
}

export function useFrappeCall<T = any>(method: string, params?: any, options?: any) {
    const [isLoading, setIsLoading] = useState(false)

    const mutate = async (variables?: any) => {
        setIsLoading(true)
        console.log(`[Mock Call] ${method}`, variables || params)
        return new Promise<T>((resolve) => {
            setTimeout(() => {
                setIsLoading(false)
                const result = { message: 'Success' } as unknown as T
                if (options?.onSuccess) options.onSuccess(result)
                resolve(result)
            }, 800)
        })
    }

    return { mutate, isLoading, error: null }
}

/**
 * Mock Auth Hook
 */
export function useFrappeAuth() {
    return {
        currentUser: 'Administrator',
        isLoading: false,
        error: null,
        logout: () => console.log('[Mock] Logout'),
        login: (u: string, p: string) => console.log('[Mock] Login', u),
    }
}

/**
 * Advanced AI Recommendation Hook (Ported from useAIRecommendation.ts)
 */
export function useAIRecommendation(lead: any) {
    return useMemo(() => {
        if (!lead) return { action: null, reason: 'No lead data available', confidence: 0 }

        // Logic from useAIRecommendation.ts ported here:
        if (lead.lead_temperature === 'Hot' && lead.days_since_last_activity < 2) {
            return { action: 'call', reason: `Hot lead with recent activity. Strike while the iron is hot!`, confidence: 95 }
        }

        if (lead.engagement_score > 70) {
            return { action: 'call', reason: `High engagement score (${lead.engagement_score}/100). Lead is actively interested.`, confidence: 88 }
        }

        if (lead.sentiment === 'Negative') {
            return { action: 'task', reason: 'Negative sentiment detected. Review interaction history to salvage deal.', confidence: 75 }
        }

        if (lead.decision_timeline === 'Immediate') {
            return { action: 'meeting', reason: 'Decision timeline is immediate. Book a meeting to accelerate.', confidence: 90 }
        }

        return { action: 'email', reason: 'Maintain relationship with periodic check-in.', confidence: 60 }
    }, [lead])
}

// Support functions for AI Studio components
export function calculateLeadScore(lead: any): number {
    let score = lead.lead_score || 0
    if (lead.lead_temperature === 'Hot') score += 20
    if (lead.sentiment === 'Positive') score += 10
    return Math.min(100, score)
}

export function getLeadPriorityLabel(lead: any): { label: string, color: 'red' | 'yellow' | 'blue' | 'purple' | 'black' } {
    const score = calculateLeadScore(lead)
    if (score >= 80) return { label: 'CRITICAL', color: 'red' }
    if (score >= 60) return { label: 'HIGH', color: 'purple' }
    if (score >= 40) return { label: 'MEDIUM', color: 'yellow' }
    if (score >= 20) return { label: 'LOW', color: 'blue' }
    return { label: 'NURTURE', color: 'black' }
}

export function useMultiActionRecommendations(lead: any): any[] {
    return useMemo(() => {
        if (!lead) return []
        const recs = []
        if (lead.lead_temperature === 'Hot') recs.push({ action: 'call', reason: 'High heat', confidence: 95 })
        if (lead.email) recs.push({ action: 'email', reason: 'Re-engage', confidence: 80 })
        if (lead.status === 'Open') recs.push({ action: 'task', reason: 'Follow up', confidence: 70 })
        return recs.slice(0, 3)
    }, [lead])
}

// --- Provider ---

const MockContext = createContext({})

export function RadicalMockProvider({ children }: { children: React.ReactNode }) {
    return (
        <MockContext.Provider value={{}}>
            <div className="radical-theme dark bg-black min-h-screen text-white font-sans selection:bg-purple-500 selection:text-white">
                <style jsx global>{`
                    :root {
                        --radius: 0rem;
                        --vanta-black: #000000;
                        --neo-pink: #ff00ff;
                        --neo-cyan: #00ffff;
                        --neo-yellow: #ffff00;
                    }
                    
                    .radical-theme {
                        --background: 0 0% 0%;
                        --foreground: 0 0% 100%;
                    }

                    ::selection {
                        background: #a855f7;
                        color: white;
                    }

                    /* Custom Scrollbar for Vantablack look */
                    ::-webkit-scrollbar {
                        width: 8px;
                        height: 8px;
                    }
                    ::-webkit-scrollbar-track {
                        background: #000;
                    }
                    ::-webkit-scrollbar-thumb {
                        background: #222;
                        border: 1px solid #333;
                    }
                    ::-webkit-scrollbar-thumb:hover {
                        background: #333;
                    }
                `}</style>
                {children}
            </div>
        </MockContext.Provider>
    )
}

export const useMockContext = () => useContext(MockContext)
