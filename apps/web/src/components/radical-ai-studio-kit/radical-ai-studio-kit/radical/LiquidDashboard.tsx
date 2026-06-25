
import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import {
    BentoGrid,
    BentoGridItem,
    ColourfulText,
    Button,
    Badge,
    SparklesCore,
    AnimatedTooltip,
    Card,
    ListView,
    ListHeader,
    ListHeaderItem,
    ListRows,
    ListRow,
    ListRowItem,
} from '@frappe-ui/neobrutalism'
import {
    IconBriefcase,
    IconPhoneCall,
    IconMailForward,
    IconSignature,
    IconTableColumn,
    IconArrowRight,
    IconCoffee,
    IconCheck,
    IconTrendingUp,
    IconAlertTriangle,
    IconSparkles,
    IconUser
} from '@tabler/icons-react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { cn } from '@frappe-ui/neobrutalism'
import { CRMLead, CRMDeal } from '@/lib/types/crm.generated'

// Types for our "Intent Engine"
type DashboardMode = 'morning_prep' | 'focus_execution' | 'eod_wrapup'

interface LiquidDashboardProps {
    stats: {
        leads: number;
        deals: number;
        organizations: number;
    };
    recentLeads: CRMLead[];
    highValueDeal?: CRMDeal;
    statsError?: string | null;
    leadsLoading?: boolean;
}

