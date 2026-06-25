"use client";
import { CRMDeal } from "@/lib/types/crm.generated";
import { Card, Badge, Avatar, cn } from "@frappe-ui/neobrutalism";
import { motion, useMotionValue, useTransform } from "motion/react";
import { IconFlame, IconSnowflake, IconBrain, IconTrendingUp } from "@tabler/icons-react";
import { useState } from "react";

interface WarfareDealCardProps {
    deal: CRMDeal;
    index: number;
}

export const WarfareDealCard = ({ deal, index }: WarfareDealCardProps) => {
    const [isHovered, setIsHovered] = useState(false);

    // --- 1. Trust Battery Logic (Simulated) ---
    // In a real app, this would come from an engagement score API
    const trustScore = (deal.probability || 0) > 70 ? 'high' : (deal.probability || 0) < 30 ? 'low' : 'neutral';

    const trustColor = {
        high: "shadow-[0_0_15px_rgba(16,185,129,0.5)] border-emerald-500/50", // Green Aura
        low: "shadow-[0_0_10px_rgba(239,68,68,0.4)] border-red-500/30 opacity-90", // Red Aura
        neutral: "border-white/10"
    }[trustScore];

    // --- 2. The Pulse (Hot/Cold Physics) ---
    const isHot = deal.status === "Negotiation" || (deal.probability || 0) > 80;
    const isStalled = deal.status === "Open" && (deal.probability || 0) < 20;

    return (
        <motion.div
            layoutId={deal.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            whileHover={{ scale: 1.02, zIndex: 10 }}
            whileDrag={{ scale: 1.1, zIndex: 50, cursor: "grabbing" }}
            drag
            dragSnapToOrigin
            className="relative mb-3 group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* "Simulated Objection" AI Nudge (Appears on Hover in Negotiation) */}
            {deal.status === "Negotiation" && isHovered && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute -right-64 top-0 z-50 w-60"
                >
                    <div className="bg-black/80 backdrop-blur-md border border-red-500/50 p-3 rounded-lg text-xs text-red-100 shadow-2xl relative">
                        <div className="absolute top-3 -left-2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] border-r-red-500/50 border-b-[6px] border-b-transparent"></div>
                        <div className="flex items-center gap-2 mb-1 text-red-400 font-bold uppercase tracking-widest text-[10px]">
                            <IconBrain size={12} /> Counter-Intel
                        </div>
                        "They will ask about API rate limits. Mention the Enterprise caching layer."
                    </div>
                </motion.div>
            )}

            <Card className={cn(
                "bg-black/40 backdrop-blur-md border relative overflow-hidden transition-all duration-300",
                trustScore === 'high' ? "border-emerald-500/30" : "border-white/5",
                isStalled && "grayscale-[0.5]" // Decay effect for stalled deals
            )}>

                {/* Card Body */}
                <div className="p-4 relative z-10">
                    {/* Header: Value & Status */}
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col">
                            <span className="font-mono text-lg font-bold text-white tracking-tight">
                                ${(deal.expected_deal_value || 0).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                                {deal.lead_name || deal.organization_name}
                            </span>
                        </div>

                        {/* Status Indicator */}
                        <div className="flex items-center gap-1">
                            {isHot && <IconFlame size={14} className="text-orange-500 animate-pulse" />}
                            {isStalled && <IconSnowflake size={14} className="text-blue-300" />}
                        </div>
                    </div>

                    {/* Footer: Trust Battery & Probability */}
                    <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-2">
                            {/* Trust Battery Avatar */}
                            <div className={cn("rounded-full p-[1px] transition-all duration-500", trustColor)}>
                                <Avatar
                                    label={deal.deal_owner || "U"}
                                    size="sm"
                                    className="h-6 w-6 text-[10px]"
                                />
                            </div>
                            {trustScore === 'high' && (
                                <span className="text-[9px] text-emerald-400 font-mono">TRUST: HIGH</span>
                            )}
                        </div>

                        {/* Probability Pill */}
                        <Badge variant="outline" className={cn(
                            "text-[10px] h-5 border-white/10 bg-white/5",
                            (deal.probability || 0) > 50 ? "text-white" : "text-muted-foreground"
                        )}>
                            {deal.probability || 0}%
                        </Badge>
                    </div>
                </div>

                {/* LTV Projector (Compound Interest Graph) - Visible on hover */}
                {isHovered && (
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none">
                        <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[9px] text-emerald-400 font-mono">
                            <IconTrendingUp size={10} /> LTV: ${(deal.expected_deal_value || 0) * 10}
                        </div>
                        {/* Sparkline decoration */}
                        <svg className="absolute bottom-0 left-0 w-full h-10 opacity-30" preserveAspectRatio="none">
                            <path d="M0,40 Q50,40 100,20 T200,0 V40 H0 Z" fill="url(#grad1)" />
                            <defs>
                                <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: 'rgb(16,185,129)', stopOpacity: 0.5 }} />
                                    <stop offset="100%" style={{ stopColor: 'rgb(16,185,129)', stopOpacity: 0 }} />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                )}
            </Card>
        </motion.div>
    );
};
