"use client";

import React from "react";
import { CRMDeal } from "@/lib/types/crm.generated";
import { DecayingDealCard, calculateDaysSinceActivity } from "./DecayingDealCard";
import { Card, cn } from "@frappe-ui/neobrutalism";
import { IconFlame } from "@tabler/icons-react";

/**
 * Demo component showcasing decay physics across different time periods
 *
 * This visualization shows how deals decay over time:
 * - Day 0-2: Fresh (no decay)
 * - Day 3-6: Warming up (subtle desaturation)
 * - Day 7-9: Aging (red border appears)
 * - Day 10-14: Stale (pulsing alert icon)
 * - Day 15+: Critical (skull icon, heavy decay)
 */
export function DecayPhysicsDemo() {
  const now = new Date();

  // Generate demo deals at different decay stages
  const demoDeals: Array<{ deal: CRMDeal; daysAgo: number }> = [
    { daysAgo: 0, deal: createDemoDeal("Today", 0) },
    { daysAgo: 3, deal: createDemoDeal("3 Days Ago", 3) },
    { daysAgo: 7, deal: createDemoDeal("7 Days Ago (Red Border)", 7) },
    { daysAgo: 10, deal: createDemoDeal("10 Days Ago (Alert)", 10) },
    { daysAgo: 15, deal: createDemoDeal("15 Days Ago (Critical)", 15) },
    { daysAgo: 30, deal: createDemoDeal("30 Days Ago (Maximum Decay)", 30) },
  ];

  function createDemoDeal(label: string, daysAgo: number): CRMDeal {
    const activityDate = new Date(now);
    activityDate.setDate(activityDate.getDate() - daysAgo);

    return {
      name: `DECAY-DEMO-${daysAgo}`,
      doctype: "CRM Deal",
      status: "Proposal",
      expected_deal_value: 100000,
      expected_closure_date: "2026-12-31",
      currency: "USD",
      probability: Math.max(10, 90 - daysAgo * 5),
      lead_name: label,
      deal_owner: "Sales Team",
      organization_name: `Demo Corp ${daysAgo}d`,
      modified: activityDate.toISOString(),
      owner: "Administrator",
      creation: activityDate.toISOString(),
      modified_by: "Administrator",
      docstatus: 0,
      idx: 0,
    };
  }

  return (
    <div className="w-full min-h-screen bg-[#050505] p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <IconFlame size={32} className="text-orange-500" />
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">
            Decay Physics Visualization
          </h1>
        </div>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Deals physically decay over time when left inactive. Visual degradation
          includes opacity reduction, desaturation, contrast loss, red border warnings,
          and pulsing alert icons. Hover over cards to see decay metrics.
        </p>
      </div>

      {/* Demo Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {demoDeals.map(({ deal, daysAgo }) => (
          <div key={deal.name} className="flex flex-col gap-2">
            {/* Stage Label */}
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {daysAgo === 0 ? "Fresh" : `${daysAgo} Days Inactive`}
              </span>
              <span
                className={cn(
                  "text-[10px] font-mono px-2 py-0.5 rounded",
                  daysAgo === 0 && "bg-emerald-500/20 text-emerald-400",
                  daysAgo > 0 && daysAgo < 7 && "bg-yellow-500/20 text-yellow-400",
                  daysAgo >= 7 && daysAgo < 10 && "bg-orange-500/20 text-orange-400",
                  daysAgo >= 10 && daysAgo < 15 && "bg-red-500/20 text-red-400",
                  daysAgo >= 15 && "bg-red-900/40 text-red-300"
                )}
              >
                {daysAgo === 0 && "ACTIVE"}
                {daysAgo > 0 && daysAgo < 7 && "WARM"}
                {daysAgo >= 7 && daysAgo < 10 && "AGING"}
                {daysAgo >= 10 && daysAgo < 15 && "STALE"}
                {daysAgo >= 15 && "CRITICAL"}
              </span>
            </div>

            {/* Decaying Card */}
            <DecayingDealCard deal={deal} lastActivityDate={deal.modified}>
              <DemoCardContent deal={deal} daysAgo={daysAgo} />
            </DecayingDealCard>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="max-w-7xl mx-auto mt-12 p-6 bg-black/40 border border-white/10 rounded-lg backdrop-blur-md">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
          Decay Physics Legend
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div>
            <strong className="text-white">Opacity:</strong> Decreases from 100% to
            50% (max 50% reduction)
          </div>
          <div>
            <strong className="text-white">Saturation:</strong> Decreases from 100%
            to 30% (desaturate effect)
          </div>
          <div>
            <strong className="text-white">Contrast:</strong> Decreases from 100% to
            60%
          </div>
          <div>
            <strong className="text-white">Red Border:</strong> Appears after 7 days,
            pulsing glow
          </div>
          <div>
            <strong className="text-white">Alert Icon:</strong> Pulsing warning after
            10 days
          </div>
          <div>
            <strong className="text-white">Skull Icon:</strong> Critical state after
            15 days
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Simple card content for demo purposes
 */
function DemoCardContent({
  deal,
  daysAgo,
}: {
  deal: CRMDeal;
  daysAgo: number;
}) {
  return (
    <Card className="bg-black/40 backdrop-blur-md border border-white/10">
      <div className="p-4">
        {/* Value */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-col">
            <span className="font-mono text-lg font-bold text-white tracking-tight">
              ${(deal.expected_deal_value || 0).toLocaleString()}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
              {deal.lead_name}
            </span>
          </div>
          <div className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-mono text-white/60">
            {deal.probability}%
          </div>
        </div>

        {/* Organization */}
        <div className="text-xs text-muted-foreground">
          {deal.organization_name}
        </div>

        {/* Status */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] text-white/40 uppercase tracking-wider">
            {deal.status}
          </span>
          <span className="text-[9px] text-white/30 font-mono">
            {daysAgo === 0 ? "Active Now" : `Last activity: ${daysAgo}d ago`}
          </span>
        </div>
      </div>
    </Card>
  );
}