export function LiquidDashboard({
    stats,
    recentLeads,
    highValueDeal,
    statsError,
    leadsLoading = false
}: LiquidDashboardProps) {
    const { user } = useAuth()
    const [mode, setMode] = useState<DashboardMode>('morning_prep')

    const greetingName = useMemo(() => {
        return user?.full_name?.split(' ')[0] || 'Leader'
    }, [user?.full_name])

    // --- Dynamic Content based on Mode ---

    const getHeaderTitle = () => {
        switch (mode) {
            case 'morning_prep': return <span>Good Morning, <ColourfulText text={greetingName} /></span>
            case 'focus_execution': return <span>Focus Mode: <span className="text-purple-600">High Impact</span></span>
            case 'eod_wrapup': return <span>Daily Score: <span className="text-green-600">Crushed It</span></span>
        }
    }

    const getSubtext = () => {
        switch (mode) {
            case 'morning_prep': return "Here is your game plan to close $45k today."
            case 'focus_execution': return "3 Leads are requesting action right now."
            case 'eod_wrapup': return "You closed 2 deals today. Time to log off?"
        }
    }

    // --- Widgets ---

    const HighImpactCard = () => {
        if (!highValueDeal) {
            return (
                <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 relative overflow-hidden flex items-center justify-center text-center">
                    <div className="z-10">
                        <IconCheck size={48} className="text-green-500 mx-auto mb-2" />
                        <h3 className="text-xl font-bold">All clear!</h3>
                        <p className="text-neutral-500 text-sm">No critical deals pending.</p>
                        <Button asChild className="mt-4" size="sm">
                            <Link href="/deals/new">Create Deal</Link>
                        </Button>
                    </div>
                </div>
            )
        }

        return (
            <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <IconTrendingUp size={80} />
                </div>

                <div className="flex flex-col justify-between h-full z-10 relative">
                    <div>
                        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 mb-2">
                            <IconAlertTriangle size={12} className="mr-1" /> HIGH VALUE PRIORITY
                        </Badge>
                        <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 truncate" title={highValueDeal.name}>
                            Close {highValueDeal.name}
                        </h3>
                        <p className="text-neutral-500 mt-1">{highValueDeal.organization_name || 'Prospect'}</p>
                        <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-sm text-purple-800 dark:text-purple-200 border border-purple-100 dark:border-purple-800">
                            "Potential Value: <strong>{highValueDeal.zoho_invoice_currency || '$'}{highValueDeal.expected_deal_value?.toLocaleString()}</strong>. Follow up now to secure the win."
                        </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2">
                        <div className="flex gap-2">
                            <Button asChild className="flex-1 bg-neutral-900 text-white hover:bg-neutral-800 shadow-lg hover:shadow-xl transition-all">
                                <Link href={`/deals/${highValueDeal.name}`}>
                                    <IconArrowRight size={16} className="mr-2" /> View Deal
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const BriefingCard = () => (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-100 to-white dark:from-neutral-900 dark:to-neutral-800 p-4 border border-neutral-200 dark:border-neutral-800 relative overflow-hidden flex flex-col justify-between">
            {/* Background Sparkles Effect for 'Morning' vibe */}
            {mode === 'morning_prep' && (
                <div className="absolute -top-10 -right-10 w-32 h-32 opacity-50">
                    <SparklesCore
                        minSize={1}
                        maxSize={5}
                        particleDensity={20}
                        className="w-full h-full"
                        background="transparent"
                        particleColor="#FB923C"
                    />
                </div>
            )}

            {/* Metric 1 */}
            <div className="z-10 relative">
                <div className="text-5xl font-black text-neutral-800 dark:text-neutral-100 tracking-tighter">
                    {stats.leads}
                </div>
                <div className="font-bold text-neutral-500 uppercase tracking-widest text-xs mt-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" /> Active Leads
                </div>
            </div>

            {/* Metric 2 */}
            <div className="z-10 relative">
                <div className="text-4xl font-black text-neutral-800 dark:text-neutral-100 tracking-tighter opacity-80">
                    {stats.deals}
                </div>
                <div className="font-bold text-neutral-500 uppercase tracking-widest text-xs mt-1">
                    Open Deals
                </div>
            </div>
        </div>
    )

    const WinCard = () => (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
            {/* Subtle confetti effect or just sparkles */}
            <div className="absolute inset-0 pointer-events-none opacity-50">
                <SparklesCore
                    minSize={2}
                    maxSize={4}
                    particleDensity={30}
                    className="w-full h-full"
                    background="transparent"
                    particleColor="#22c55e"
                />
            </div>

            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4 z-10">
                <IconCheck size={32} />
            </div>
            <h3 className="text-xl font-bold text-green-900 dark:text-green-100 z-10">Daily Goal Met</h3>
            <p className="text-green-700 dark:text-green-300 text-sm mt-2 z-10">Your pipeline is looking solid.</p>
        </div>
    )

    const RecentLeadsWidget = () => (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 relative overflow-hidden flex flex-col">
            <div className="p-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50">
                <h3 className="text-sm font-bold text-neutral-600 flex items-center gap-2">
                    <IconUser size={14} /> Recent Leads
                </h3>
            </div>
            <div className="overflow-auto flex-1 p-0">
                {recentLeads.length === 0 ? (
                    <div className="p-4 text-center text-sm text-neutral-400 mt-4">No recent leads found.</div>
                ) : (
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {recentLeads.slice(0, 5).map(lead => (
                            <Link key={lead.name} href={`/leads/${lead.name}`} className="flex items-center justify-between p-3 hover:bg-neutral-50 transition-colors group">
                                <div>
                                    <div className="font-medium text-sm group-hover:text-purple-600 transition-colors">
                                        {(lead.first_name || lead.last_name) ? `${lead.first_name} ${lead.last_name}` : lead.name}
                                    </div>
                                    <div className="text-xs text-neutral-400">{lead.organization || 'No Org'}</div>
                                </div>
                                <Badge color="gray" size="sm" variant="outline">{lead.status || 'New'}</Badge>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
            <div className="p-2 border-t border-neutral-100 bg-neutral-50/30">
                <Button asChild variant="ghost" size="sm" className="w-full text-xs">
                    <Link href="/leads">View All Leads</Link>
                </Button>
            </div>
        </div>
    )

    // --- Grid Construction based on Intent ---

    const getGridItems = () => {
        const common = [
            {
                title: "Quick Actions",
                description: "Start a workflow.",
                header: <SkeletonActions mode={mode} />,
                className: "md:col-span-1",
                icon: <IconTableColumn className="h-4 w-4 text-neutral-500" />,
            },
            {
                title: "Team Activity",
                description: "Who's online.",
                header: <SkeletonTeamActivity />,
                className: "md:col-span-1",
                icon: <IconTrendingUp className="h-4 w-4 text-neutral-500" />,
            }
        ]

        if (mode === 'morning_prep') {
            return [
                {
                    title: "Morning Brief",
                    description: "Your daily vitals.",
                    header: <BriefingCard />,
                    className: "md:col-span-1",
                    icon: <IconCoffee className="h-4 w-4 text-neutral-500" />
                },
                {
                    title: "High Impact Priority",
                    description: "AI identified 1 critical action.",
                    header: <HighImpactCard />,
                    className: "md:col-span-2",
                    icon: <IconAlertTriangle className="h-4 w-4 text-red-500" />
                },
                ...common
            ]
        }

        if (mode === 'focus_execution') {
            return [
                {
                    title: "Active Power Hour",
                    description: "High Value Focus.",
                    header: <HighImpactCard />, // Takes prominent spot
                    className: "md:col-span-2",
                    icon: <IconPhoneCall className="h-4 w-4 text-purple-500" />
                },
                ...common,
                {
                    title: "Recent Leads",
                    description: "Latest Inbound.",
                    header: <RecentLeadsWidget />,
                    className: "md:col-span-1",
                    icon: <IconUser className="h-4 w-4 text-neutral-500" />
                },
            ]
        }

        // EOD Wrap up
        return [
            {
                title: "Day Summary",
                description: "Great work today.",
                header: <WinCard />,
                className: "md:col-span-1",
                icon: <IconCheck className="h-4 w-4 text-green-500" />
            },
            ...common,
            {
                title: "Recent Activity",
                description: "Leads Overview.",
                header: <RecentLeadsWidget />,
                className: "md:col-span-2",
                icon: <IconBriefcase className="h-4 w-4 text-neutral-500" />
            }
        ]
    }


    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-neutral-900 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-neutral-900 dark:text-neutral-100">
                            {getHeaderTitle()}
                        </h1>
                        <p className="mt-2 text-xl text-neutral-500 font-medium">
                            {getSubtext()}
                        </p>
                    </div>

                    {/* Mode Switcher for Demo Purposes */}
                    <div className="flex bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg p-1 shadow-sm">
                        <button
                            onClick={() => setMode('morning_prep')}
                            className={cn("px-4 py-2 rounded-md text-sm font-bold transition-colors", mode === 'morning_prep' ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white" : "text-neutral-500 hover:text-neutral-700")}
                        >
                            Morning
                        </button>
                        <button
                            onClick={() => setMode('focus_execution')}
                            className={cn("px-4 py-2 rounded-md text-sm font-bold transition-colors", mode === 'focus_execution' ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white" : "text-neutral-500 hover:text-neutral-700")}
                        >
                            Focus
                        </button>
                        <button
                            onClick={() => setMode('eod_wrapup')}
                            className={cn("px-4 py-2 rounded-md text-sm font-bold transition-colors", mode === 'eod_wrapup' ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white" : "text-neutral-500 hover:text-neutral-700")}
                        >
                            Wrap Up
                        </button>
                    </div>
                </div>

                {/* The Fluid Grid */}
                <BentoGrid className="mx-auto max-w-7xl gap-3">
                    {getGridItems().map((item, i) => (
                        <BentoGridItem
                            key={i}
                            title={item.title}
                            description={item.description}
                            header={item.header}
                            className={item.className}
                            icon={item.icon}
                        />
                    ))}
                </BentoGrid>
            </div>
        </div>
    );
}

// --- Generic Skeletons ---

const SkeletonTeamActivity = () => {
    const { user } = useAuth();

    // Mock Team Data for Tooltips
    const people = [
        // Current User (Dynamic)
        {
            id: 0,
            name: user?.full_name || "You",
            designation: "Sales Rep",
            image: user?.user_image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
        },
        {
            id: 1,
            name: "Sarah Williams",
            designation: "VP of Sales",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
        },
        {
            id: 2,
            name: "John Doe",
            designation: "Sales Manager",
            image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3387&q=80",
        },
        {
            id: 3,
            name: "Jane Smith",
            designation: "Data Scientist",
            image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
        },
        {
            id: 4,
            name: "Emily Davis",
            designation: "UX Designer",
            image: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3534&q=80",
        },
        {
            id: 5,
            name: "Tyler Durden",
            designation: "Soap Maker",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3540&q=80",
        },
    ];

    return (
        // REMOVED 'overflow-hidden' to allow tooltips to pop out!
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3 relative items-center justify-center">
            <div className="flex flex-row items-center justify-center w-full z-20">
                <AnimatedTooltip items={people} />
            </div>
            <div className="absolute bottom-2 right-2 text-[10px] text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1 z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" /> 6 Online
            </div>
        </div>
    );
};

const SkeletonActions = ({ mode }: { mode: 'morning_prep' | 'focus_execution' | 'eod_wrapup' }) => {
    // Determine actions based on context
    const actions = mode === 'focus_execution'
        ? [
            { label: 'Log Call', href: '#', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100', icon: IconPhoneCall },
            { label: 'Add Note', href: '#', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100', icon: IconSignature },
        ]
        : [
            { label: 'Lead', href: '/leads/new', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100', icon: IconBriefcase },
            { label: 'Deal', href: '/deals/new', color: 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100', icon: IconTableColumn },
        ]

    return (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3">
            <div className="grid grid-cols-2 gap-3 w-full h-full items-center">
                {actions.map((action) => (
                    <Link
                        key={action.label}
                        href={action.href}
                        className={cn(
                            "flex flex-col items-center justify-center p-2 rounded-lg hover:scale-[1.02] transition-all h-full max-h-24 border group",
                            action.color
                        )}
                    >
                        <action.icon className="mb-2 opacity-70 group-hover:opacity-100 transition-opacity" size={24} />
                        <span className="font-bold text-xs uppercase tracking-wide">{mode === 'focus_execution' ? action.label : `New ${action.label}`}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};
