"use client";
import React, { useState } from "react";
import { CRMDeal } from "@/lib/types/crm.generated";
import { WarfareDealCard } from "./WarfareDealCard";
import { motion, AnimatePresence } from "motion/react";
import { Card, cn, Button } from "@frappe-ui/neobrutalism";
import { IconCpu } from "@tabler/icons-react";

const DEMO_DEALS: CRMDeal[] = [
    {
        name: "DEAL-SIM-001",
        doctype: "CRM Deal",
        status: "Negotiation",
        expected_deal_value: 5000000,
        expected_closure_date: "2026-12-31",
        currency: "USD",
        probability: 85,
        lead_name: "Bruce Wayne",
        deal_owner: "Robin Ransom",
        organization_name: "Wayne Enterprises",
        owner: "Administrator",
        creation: "2026-01-01",
        modified: "2026-01-10",
        modified_by: "Administrator",
        docstatus: 0,
        idx: 0
    },
    {
        name: "DEAL-SIM-002",
        doctype: "CRM Deal",
        status: "Proposal",
        expected_deal_value: 12500000,
        expected_closure_date: "2026-11-15",
        currency: "USD",
        probability: 60,
        lead_name: "Tony Stark",
        deal_owner: "Pepper Potts",
        organization_name: "Stark Ind",
        owner: "Administrator",
        creation: "2026-01-01",
        modified: "2026-01-10",
        modified_by: "Administrator",
        docstatus: 0,
        idx: 0
    },
    {
        name: "DEAL-SIM-003",
        doctype: "CRM Deal",
        status: "Qualification",
        expected_deal_value: 750000,
        expected_closure_date: "2026-10-31",
        currency: "USD",
        probability: 20,
        lead_name: "Norman Osborn",
        deal_owner: "Harry",
        organization_name: "Oscorp",
        owner: "Administrator",
        creation: "2026-01-01",
        modified: "2026-01-10",
        modified_by: "Administrator",
        docstatus: 0,
        idx: 0
    },
    {
        name: "DEAL-SIM-004",
        doctype: "CRM Deal",
        status: "Open",
        expected_deal_value: 0,
        expected_closure_date: "2027-01-01",
        currency: "USD",
        probability: 10,
        lead_name: "Miles Dyson",
        organization_name: "Cyberdyne Systems",
        owner: "Administrator",
        creation: "2026-01-01",
        modified: "2026-01-10",
        modified_by: "Administrator",
        docstatus: 0,
        idx: 0
    },
    {
        name: "DEAL-SIM-005",
        doctype: "CRM Deal",
        status: "Closed Won",
        expected_deal_value: 2000000,
        expected_closure_date: "2026-06-01",
        currency: "USD",
        probability: 100,
        lead_name: "Eldon Tyrell",
        organization_name: "Tyrell Corp",
        owner: "Administrator",
        creation: "2026-01-01",
        modified: "2026-01-10",
        modified_by: "Administrator",
        docstatus: 0,
        idx: 0
    }
];

interface WarRoomBoardProps {
    deals: CRMDeal[];
}

const COLUMNS = [
    { id: "Open", title: "Open", color: "border-white/10" },
    { id: "Qualification", title: "Qualify", color: "border-blue-500/20" },
    { id: "Proposal", title: "Proposal", color: "border-purple-500/20" },
    { id: "Negotiation", title: "Negotiation", color: "border-orange-500/20" },
    { id: "Closed Won", title: "Victory", color: "border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.1)]" },
];

export function WarRoomBoard({ deals: initialDeals }: WarRoomBoardProps) {
    const [isSimulating, setIsSimulating] = useState(false);
    const deals = isSimulating ? DEMO_DEALS : initialDeals;

    // Group deals by status
    const getDealsByStatus = (status: string) => deals.filter(d => (d.status || "Open") === status);

    // Calculate Total Pipeline Value (The Scoreboard)
    const totalPipeline = deals.reduce((acc, curr) => acc + (curr.expected_deal_value || 0), 0);

    // "Velocity" Metric (Simulated for now)
    const velocity = deals.filter(d => d.status === "Closed Won").length * 120; // 120 speed points per win

    return (
        <div className="flex flex-col h-full w-full bg-[#050505]">

            {/* --- TOP HUD: Arcade Scoreboard --- */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-40">
                <div className="flex items-center gap-6">
                    <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-500 uppercase tracking-tighter">
                        War Room
                    </h2>
                    {/* Pipeline Ticker */}
                    <div className="flex flex-col">
                        <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">Total Pipeline</span>
                        <span className="font-mono text-2xl text-emerald-400 font-bold glow-text">
                            ${totalPipeline.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Velocity Meter */}
                <div className="flex items-center gap-6">
                    <Button
                        variant={isSimulating ? "solid" : "outline"}
                        color={isSimulating ? "purple" : "gray"}
                        onClick={() => setIsSimulating(!isSimulating)}
                        className="font-mono text-xs"
                    >
                        <IconCpu size={14} className="mr-2" />
                        {isSimulating ? "SIMULATION ACTIVE" : "RUN SIMULATION"}
                    </Button>

                    <div className="flex items-center gap-2">
                        <div className="text-right">
                            <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">Deal Velocity</div>
                            <div className="font-mono text-lg text-cyan-400 font-bold">{velocity} MPH</div>
                        </div>
                        {/* Visual Speedometer (Simple) */}
                        <div className="h-8 w-2 bg-gradient-to-t from-transparent via-cyan-500 to-white rounded-full animate-pulse" />
                    </div>
                </div>
            </div>

            {/* --- 3D KANBAN BOARD --- */}
            <div className="flex-1 overflow-x-auto p-6">
                <div className="flex gap-4 h-full min-w-max">
                    {COLUMNS.map((col) => (
                        <div key={col.id} className="w-80 flex flex-col h-full">
                            {/* Column Header */}
                            <div className="mb-3 px-2 flex justify-between items-end">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    {col.title}
                                </span>
                                <span className="text-[10px] font-mono text-emerald-500/50">
                                    {getDealsByStatus(col.id).length} UNITS
                                </span>
                            </div>

                            {/* Column Body (Glass Pane) */}
                            <div className={cn(
                                "flex-1 rounded-xl border bg-white/[0.02] backdrop-blur-sm p-2 transition-colors duration-500",
                                col.color
                            )}>
                                {/* Deals List */}
                                <div className="space-y-3">
                                    <AnimatePresence>
                                        {getDealsByStatus(col.id).map((deal, idx) => (
                                            <WarfareDealCard key={deal.name} deal={deal} index={idx} />
                                        ))}
                                    </AnimatePresence>

                                    {/* Empty State Ghost */}
                                    {getDealsByStatus(col.id).length === 0 && (
                                        <div className="h-24 rounded-lg border border-dashed border-white/5 flex items-center justify-center">
                                            <span className="text-[10px] text-white/10 font-mono">NO SIGNAL</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Add global style for text glow
const glowStyle = `
            .glow-text {
                text-shadow: 0 0 10px rgba(16,185,129,0.5);
  }
            `;
